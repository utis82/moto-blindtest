import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import {
  validateGameConfiguration,
  GAME_CONSTRAINTS,
  type FieldName,
} from "../../../shared/gameConstraints";
import {
  calculateRoundScore,
  type FieldAnswerInput,
  type RoundScoreResult,
} from "../../../services/multiplayerScoring";
import { qcmCache } from "../../../services/qcmOptionsCache";
import type { MotoAnswer } from "../../../services/scoring";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/game-session/create
 * Crée une nouvelle session de jeu avec les joueurs
 */
router.post("/create", async (req, res) => {
  try {
    const { playerNames, totalRounds } = req.body;

    // Validation des inputs
    if (!Array.isArray(playerNames) || playerNames.length === 0) {
      return res.status(400).json({
        error: "playerNames doit être un tableau non vide",
      });
    }

    if (
      !totalRounds ||
      typeof totalRounds !== "number" ||
      totalRounds < GAME_CONSTRAINTS.MIN_ROUNDS
    ) {
      return res.status(400).json({
        error: `totalRounds doit être un nombre >= ${GAME_CONSTRAINTS.MIN_ROUNDS}`,
      });
    }

    // Filtrer les noms vides et limiter à MAX_PLAYERS
    const validNames = playerNames
      .map((name) => String(name).trim())
      .filter((name) => name.length > 0)
      .slice(0, GAME_CONSTRAINTS.MAX_PLAYERS);

    if (validNames.length === 0) {
      return res.status(400).json({
        error: "Au moins un nom de joueur valide est requis",
      });
    }

    // Valider la configuration
    const validation = validateGameConfiguration(
      validNames.length,
      totalRounds
    );
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Créer la session et les joueurs
    const session = await prisma.gameSession.create({
      data: {
        totalRounds,
        status: "SETUP",
        players: {
          create: validNames.map((name, index) => ({
            name,
            position: index + 1,
          })),
        },
      },
      include: {
        players: {
          orderBy: { position: "asc" },
        },
      },
    });

    return res.json({
      sessionId: session.id,
      players: session.players.map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
      })),
      status: session.status,
      totalRounds: session.totalRounds,
    });
  } catch (error) {
    console.error("[POST /game-session/create] Erreur:", error);
    return res.status(500).json({
      error: "Erreur lors de la création de la session",
    });
  }
});

/**
 * POST /api/game-session/:sessionId/start
 * Démarre la session en assignant les motos aux joueurs
 */
router.post("/:sessionId/start", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "sessionId invalide" });
    }

    // Charger la session avec ses joueurs
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        players: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }

    if (session.status !== "SETUP") {
      return res.status(400).json({
        error: `La session est déjà ${session.status}`,
      });
    }

    // Récupérer toutes les sources disponibles
    const availableSources = await prisma.source.findMany({
      where: {
        audioFile: { not: null },
        motoId: { not: null },
      },
      select: { id: true },
    });

    const sourcesNeeded = session.players.length * session.totalRounds;

    // Validation critique
    if (availableSources.length < sourcesNeeded) {
      return res.status(400).json({
        error: `Pas assez de sources disponibles. Besoin: ${sourcesNeeded}, Disponibles: ${availableSources.length}`,
      });
    }

    // Shuffle aléatoire des sourceIds (Fisher-Yates)
    const shuffledSourceIds = availableSources.map((s) => s.id);
    for (let i = shuffledSourceIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSourceIds[i], shuffledSourceIds[j]] = [
        shuffledSourceIds[j],
        shuffledSourceIds[i],
      ];
    }

    // Créer les PlayerRounds en transaction
    await prisma.$transaction(async (tx) => {
      const playerRounds = [];
      let sourceIndex = 0;

      // Pour chaque manche, pour chaque joueur
      for (let roundNum = 1; roundNum <= session.totalRounds; roundNum++) {
        for (const player of session.players) {
          playerRounds.push({
            gameSessionId: session.id,
            playerId: player.id,
            roundNumber: roundNum,
            sourceId: shuffledSourceIds[sourceIndex],
            status: "PENDING",
          });
          sourceIndex++;
        }
      }

      // Insérer tous les PlayerRounds
      await tx.playerRound.createMany({
        data: playerRounds,
      });

      // Marquer le premier PlayerRound comme ACTIVE
      const firstPlayerRound = await tx.playerRound.findFirst({
        where: {
          gameSessionId: session.id,
          roundNumber: 1,
        },
        orderBy: {
          player: {
            position: "asc",
          },
        },
      });

      if (firstPlayerRound) {
        await tx.playerRound.update({
          where: { id: firstPlayerRound.id },
          data: { status: "ACTIVE" },
        });
      }

      // Mettre à jour la session
      await tx.gameSession.update({
        where: { id: session.id },
        data: {
          status: "ACTIVE",
          currentRound: 1,
        },
      });
    });

    // Recharger pour retourner l'état
    const updatedSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        players: { orderBy: { position: "asc" } },
      },
    });

    return res.json({
      sessionId: updatedSession!.id,
      status: updatedSession!.status,
      currentRound: updatedSession!.currentRound,
      currentPlayer: {
        id: updatedSession!.players[0].id,
        name: updatedSession!.players[0].name,
      },
    });
  } catch (error) {
    console.error("[POST /game-session/:sessionId/start] Erreur:", error);
    return res.status(500).json({
      error: "Erreur lors du démarrage de la session",
    });
  }
});

