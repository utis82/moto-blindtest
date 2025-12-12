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
    <section className="h-screen flex flex-col overflow-hidden p-4">
      {/* Compact Header */}
      <div className="flex-shrink-0 relative rounded-2xl overflow-hidden bg-gradient-to-br from-racing-900 via-ink-900 to-electric-900 p-1 shadow-2xl mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 opacity-75 blur-sm animate-pulse-slow"></div>
        <div className="relative rounded-xl bg-ink-950 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-gradient-to-r from-racing-600 to-neon-500"></div>
                <p className="text-xs uppercase tracking-[0.3em] text-neon-500 font-bold">
                  🏍️ Blind Test
                </p>
              </div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-racing-500 via-neon-500 to-electric-500">
                DEVINE LA BÊTE
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fetchNextRound(true)}
              className="group relative px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-electric-600 to-electric-500 text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-electric-600/50 disabled:opacity-40 disabled:hover:scale-100"
              disabled={loading}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg group-hover:rotate-180 transition-transform duration-500">↻</span>
                NOUVELLE MANCHE
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid gap-4 lg:grid-cols-[1.3fr,0.7fr] min-h-0">
        {/* Left Column - Player & Form */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Video Player */}
          <div className="flex-shrink-0 relative rounded-2xl overflow-hidden bg-gradient-to-br from-racing-900 via-ink-900 to-electric-900 p-1 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 opacity-75 blur-sm animate-pulse-slow"></div>
            <div className="relative rounded-xl bg-ink-950 p-3">
              <div className="overflow-hidden rounded-xl border border-white/5 bg-black/60">
                {roundData ? (
                  <YouTubeClip playback={roundData.source.playback} />
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    {loading
                      ? "Préparation..."
                      : "Aucune manche."}
                  </div>
                )}
              </div>
              {roundData && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-racing-500 animate-pulse"></div>
                      <span className="text-xs uppercase tracking-wider text-chrome-500 font-semibold">
                        Durée
                      </span>
                    </div>
                    <span className="text-xs font-bold text-neon-500">
                      {roundData.source.duration}s
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-ink-800 overflow-hidden border border-chrome-800/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 transition-[width] shadow-lg shadow-racing-500/50"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-1 shadow-2xl min-h-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-racing-600/20 via-electric-600/20 to-neon-600/20 blur"></div>

            <div className="relative rounded-xl bg-ink-950 p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <div className="w-6 h-1 bg-gradient-to-r from-electric-600 to-neon-500"></div>
                <p className="text-xs uppercase tracking-wider text-electric-500 font-bold">
                  🎯 Ta Réponse
                </p>
              </div>
            <div className="grid gap-3 md:grid-cols-3 flex-shrink-0">
              <label className="flex flex-col gap-1" htmlFor="manufacturer">
                <span className="text-xs uppercase tracking-wider text-chrome-500 font-semibold">🏭 Marque</span>
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
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-3 py-2 text-white text-sm font-medium outline-none transition-all focus:border-racing-600 focus:bg-ink-900 focus:shadow-lg focus:shadow-racing-600/20"
                  placeholder="Ducati..."
                />
              </label>
              <label className="flex flex-col gap-1" htmlFor="model">
                <span className="text-xs uppercase tracking-wider text-chrome-500 font-semibold">🏍️ Modèle</span>
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
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-3 py-2 text-white text-sm font-medium outline-none transition-all focus:border-racing-600 focus:bg-ink-900 focus:shadow-lg focus:shadow-racing-600/20"
                  placeholder="Panigale V4..."
                />
              </label>
              <label className="flex flex-col gap-1" htmlFor="cylinders">
                <span className="text-xs uppercase tracking-wider text-chrome-500 font-semibold">🔧 Cylindres</span>
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
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-3 py-2 text-white text-sm font-medium outline-none transition-all focus:border-neon-600 focus:bg-ink-900 focus:shadow-lg focus:shadow-neon-600/20"
                  placeholder="4..."
                />
              </label>
              <label className="flex flex-col gap-1" htmlFor="engine">
                <span className="text-xs uppercase tracking-wider text-chrome-500 font-semibold">⚙️ Architecture</span>
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
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-3 py-2 text-white text-sm font-medium outline-none transition-all focus:border-electric-600 focus:bg-ink-900 focus:shadow-lg focus:shadow-electric-600/20"
                  placeholder="V4..."
                />
              </label>
              <label className="flex flex-col gap-1" htmlFor="year">
                <span className="text-xs uppercase tracking-wider text-chrome-500 font-semibold">📅 Année</span>
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
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-3 py-2 text-white text-sm font-medium outline-none transition-all focus:border-neon-600 focus:bg-ink-900 focus:shadow-lg focus:shadow-neon-600/20"
                  placeholder="2020..."
                />
              </label>
              <label className="flex flex-col gap-1" htmlFor="playerName">
                <span className="text-xs uppercase tracking-wider text-chrome-500 font-semibold">Joueur</span>
                <input
                  id="playerName"
                  name="playerName"
                  className="rounded-lg border-2 border-chrome-800/50 bg-ink-900/50 px-3 py-2 text-white text-sm font-medium outline-none transition-all focus:border-electric-600 focus:bg-ink-900 focus:shadow-lg focus:shadow-electric-600/20"
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 items-center flex-shrink-0">
              <button
                type="submit"
                disabled={submitting || loading}
                className="group relative px-6 py-3 rounded-lg font-black text-sm bg-gradient-to-r from-racing-600 to-racing-500 text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-racing-600/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🚀</span>
                  VALIDER
                </span>
              </button>
              <button
                type="button"
                onClick={requestHint}
                disabled={hintLoading || !roundData}
                className="px-4 py-3 rounded-lg font-bold text-xs border-2 border-neon-600/50 text-neon-500 transition-all duration-300 hover:bg-neon-600/10 hover:border-neon-500 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                💡 Indice
              </button>
              {hint && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-900/30 border border-neon-600/50">
                  <span className="text-neon-500 font-bold">💡</span>
                  <span className="text-xs text-neon-400 font-medium">
                    {hint.message}
                  </span>
                  <span className="text-xs text-chrome-500">
                    ({hint.remaining})
                  </span>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 p-2 rounded-lg border border-racing-600/50 bg-racing-900/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-racing-500">⚠️</span>
                  <p className="text-xs font-medium text-racing-300">{error}</p>
                </div>
              </div>
            )}
            {result && (
              <div className="mt-3 flex-1 overflow-auto min-h-0">
                <ResultCard result={result} />
              </div>
            )}
            </div>
          </form>
        </div>
        {/* Right Column - History & Rules */}
        <aside className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 rounded-2xl border border-white/10 bg-ink-900/80 p-4 shadow-xl overflow-hidden flex flex-col">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold flex-shrink-0">
              Historique
            </p>
            <div className="mt-3 space-y-2 overflow-auto flex-1 min-h-0">
              {guesses.length === 0 && (
                <p className="text-xs text-slate-500">
                  Pas de tentative.
                </p>
              )}
              {guesses.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-white text-xs">
                      {entry.playerName}
                    </span>
                    <span className="text-xs">
                      {new Date(entry.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {entry.answers && (
                    <p className="text-xs text-slate-400 truncate">
                      {entry.answers.manufacturer} {entry.answers.model} · {entry.answers.cylinders} cyl.
                    </p>
                  )}
                  <p
                    className={`text-xs font-semibold ${
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
          <div className="flex-shrink-0 rounded-2xl border border-white/10 bg-ink-900/80 p-4 text-xs text-slate-300 shadow-xl">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              Règles
            </p>
            <ul className="space-y-1.5 text-xs">
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
