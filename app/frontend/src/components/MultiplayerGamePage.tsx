import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lightbulb, Eye, Trophy, Home, Volume2 } from "lucide-react";
import type { FieldName } from "../../../shared/gameConstraints";

type ResponseType = "expert" | "qcm" | "fifty_fifty";
type JokerType = "hint" | `reveal_${FieldName}` | null;

interface FieldAnswer {
  fieldName: FieldName;
  responseType: ResponseType;
  answer: string;
}

interface Player {
  id: number;
  name: string;
  totalScore: number;
  position: number;
}

interface CurrentTurnResponse {
  playerRound: {
    id: number;
    playerId: number;
    roundNumber: number;
    sourceId: number;
    status: string;
  };
  player: Player;
  source: {
    id: number;
    audioFile: string;
    duration: number;
    moto: {
      id: number;
      manufacturer: string;
      model: string;
      engine: string | null;
      cylinders: string | null;
      year: string | null;
    };
  };
  leaderboard: Player[];
  session: {
    id: number;
    currentRound: number;
    totalRounds: number;
  };
}

interface QCMOption {
  fieldName: FieldName;
  options: string[];
}

interface CoherentOption {
  manufacturer: string;
  model: string;
}

const FIELD_LABELS: Record<FieldName, string> = {
  manufacturer: "Constructeur",
  model: "Modèle",
  engine: "Moteur",
  cylinders: "Cylindres",
  year: "Année",
};

const FIELDS: FieldName[] = ["manufacturer", "model", "engine", "cylinders", "year"];