/**
 * GET /api/game-session/:sessionId/current-turn
 * Récupère l'état actuel du tour de jeu
 */
router.get("/:sessionId/current-turn", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "sessionId invalide" });
    }

    // Trouver le PlayerRound actif
    const activePlayerRound = await prisma.playerRound.findFirst({
      where: {
        gameSessionId: sessionId,
        status: "ACTIVE",
      },
      include: {
        player: true,
        source: {
          include: {
            moto: true,
          },
        },
        session: {
          include: {
            players: {
              orderBy: { totalScore: "desc" },
            },
          },
        },
      },
    });

    if (!activePlayerRound) {
      return res.status(404).json({
        error: "Aucun tour actif trouvé",
      });
    }

    return res.json({
      playerRound: {
        id: activePlayerRound.id,
        playerId: activePlayerRound.playerId,
        roundNumber: activePlayerRound.roundNumber,
        sourceId: activePlayerRound.sourceId,
        status: activePlayerRound.status,
      },
      player: {
        id: activePlayerRound.player.id,
        name: activePlayerRound.player.name,
        totalScore: activePlayerRound.player.totalScore,
        position: activePlayerRound.player.position,
      },
      source: {
        id: activePlayerRound.source.id,
        audioFile: activePlayerRound.source.audioFile,
        duration:
          activePlayerRound.source.endSeconds -
          activePlayerRound.source.startSeconds,
        moto: {
          id: activePlayerRound.source.moto!.id,
          manufacturer: activePlayerRound.source.moto!.manufacturer,
          model: activePlayerRound.source.moto!.name,
          engine: activePlayerRound.source.moto!.engine,
          cylinders: activePlayerRound.source.moto!.cylinders,
          year: activePlayerRound.source.moto!.year,
        },
      },
      leaderboard: activePlayerRound.session.players.map((p, index) => ({
        id: p.id,
        name: p.name,
        totalScore: p.totalScore,
        position: index + 1,
      })),
      session: {
        id: activePlayerRound.session.id,
        currentRound: activePlayerRound.session.currentRound,
        totalRounds: activePlayerRound.session.totalRounds,
      },
    });
  } catch (error) {
    console.error(
      "[GET /game-session/:sessionId/current-turn] Erreur:",
      error
    );
    return res.status(500).json({
      error: "Erreur lors de la récupération du tour actuel",
    });
  }
});

/**
 * POST /api/game-session/submit-field-answers
 * Soumet les réponses d'un joueur pour une manche
 */
