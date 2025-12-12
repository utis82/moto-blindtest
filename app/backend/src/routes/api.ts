import { Router } from "express";
import { prisma } from "../lib/prisma";
import { buildPlayerParams, buildEmbedUrl } from "../../../services/youtube";
import {
  evaluateGuess,
  scoreToPercentage,
} from "../../../services/scoring";
import { nextHint } from "../../../services/hints";
import { ensureCatalogIngested } from "../utils/catalogIngest";
import { MetadataExtractorService } from "../services/metadata-extractor";

const router = Router();
const metadataExtractor = new MetadataExtractorService(0.90);

const ROUND_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;

const expandRound = () =>
  prisma.round.findFirst({
    where: {
      status: {
        in: [ROUND_STATUS.ACTIVE, ROUND_STATUS.PENDING],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      source: {
        include: {
          moto: true,
        },
      },
      guesses: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

router.get("/rounds/next", async (req, res) => {
  try {
    await ensureCatalogIngested();
    const skipRequested = req.query.skip === "true";
    if (skipRequested) {
      const active = await prisma.round.findFirst({
        where: { status: ROUND_STATUS.ACTIVE },
        orderBy: { createdAt: "asc" },
      });
      if (active) {
        await prisma.round.update({
          where: { id: active.id },
          data: {
            status: ROUND_STATUS.COMPLETED,
            completedAt: new Date(),
          },
        });
      }
    }
    let round = await expandRound();
    if (!round) {
      // Sélectionner une source valide avec confiance >= 90%
      const sources = await prisma.source.findMany({
        include: { moto: true },
        orderBy: { createdAt: "desc" },
      });

      let validSource = null;
      for (const source of sources) {
        // Valider avec le système d'extraction hybride
        if (!source.title) continue;
        const validation = await metadataExtractor.validateVideo(source.title);
        if (validation.valid && validation.confidence >= 0.90) {
          validSource = source;
          break;
        }
      }

      if (!validSource) {
        return res.status(404).json({
          error: "Aucune source disponible avec confiance suffisante (>= 90%)"
        });
      }

      round = await prisma.round.create({
        data: {
          sourceId: validSource.id,
          status: ROUND_STATUS.ACTIVE,
        },
        include: {
          source: { include: { moto: true } },
          guesses: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else if (round.status === ROUND_STATUS.PENDING) {
      round = await prisma.round.update({
        where: { id: round.id },
        data: { status: ROUND_STATUS.ACTIVE },
        include: {
          source: { include: { moto: true } },
          guesses: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }
    if (!round || !round.source) {
      return res.status(404).json({ error: "Manche introuvable" });
    }
    const playback = buildPlayerParams({
      videoId: round.source.videoId,
      url: round.source.url,
      startSeconds: round.source.startSeconds,
      endSeconds: round.source.endSeconds,
    });
    const guesses = round.guesses.map((stored) => {
      let breakdown = null;
      let answersPayload = null;
      if (stored.breakdown) {
        try {
          breakdown = JSON.parse(stored.breakdown);
        } catch {
          breakdown = null;
        }
      }
      if (stored.guessText) {
        try {
          answersPayload = JSON.parse(stored.guessText);
        } catch {
          answersPayload = null;
        }
      }
      return {
        ...stored,
        breakdown,
        answers: answersPayload,
      };
    });
    return res.json({
      round: {
        id: round.id,
        status: round.status,
        difficulty: round.difficulty,
        hintLevel: round.hintLevel,
      },
      source: {
        embedUrl: buildEmbedUrl({
          videoId: round.source.videoId,
          url: round.source.url,
          startSeconds: round.source.startSeconds,
          endSeconds: round.source.endSeconds,
        }),
        playback,
        duration: round.source.duration,
      },
      guesses,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/guess", async (req, res) => {
  try {
    const {
      roundId,
      answers,
      playerName = "Solo rider",
      elapsedMs = 0,
    } = req.body as {
      roundId?: number;
      answers?: {
        manufacturer?: string;
        model?: string;
        engine?: string;
        cylinders?: string;
        year?: string;
      };
      playerName?: string;
      elapsedMs?: number;
    };
    if (!roundId || !answers) {
      return res
        .status(400)
        .json({ error: "Round et réponses structurées requis" });
    }
    const round = await prisma.round.findUnique({
      where: { id: Number(roundId) },
      include: {
        source: { include: { moto: true } },
      },
    });
    if (!round || !round.source || !round.source.moto) {
      return res.status(404).json({ error: "Manche introuvable" });
    }
    const evaluation = evaluateGuess({
      answers,
      moto: {
        manufacturer: round.source.moto.manufacturer,
        name: round.source.moto.name,
        engine: round.source.moto.engine,
        cylinders: round.source.moto.cylinders,
        year: round.source.moto.year,
      },
      elapsedMs,
    });
    const storedGuess = await prisma.guess.create({
      data: {
        roundId: round.id,
        playerName,
        guessText: JSON.stringify(answers),
        score: evaluation.total,
        correct: evaluation.correct,
        breakdown: JSON.stringify(evaluation),
      },
    });
    if (evaluation.correct) {
      await prisma.round.update({
        where: { id: round.id },
        data: {
          status: ROUND_STATUS.COMPLETED,
          completedAt: new Date(),
        },
      });
    }
    const solution = round.source.moto
      ? {
          manufacturer: round.source.moto.manufacturer,
          name: round.source.moto.name,
          engine: round.source.moto.engine,
          funFact: round.source.moto.funFact,
          era: round.source.moto.era,
          cylinders: round.source.moto.cylinders,
          year: round.source.moto.year,
        }
      : null;
    return res.json({
      guess: {
        ...storedGuess,
        breakdown: evaluation,
        answers,
      },
      total: scoreToPercentage(evaluation.total),
      breakdown: evaluation,
      solution,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/hints", async (req, res) => {
  try {
    const { roundId } = req.body as { roundId?: number };
    if (!roundId) {
      return res.status(400).json({ error: "Round manquant" });
    }
    const round = await prisma.round.findUnique({
      where: { id: Number(roundId) },
      include: {
        source: { include: { moto: true } },
      },
    });
    if (!round || !round.source || !round.source.moto) {
      return res.status(404).json({ error: "Round introuvable" });
    }
    const hint = nextHint(round.hintLevel, {
      manufacturer: round.source.moto.manufacturer,
      name: round.source.moto.name,
      engine: round.source.moto.engine,
      era: round.source.moto.era,
      year: round.source.moto.year,
      cylinders: round.source.moto.cylinders,
      funFact: round.source.moto.funFact,
      channel: round.source.channel,
    });
    await prisma.round.update({
      where: { id: round.id },
      data: { hintLevel: hint.level },
    });
    return res.json(hint);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/metadata/extract", async (req, res) => {
  try {
    const { title, useAiFallback = true } = req.body as {
      title?: string;
      useAiFallback?: boolean;
    };
    if (!title) {
      return res.status(400).json({ error: "Titre manquant" });
    }
    const result = await metadataExtractor.extract(title, useAiFallback);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/metadata/validate", async (req, res) => {
  try {
    const { title } = req.body as { title?: string };
    if (!title) {
      return res.status(400).json({ error: "Titre manquant" });
    }
    const validation = await metadataExtractor.validateVideo(title);
    return res.json(validation);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
