import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { apiClient } from "../lib/api";
import type {
  GuessResponse,
  HintResponse,
  NextRoundResponse,
  PlayerAnswers,
} from "../types";
import { ResultCard } from "./ResultCard";
import { YouTubeClip } from "./YouTubeClip";

const emptyAnswers: PlayerAnswers = {
  manufacturer: "",
  model: "",
  engine: "",
  cylinders: "",
  year: "",
};

export const GamePage = () => {
  const [roundData, setRoundData] = useState<NextRoundResponse | null>(null);
  const [answers, setAnswers] = useState<PlayerAnswers>(emptyAnswers);
  const [playerName, setPlayerName] = useState("Solo rider");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [result, setResult] = useState<GuessResponse | null>(null);
  const [hint, setHint] = useState<HintResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const durationMs = useMemo(() => {
    if (!roundData?.source?.duration) return 0;
    return roundData.source.duration * 1000;
  }, [roundData]);

  const fetchNextRound = async (skip = false) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiClient.getNextRound(skip);
      setRoundData(payload);
      setAnswers(emptyAnswers);
      setResult(null);
      setHint(null);
      setProgress(0);
      startRef.current = Date.now();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextRound(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [durationMs, roundData?.round.id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!roundData) return;
    setSubmitting(true);
    setError(null);
    try {
      const elapsedMs = startRef.current
        ? Date.now() - startRef.current
        : undefined;
      const payload = await apiClient.submitGuess({
        roundId: roundData.round.id,
        answers,
        playerName,
        elapsedMs,
      });
      setResult(payload);
      setRoundData((prev) =>
        prev
          ? { ...prev, guesses: [payload.guess, ...prev.guesses] }
          : prev
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const requestHint = async () => {
    if (!roundData) return;
    setHintLoading(true);
    setError(null);
    try {
      const payload = await apiClient.requestHint(roundData.round.id);
      setHint(payload);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setHintLoading(false);
    }
  };

  const guesses = roundData?.guesses ?? [];

  return (
    <section className="h-screen flex flex-col overflow-hidden p-3">
      {/* Compact Header */}
      <div className="flex-shrink-0 relative rounded-xl overflow-hidden bg-gradient-to-br from-racing-900 via-ink-900 to-electric-900 p-1 shadow-lg mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 opacity-75 blur-sm animate-pulse-slow"></div>
        <div className="relative rounded-lg bg-ink-950 px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-gradient-to-r from-racing-600 to-neon-500"></div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neon-500 font-bold">
                  🏍️ Blind Test
                </p>
              </div>
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-racing-500 via-neon-500 to-electric-500">
                DEVINE LA BÊTE
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fetchNextRound(true)}
              className="group relative px-3 py-1.5 rounded-lg font-bold text-xs bg-gradient-to-r from-electric-600 to-electric-500 text-white transition-all duration-300 hover:scale-105 shadow-md shadow-electric-600/50 disabled:opacity-40 disabled:hover:scale-100"
              disabled={loading}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-sm group-hover:rotate-180 transition-transform duration-500">↻</span>
                NOUVELLE MANCHE
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid gap-2 lg:grid-cols-[1.3fr,0.7fr] min-h-0">
        {/* Left Column - Player & Form */}
        <div className="flex flex-col gap-2 min-h-0">
          {/* Video Player - COMPACT */}
          <div className="flex-shrink-0 relative rounded-xl overflow-hidden bg-gradient-to-br from-racing-900 via-ink-900 to-electric-900 p-0.5 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 opacity-50 blur-sm"></div>
            <div className="relative rounded-lg bg-ink-950 p-2">
              <div className="overflow-hidden rounded-lg border border-white/5 bg-black/60" style={{maxHeight: '180px'}}>
                {roundData ? (
                  <YouTubeClip playback={roundData.source.playback} />
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    {loading
                      ? "Préparation..."
                      : "Aucune manche."}
                  </div>
                )}
              </div>
              {roundData && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-racing-500 animate-pulse"></div>
                      <span className="text-[10px] uppercase tracking-wider text-chrome-500 font-semibold">
                        Durée
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-neon-500">
                      {roundData.source.duration}s
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-ink-800 overflow-hidden border border-chrome-800/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 transition-[width] shadow-md shadow-racing-500/50"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form - COMPACT */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-0.5 shadow-lg min-h-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-racing-600/20 via-electric-600/20 to-neon-600/20 blur"></div>

            <div className="relative rounded-lg bg-ink-950 p-2 h-full flex flex-col">
              <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
                <div className="w-4 h-0.5 bg-gradient-to-r from-electric-600 to-neon-500"></div>
                <p className="text-[10px] uppercase tracking-wider text-electric-500 font-bold">
                  🎯 Ta Réponse
                </p>
              </div>
            <div className="grid gap-2 md:grid-cols-3 flex-shrink-0">
              <label className="flex flex-col gap-0.5" htmlFor="manufacturer">
                <span className="text-[10px] uppercase tracking-wider text-chrome-500 font-semibold">🏭 Marque</span>
                <input
                  id="manufacturer"
                  name="manufacturer"
                  required
                  value={answers.manufacturer}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      manufacturer: event.target.value,
                    }))
                  }
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-2 py-1.5 text-white text-xs font-medium outline-none transition-all focus:border-racing-600 focus:bg-ink-900 focus:shadow-md focus:shadow-racing-600/20"
                  placeholder="Ducati..."
                />
              </label>
              <label className="flex flex-col gap-0.5" htmlFor="model">
                <span className="text-[10px] uppercase tracking-wider text-chrome-500 font-semibold">🏍️ Modèle</span>
                <input
                  id="model"
                  name="model"
                  required
                  value={answers.model}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      model: event.target.value,
                    }))
                  }
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-2 py-1.5 text-white text-xs font-medium outline-none transition-all focus:border-racing-600 focus:bg-ink-900 focus:shadow-md focus:shadow-racing-600/20"
                  placeholder="Panigale V4..."
                />
              </label>
              <label className="flex flex-col gap-0.5" htmlFor="cylinders">
                <span className="text-[10px] uppercase tracking-wider text-chrome-500 font-semibold">🔧 Cylindres</span>
                <input
                  id="cylinders"
                  name="cylinders"
                  required
                  value={answers.cylinders}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      cylinders: event.target.value,
                    }))
                  }
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-2 py-1.5 text-white text-xs font-medium outline-none transition-all focus:border-neon-600 focus:bg-ink-900 focus:shadow-md focus:shadow-neon-600/20"
                  placeholder="4..."
                />
              </label>
              <label className="flex flex-col gap-0.5" htmlFor="engine">
                <span className="text-[10px] uppercase tracking-wider text-chrome-500 font-semibold">⚙️ Architecture</span>
                <input
                  id="engine"
                  name="engine"
                  value={answers.engine}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      engine: event.target.value,
                    }))
                  }
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-2 py-1.5 text-white text-xs font-medium outline-none transition-all focus:border-electric-600 focus:bg-ink-900 focus:shadow-md focus:shadow-electric-600/20"
                  placeholder="V4..."
                />
              </label>
              <label className="flex flex-col gap-0.5" htmlFor="year">
                <span className="text-[10px] uppercase tracking-wider text-chrome-500 font-semibold">📅 Année</span>
                <input
                  id="year"
                  name="year"
                  value={answers.year}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      year: event.target.value,
                    }))
                  }
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-2 py-1.5 text-white text-xs font-medium outline-none transition-all focus:border-neon-600 focus:bg-ink-900 focus:shadow-md focus:shadow-neon-600/20"
                  placeholder="2020..."
                />
              </label>
              <label className="flex flex-col gap-0.5" htmlFor="playerName">
                <span className="text-[10px] uppercase tracking-wider text-chrome-500 font-semibold">Joueur</span>
                <input
                  id="playerName"
                  name="playerName"
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-2 py-1.5 text-white text-xs font-medium outline-none transition-all focus:border-electric-600 focus:bg-ink-900 focus:shadow-md focus:shadow-electric-600/20"
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 items-center flex-shrink-0">
              <button
                type="submit"
                disabled={submitting || loading}
                className="group relative px-4 py-2 rounded-lg font-black text-xs bg-gradient-to-r from-racing-600 to-racing-500 text-white transition-all duration-300 hover:scale-105 shadow-md shadow-racing-600/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🚀</span>
                  VALIDER
                </span>
              </button>
              <button
                type="button"
                onClick={requestHint}
                disabled={hintLoading || !roundData}
                className="px-3 py-2 rounded-lg font-bold text-[10px] border-2 border-neon-600/50 text-neon-500 transition-all duration-300 hover:bg-neon-600/10 hover:border-neon-500 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                💡 Indice
              </button>
              {hint && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-neon-900/30 border border-neon-600/50">
                  <span className="text-neon-500 font-bold text-sm">💡</span>
                  <span className="text-[10px] text-neon-400 font-medium">
                    {hint.message}
                  </span>
                  <span className="text-[10px] text-chrome-500">
                    ({hint.remaining})
                  </span>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-1.5 p-1.5 rounded-lg border border-racing-600/50 bg-racing-900/20 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-racing-500 text-sm">⚠️</span>
                  <p className="text-[10px] font-medium text-racing-300">{error}</p>
                </div>
              </div>
            )}
            {result && (
              <div className="mt-2 flex-1 overflow-auto min-h-0">
                <ResultCard result={result} />
              </div>
            )}
            </div>
          </form>
        </div>
        {/* Right Column - History & Rules - COMPACT */}
        <aside className="flex flex-col gap-2 min-h-0">
          <div className="flex-1 rounded-xl border border-white/10 bg-ink-900/80 p-2 shadow-lg overflow-hidden flex flex-col">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex-shrink-0">
              Historique
            </p>
            <div className="mt-2 space-y-1.5 overflow-auto flex-1 min-h-0">
              {guesses.length === 0 && (
                <p className="text-[10px] text-slate-500">
                  Pas de tentative.
                </p>
              )}
              {guesses.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-white/5 bg-white/5 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-white text-[10px]">
                      {entry.playerName}
                    </span>
                    <span className="text-[9px]">
                      {new Date(entry.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {entry.answers && (
                    <p className="text-[9px] text-slate-400 truncate">
                      {entry.answers.manufacturer} {entry.answers.model} · {entry.answers.cylinders} cyl.
                    </p>
                  )}
                  <p
                    className={`text-[10px] font-semibold ${
                      entry.correct ? "text-emerald-300" : "text-slate-400"
                    }`}
                  >
                    {entry.correct
                      ? "✅ Correct"
                      : `${Math.round(entry.score * 100)}%`}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 rounded-xl border border-white/10 bg-ink-900/80 p-2 text-[10px] text-slate-300 shadow-lg">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
              Règles
            </p>
            <ul className="space-y-1 text-[10px]">
              <li>• Écoute uniquement au son</li>
              <li>• Remplis les champs requis</li>
              <li>• Indices progressifs disponibles</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};