router.post("/submit-field-answers", async (req, res) => {
  try {
    const { playerRoundId, answers, jokerUsed, elapsedMs } = req.body;

    if (!playerRoundId || !Array.isArray(answers)) {
      return res.status(400).json({
        error: "playerRoundId et answers sont requis",
      });
    }

    // Validation du format des réponses
    const validatedAnswers: FieldAnswerInput[] = answers.map((a) => ({
      fieldName: a.fieldName as FieldName,
      responseType: a.responseType,
      answer: String(a.answer || ""),
    }));

    const result: RoundScoreResult = await prisma.$transaction(
      async (tx) => {
        // 1. Charger le PlayerRound avec Source + Moto
        const playerRound = await tx.playerRound.findUnique({
          where: { id: playerRoundId },
          include: {
            source: {
              include: { moto: true },
              },
            player: true,
            session: true,
          },
        });

        if (!playerRound) {
          throw new Error("PlayerRound non trouvé");
        }

        if (playerRound.status !== "ACTIVE") {
          throw new Error(
            `Ce tour n'est pas actif (status: ${playerRound.status})`
          );
        }

        if (!playerRound.source.moto) {
          throw new Error("Moto non trouvée pour cette source");
        }

        // 2. Calculer le score avec multiplayerScoring
        const correctAnswers: MotoAnswer = {
          manufacturer: playerRound.source.moto.manufacturer,
          name: playerRound.source.moto.name,
          engine: playerRound.source.moto.engine,
          cylinders: playerRound.source.moto.cylinders,
          year: playerRound.source.moto.year,
          era: playerRound.source.moto.era,
        };

        const scoreResult = calculateRoundScore({
          fieldAnswers: validatedAnswers,
          correctAnswers,
          jokerUsed,
          elapsedMs,
        });

        // 3. Créer les FieldAnswer records
        for (const fieldResult of scoreResult.fieldResults) {
          await tx.fieldAnswer.create({
            data: {
              playerRoundId,
              fieldName: fieldResult.fieldName,
              responseType: validatedAnswers.find(
                (a) => a.fieldName === fieldResult.fieldName
              )!.responseType,
              answer: validatedAnswers.find(
                (a) => a.fieldName === fieldResult.fieldName
              )!.answer,
              correct: fieldResult.correct,
              score: Math.round(fieldResult.points),
            },
          });
        }

        // 4. Mettre à jour PlayerRound
        await tx.playerRound.update({
          where: { id: playerRoundId },
          data: {
            status: "GUESSED",
            score: scoreResult.totalScore,
            jokerUsed,
            jokerPenalty: scoreResult.jokerPenalty,
            guessedAt: new Date(),
          },
        });

        // 5. Mettre à jour le score total du joueur
        await tx.player.update({
          where: { id: playerRound.playerId },
          data: {
            totalScore: {
              increment: scoreResult.totalScore,
            },
          },
        });

        // 6. Trouver le prochain PlayerRound (avec lock)
        const nextPlayerRound = await tx.playerRound.findFirst({
          where: {
            gameSessionId: playerRound.gameSessionId,
            status: "PENDING",
          },
          orderBy: [{ roundNumber: "asc" }, { player: { position: "asc" } }],
        });

        if (nextPlayerRound) {
          // Marquer comme ACTIVE
          await tx.playerRound.update({
            where: { id: nextPlayerRound.id },
            data: { status: "ACTIVE" },
          });

          // Charger les infos du prochain joueur
          const nextPlayer = await tx.player.findUnique({
            where: { id: nextPlayerRound.playerId },
          });

          // Mettre à jour currentRound si changement
          if (nextPlayerRound.roundNumber !== playerRound.roundNumber) {
            await tx.gameSession.update({
              where: { id: playerRound.gameSessionId },
              data: { currentRound: nextPlayerRound.roundNumber },
            });
          }

          return {
            ...scoreResult,
            moto: {
              manufacturer: playerRound.source.moto.manufacturer,
              name: playerRound.source.moto.name,
              slug: playerRound.source.moto.slug,
            },
            nextTurn: {
              playerId: nextPlayer!.id,
              playerName: nextPlayer!.name,
              roundNumber: nextPlayerRound.roundNumber,
            },
            sessionStatus: "ACTIVE",
            gameCompleted: false,
          };
        } else {
          // Partie terminée
          await tx.gameSession.update({
            where: { id: playerRound.gameSessionId },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
            },
          });

          return {
            ...scoreResult,
            moto: {
              manufacturer: playerRound.source.moto.manufacturer,
              name: playerRound.source.moto.name,
              slug: playerRound.source.moto.slug,
            },
            sessionStatus: "COMPLETED",
            gameCompleted: true,
          };
        }
      },
      {
        timeout: 10000, // 10 secondes max
      }
    );

    return res.json(result);
  } catch (error) {
    console.error("[POST /game-session/submit-field-answers] Erreur:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la soumission",
    });
  }
});

/**
 * GET /api/game-session/:sessionId/coherent-options
 * Génère des options cohérentes pour manufacturer+model (paires qui vont ensemble)
 */
router.get("/:sessionId/coherent-options", async (req, res) => {
  try {
    const { sourceId, count } = req.query;

    if (!sourceId) {
      return res.status(400).json({
        error: "sourceId est requis",
      });
    }

    const sourceIdNum = parseInt(sourceId as string, 10);
    if (isNaN(sourceIdNum)) {
      return res.status(400).json({ error: "sourceId invalide" });
    }

    const optionCount = count ? parseInt(count as string, 10) : 4;
    if (isNaN(optionCount) || optionCount < 2 || optionCount > 4) {
      return res.status(400).json({ error: "count doit être entre 2 et 4" });
    }

    // Charger la source avec la moto
    const source = await prisma.source.findUnique({
      where: { id: sourceIdNum },
      include: { moto: true },
    });

    if (!source || !source.moto) {
      return res.status(404).json({
        error: "Source ou moto non trouvée",
      });
    }

    // Générer les options cohérentes
    try {
      const coherentMotos = qcmCache.generateCoherentOptions(
        {
          manufacturer: source.moto.manufacturer,
          model: source.moto.name,
        },
        optionCount
      );

      // Retourner les options avec manufacturer et model séparés
      return res.json({
        options: coherentMotos.map((moto) => ({
          manufacturer: moto.manufacturer,
          model: moto.model,
        })),
      });
    } catch (cacheError) {
      console.error("[GET /coherent-options] Erreur cache:", cacheError);
      // Fallback: retourner juste la bonne réponse
      return res.json({
        options: [
          {
            manufacturer: source.moto.manufacturer,
            model: source.moto.name,
          },
        ],
      });
    }
  } catch (error) {
    console.error(
      "[GET /game-session/:sessionId/coherent-options] Erreur:",
      error
    );
    return res.status(500).json({
      error: "Erreur lors de la génération des options cohérentes",
    });
  }
});