export function MultiplayerGamePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [currentTurn, setCurrentTurn] = useState<CurrentTurnResponse | null>(null);
  const [fieldAnswers, setFieldAnswers] = useState<FieldAnswer[]>([]);
  const [responseModes, setResponseModes] = useState<Record<FieldName, ResponseType>>({
    manufacturer: "expert",
    model: "expert",
    engine: "expert",
    cylinders: "expert",
    year: "expert",
  });
  const [qcmOptions, setQcmOptions] = useState<Partial<Record<FieldName, string[]>>>({});
  const [coherentOptions, setCoherentOptions] = useState<CoherentOption[]>([]);
  const [lockedModes, setLockedModes] = useState<Partial<Record<FieldName, boolean>>>({});
  const [jokerUsed, setJokerUsed] = useState<JokerType>(null);
  const [revealedField, setRevealedField] = useState<FieldName | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [roundResults, setRoundResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const durationMs = useMemo(() => {
    if (!currentTurn?.source?.duration) return 0;
    return currentTurn.source.duration * 1000;
  }, [currentTurn]);

  // Charger le tour actuel
  const loadCurrentTurn = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch(
        `http://localhost:4000/api/game-session/${sessionId}/current-turn`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du chargement du tour");
      }
      const data: CurrentTurnResponse = await response.json();
      setCurrentTurn(data);
      setFieldAnswers([]);
      setResponseModes({
        manufacturer: "expert",
        model: "expert",
        engine: "expert",
        cylinders: "expert",
        year: "expert",
      });
      setQcmOptions({});
      setCoherentOptions([]);
      setLockedModes({});
      setJokerUsed(null);
      setRevealedField(null);
      setHintText(null);
      setProgress(0);
      startRef.current = Date.now();
      setError(null);
      setShowResultsModal(false);
      setRoundResults(null);

      // Charger l'audio
      if (audioRef.current) {
        audioRef.current.src = `http://localhost:4000${data.source.audioFile}`;
        audioRef.current.load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Initialiser au chargement
  useEffect(() => {
    loadCurrentTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Timer de progression
  useEffect(() => {
    if (!durationMs) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!startRef.current || !durationMs) return;
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min(elapsed / durationMs, 1));
    }, 200);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [durationMs]);

  // Changer le mode de réponse pour un champ
  const changeResponseMode = async (fieldName: FieldName, mode: ResponseType) => {
    // Empêcher le changement si le mode est déjà verrouillé
    if (lockedModes[fieldName]) {
      return;
    }

    setResponseModes((prev) => ({ ...prev, [fieldName]: mode }));

    // Verrouiller le mode si QCM ou 50-50
    if (mode === "qcm" || mode === "fifty_fifty") {
      setLockedModes((prev) => ({ ...prev, [fieldName]: true }));
    }

    // Pour manufacturer et model, charger les options cohérentes
    if ((fieldName === "manufacturer" || fieldName === "model") &&
        (mode === "qcm" || mode === "fifty_fifty") &&
        coherentOptions.length === 0) {
      try {
        const count = mode === "qcm" ? 4 : 2;
        const response = await fetch(
          `http://localhost:4000/api/game-session/${sessionId}/coherent-options?` +
            new URLSearchParams({
              sourceId: currentTurn!.source.id.toString(),
              count: count.toString(),
            })
        );
        if (!response.ok) throw new Error("Erreur lors du chargement des options cohérentes");
        const data = await response.json();
        setCoherentOptions(data.options);

        // Extraire les manufacturers et models séparément pour les QCM
        const manufacturers = data.options.map((o: CoherentOption) => o.manufacturer);
        const models = data.options.map((o: CoherentOption) => o.model);
        setQcmOptions((prev) => ({
          ...prev,
          manufacturer: manufacturers,
          model: models,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des options cohérentes");
      }
    }
    // Pour les autres champs, utiliser l'ancienne méthode
    else if ((fieldName === "engine" || fieldName === "cylinders" || fieldName === "year") &&
             (mode === "qcm" || mode === "fifty_fifty") &&
             !qcmOptions[fieldName]) {
      try {
        const count = mode === "qcm" ? 4 : 2;
        const response = await fetch(
          `http://localhost:4000/api/game-session/${sessionId}/qcm-options?` +
            new URLSearchParams({
              fieldName,
              sourceId: currentTurn!.source.id.toString(),
              count: count.toString(),
            })
        );
        if (!response.ok) throw new Error("Erreur lors du chargement des options");
        const data: QCMOption = await response.json();
        setQcmOptions((prev) => ({ ...prev, [fieldName]: data.options }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des options");
      }
    }
  };

  // Utiliser le joker "Indice"
  const useHintJoker = () => {
    if (jokerUsed) return;
    setJokerUsed("hint");
    setHintText(
      "Le constructeur commence par une lettre située entre A et Z. Le modèle contient au moins 2 caractères."
    );
  };

  // Utiliser le joker "Révéler un champ"
  const useRevealJoker = (fieldName: FieldName) => {
    if (jokerUsed || !currentTurn) return;
    setJokerUsed(`reveal_${fieldName}`);
    setRevealedField(fieldName);

    const correctValue = currentTurn.source.moto[fieldName];
    const answer = correctValue?.toString() || "";

    // Mettre à jour la réponse automatiquement
    setFieldAnswers((prev) => {
      const filtered = prev.filter((fa) => fa.fieldName !== fieldName);
      return [
        ...filtered,
        {
          fieldName,
          responseType: "expert",
          answer,
        },
      ];
    });
  };

  // Mettre à jour une réponse
  const updateAnswer = (fieldName: FieldName, answer: string) => {
    setFieldAnswers((prev) => {
      const filtered = prev.filter((fa) => fa.fieldName !== fieldName);
      return [
        ...filtered,
        {
          fieldName,
          responseType: responseModes[fieldName],
          answer,
        },
      ];
    });
  };

  // Soumettre les réponses
  const submitAnswers = async () => {
    if (!currentTurn || !sessionId) return;

    // Vérifier qu'au moins un champ est rempli
    if (fieldAnswers.length === 0) {
      setError("Veuillez remplir au moins un champ");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const elapsedMs = startRef.current ? Date.now() - startRef.current : undefined;

      const response = await fetch(
        "http://localhost:4000/api/game-session/submit-field-answers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerRoundId: currentTurn.playerRound.id,
            answers: fieldAnswers,
            jokerUsed,
            elapsedMs,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la soumission");
      }

      const data = await response.json();

      // Afficher le popup de résultats
      setRoundResults(data);
      setShowResultsModal(true);

      // Attendre que l'utilisateur ferme le popup avant de continuer
      // (le popup gérera la navigation)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  if (!currentTurn || !currentTurn.session || !currentTurn.player || !currentTurn.source) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-electric-600/30 border-t-electric-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gold-300">Chargement du tour...</p>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  const currentAnswer = (fieldName: FieldName) =>
    fieldAnswers.find((fa) => fa.fieldName === fieldName)?.answer || "";

  return (
    <div className="min-h-screen p-8">
      <audio ref={audioRef} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-ink-800 border border-gold-700 rounded-lg hover:border-gold-500 transition-colors"
          >
            <Home className="w-5 h-5 text-gold-300" />
            <span className="text-gold-300">Quitter</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-black bg-gradient-to-r from-electric-400 to-neon-400 bg-clip-text text-transparent">
              Tour {currentTurn.session.currentRound}/{currentTurn.session.totalRounds}
            </h1>
            <p className="text-gold-400 text-sm mt-1">
              C'est au tour de <span className="text-electric-400 font-bold">{currentTurn.player.name}</span>
            </p>
          </div>

          <div className="w-28"></div>
        </div>

        {/* Leaderboard */}
        <div className="mb-6 bg-gradient-to-br from-ink-800 to-ink-900 border border-gold-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-neon-400" />
            <h2 className="text-lg font-bold text-white">Classement</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {currentTurn.leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`flex-shrink-0 px-4 py-2 rounded-lg ${
                  player.id === currentTurn.player.id
                    ? "bg-electric-600/30 border border-electric-500"
                    : "bg-ink-950/50"
                }`}
              >
                <div className="text-xs text-gold-400">#{index + 1}</div>
                <div className="text-white font-bold">{player.name}</div>
                <div className="text-sm text-neon-400">{player.totalScore} pts</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lecteur Audio */}
          <div className="bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-gold-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Écoutez le son</h2>

            <button
              onClick={playAudio}
              className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-racing-600 to-electric-600 hover:from-racing-500 hover:to-electric-500 text-white text-xl font-bold rounded-xl transition-all mb-4"
            >
              <Volume2 className="w-8 h-8" />
              Jouer le son
            </button>

            {/* Barre de progression */}
            <div className="w-full h-2 bg-ink-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-racing-500 to-electric-500 transition-all duration-200"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>

            {/* Jokers */}
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-bold text-white">Jokers disponibles</h3>

              <button
                onClick={useHintJoker}
                disabled={!!jokerUsed}
                className="w-full flex items-center justify-between px-4 py-3 bg-neon-600/20 hover:bg-neon-600/30 disabled:bg-chrome-900 disabled:text-gold-600 text-neon-300 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  <span className="font-semibold">Indice</span>
                </div>
                <span className="text-sm">-10 pts</span>
              </button>

              {hintText && (
                <div className="p-3 bg-neon-600/10 border border-neon-600/30 rounded-lg">
                  <p className="text-neon-300 text-sm">{hintText}</p>
                </div>
              )}

              <div className="text-xs text-gold-500 mt-2">
                Utilisez <Eye className="w-3 h-3 inline" /> pour révéler un champ (-15pts)
              </div>
            </div>
          </div>

          {/* Formulaire de réponses */}
          <div className="bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-gold-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Vos réponses</h2>

            <div className="space-y-4">
              {FIELDS.map((fieldName) => {
                const mode = responseModes[fieldName];
                const isRevealed = revealedField === fieldName;
                const options = qcmOptions[fieldName] || [];

                return (
                  <div key={fieldName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-semibold">
                        {FIELD_LABELS[fieldName]}
                      </label>

                      {!isRevealed && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => changeResponseMode(fieldName, "expert")}
                            className={`px-2 py-1 text-xs rounded ${
                              mode === "expert"
                                ? "bg-racing-600 text-white"
                                : "bg-chrome-800 text-gold-400"
                            }`}
                          >
                            Expert
                          </button>
                          <button
                            onClick={() => changeResponseMode(fieldName, "qcm")}
                            className={`px-2 py-1 text-xs rounded ${
                              mode === "qcm"
                                ? "bg-electric-600 text-white"
                                : "bg-chrome-800 text-gold-400"
                            }`}
                          >
                            QCM
                          </button>
                          <button
                            onClick={() => changeResponseMode(fieldName, "fifty_fifty")}
                            className={`px-2 py-1 text-xs rounded ${
                              mode === "fifty_fifty"
                                ? "bg-neon-600 text-white"
                                : "bg-chrome-800 text-gold-400"
                            }`}
                          >
                            50-50
                          </button>
                          <button
                            onClick={() => useRevealJoker(fieldName)}
                            disabled={!!jokerUsed}
                            className="px-2 py-1 text-xs rounded bg-chrome-800 text-gold-400 hover:bg-chrome-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Révéler (-15pts)"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isRevealed ? (
                      <div className="px-4 py-3 bg-neon-600/20 border border-neon-600/50 rounded-lg">
                        <p className="text-neon-300 font-bold">{currentAnswer(fieldName)}</p>
                        <p className="text-xs text-neon-400 mt-1">Révélé (-15pts)</p>
                      </div>
                    ) : mode === "expert" ? (
                      <input
                        type="text"
                        value={currentAnswer(fieldName)}
                        onChange={(e) => updateAnswer(fieldName, e.target.value)}
                        className="w-full px-4 py-2 bg-ink-950 border border-gold-700 rounded-lg text-white focus:border-racing-500 focus:outline-none"
                        placeholder={`Entrez le ${FIELD_LABELS[fieldName].toLowerCase()}`}
                      />
                    ) : (
                      <div className="space-y-2">
                        {options.map((option) => (
                          <button
                            key={option}
                            onClick={() => updateAnswer(fieldName, option)}
                            className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                              currentAnswer(fieldName) === option
                                ? "bg-electric-600 text-white"
                                : "bg-ink-950 text-gold-300 hover:bg-ink-900"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={submitAnswers}
              disabled={isSubmitting || fieldAnswers.length === 0}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-racing-600 to-electric-600 hover:from-racing-500 hover:to-electric-500 disabled:from-chrome-800 disabled:to-chrome-800 disabled:text-gold-500 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Envoi en cours..." : "Valider mes réponses"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de résultats */}
      {showResultsModal && roundResults && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => {
          if (roundResults.sessionStatus === "COMPLETED") {
            navigate(`/results/${sessionId}`);
          } else {
            setShowResultsModal(false);
            loadCurrentTurn();
          }
        }}>
          <div className="bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-gold-600 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-center mb-4 bg-gradient-to-r from-neon-400 to-electric-400 bg-clip-text text-transparent">
              Résultats du tour
            </h2>

            {/* Photo/Info de la moto */}
            {roundResults.moto && (
              <div className="mb-4 relative overflow-hidden rounded-xl border-2 border-gold-500">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-racing-600/30 via-electric-600/30 to-neon-600/30"></div>

                {/* Moto info */}
                <div className="relative p-6 text-center">
                  <div className="text-3xl font-black text-white mb-2">
                    {roundResults.moto.manufacturer}
                  </div>
                  <div className="text-xl font-bold text-gold-300">
                    {roundResults.moto.name}
                  </div>
                  <div className="mt-3 text-sm text-gray-400 italic">
                    C'était cette moto! 🏍️
                  </div>
                </div>
              </div>
            )}

            {/* Score total */}
            <div className="text-center mb-4">
              <div className="text-4xl font-black text-neon-400 mb-1">
                {roundResults.totalScore}
              </div>
              <div className="text-gold-300">points gagnés</div>
              {roundResults.jokerPenalty > 0 && (
                <div className="text-racing-400 text-sm mt-1">
                  (Pénalité joker: -{roundResults.jokerPenalty} pts)
                </div>
              )}
            </div>

            {/* Détails par champ */}
            <div className="space-y-2 mb-4">
              {roundResults.fieldResults?.map((field: any) => (
                <div
                  key={field.fieldName}
                  className={`p-3 rounded-lg border ${
                    field.correct
                      ? "bg-green-900/20 border-green-500"
                      : "bg-red-900/20 border-red-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm mb-1">
                        {FIELD_LABELS[field.fieldName as FieldName]}
                      </div>
                      <div className="text-xs space-y-1">
                        {!field.correct && field.userAnswer && (
                          <div className="text-red-400">
                            Ta réponse: <span className="font-medium">{field.userAnswer}</span>
                          </div>
                        )}
                        <div className={field.correct ? "text-green-400" : "text-gold-300"}>
                          {field.correct ? "✓" : "→"} Bonne réponse: <span className="font-medium">{field.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-electric-400">
                      +{field.points.toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton continuer */}
            <button
              onClick={() => {
                if (roundResults.sessionStatus === "COMPLETED") {
                  navigate(`/results/${sessionId}`);
                } else {
                  setShowResultsModal(false);
                  loadCurrentTurn();
                }
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-racing-600 to-electric-600 hover:from-racing-500 hover:to-electric-500 text-white font-bold rounded-xl transition-all"
            >
              {roundResults.sessionStatus === "COMPLETED" ? "Voir les résultats finaux" : "Tour suivant"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