/**
 * GET /api/game-session/:sessionId/qcm-options
 * Génère les options QCM pour un champ donné
 */
router.get("/:sessionId/qcm-options", async (req, res) => {
  try {
    const { fieldName, sourceId, count } = req.query;

    if (!fieldName || !sourceId) {
      return res.status(400).json({
        error: "fieldName et sourceId sont requis",
      });
    }

    const sourceIdNum = parseInt(sourceId as string, 10);
    if (isNaN(sourceIdNum)) {
      return res.status(400).json({ error: "sourceId invalide" });
    }

    const optionCount = count ? parseInt(count as string, 10) : 4;
    if (isNaN(optionCount) || optionCount < 2 || optionCount > 4) {
      return res.status(400).json({ error: "count doit être entre 2 et 4" });
    }

    // Charger la source avec la moto
    const source = await prisma.source.findUnique({
      where: { id: sourceIdNum },
      include: { moto: true },
    });

    if (!source || !source.moto) {
      return res.status(404).json({ error: "Source ou moto non trouvée" });
    }

    // Récupérer la bonne réponse
    let correctAnswer: string;
    switch (fieldName) {
      case "manufacturer":
        correctAnswer = source.moto.manufacturer;
        break;
      case "model":
        correctAnswer = source.moto.name;
        break;
      case "engine":
        correctAnswer = source.moto.engine || "";
        break;
      case "cylinders":
        correctAnswer = source.moto.cylinders || "";
        break;
      case "year":
        correctAnswer = source.moto.year || "";
        break;
      default:
        return res.status(400).json({ error: "fieldName invalide" });
    }

    if (!correctAnswer) {
      return res.status(400).json({
        error: `Pas de valeur pour ${fieldName} sur cette moto`,
      });
    }

    // Générer les options avec le cache
    try {
      const options = qcmCache.generateQCMOptions(
        fieldName as FieldName,
        correctAnswer,
        optionCount
      );

      return res.json({ options });
    } catch (cacheError) {
      console.error(
        "[GET /qcm-options] Erreur cache:",
        cacheError
      );
      // Fallback: forcer mode expert si pas assez d'options
      return res.json({ options: [correctAnswer] });
    }
  } catch (error) {
    console.error("[GET /game-session/:sessionId/qcm-options] Erreur:", error);
    return res.status(500).json({
      error: "Erreur lors de la génération des options",
    });
  }
});

/**
 * GET /api/game-session/:sessionId/results
 * Récupère les résultats finaux de la partie
 */
router.get("/:sessionId/results", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "sessionId invalide" });
    }

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        players: {
          include: {
            playerRounds: {
              include: {
                source: {
                  include: { moto: true },
                },
                fieldAnswers: true,
              },
              orderBy: { roundNumber: "asc" },
            },
          },
          orderBy: { totalScore: "desc" },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }

    // Préparer les joueurs avec leurs scores
    const playersData = session.players.map((player, index) => ({
      id: player.id,
      name: player.name,
      position: index + 1,
      totalScore: player.totalScore,
    }));

    // Préparer les détails des rounds
    const roundsData: any[] = [];
    session.players.forEach((player) => {
      player.playerRounds.forEach((pr) => {
        roundsData.push({
          roundNumber: pr.roundNumber,
          playerName: player.name,
          score: pr.score,
          jokerUsed: pr.jokerUsed,
          motorcycle: pr.source.moto
            ? `${pr.source.moto.manufacturer} ${pr.source.moto.name}`
            : "?",
        });
      });
    });

    return res.json({
      session: {
        id: session.id,
        status: session.status,
        totalRounds: session.totalRounds,
      },
      players: playersData,
      rounds: roundsData,
    });
  } catch (error) {
    console.error("[GET /game-session/:sessionId/results] Erreur:", error);
    return res.status(500).json({
      error: "Erreur lors de la récupération des résultats",
    });
  }
});

export default router;
