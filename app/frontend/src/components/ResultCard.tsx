import type { GuessResponse } from "../types";

interface Props {
  result: GuessResponse | null;
  onClose: () => void;
}

const formatPercent = (value: number) => `${Math.round(value)}%`;

export const ResultCard = ({ result, onClose }: Props) => {
  if (!result) return null;
  const { breakdown, solution, total } = result;
  const solutionLabel = solution
    ? [solution.manufacturer, solution.name].filter(Boolean).join(" ").trim() ||
      "Mystère"
    : "";

  const isCorrect = breakdown.correct;
  const scorePercent = Math.round(total);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto max-w-lg w-full animate-scale-in">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-racing-900 via-ink-900 to-electric-900 p-1 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 opacity-75 blur-lg animate-pulse-slow"></div>

            <div className="relative rounded-xl bg-ink-950 p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              >
                ✕
              </button>

              {/* Score principal */}
              <div className="text-center mb-6">
                <div className="mb-2">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                    isCorrect
                      ? "bg-gradient-to-r from-neon-600 to-electric-600 text-white"
                      : "bg-gradient-to-r from-racing-600 to-chrome-600 text-white"
                  }`}>
                    {isCorrect ? "🎉 BRAVO !" : "💪 CONTINUE !"}
                  </span>
                </div>

                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-racing-500 via-neon-500 to-electric-500 mb-3">
                  {scorePercent}%
                </div>

                {/* Barre de progression */}
                <div className="relative h-4 w-full rounded-full bg-ink-800 overflow-hidden border-2 border-chrome-800/30">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isCorrect
                        ? "bg-gradient-to-r from-neon-600 via-electric-600 to-neon-500"
                        : "bg-gradient-to-r from-racing-600 via-chrome-600 to-racing-500"
                    } shadow-lg`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>

                <p className="text-xs text-chrome-400 mt-2">
                  {scorePercent >= 90 ? "Excellent !" : scorePercent >= 70 ? "Bien joué !" : scorePercent >= 50 ? "Pas mal !" : "Continue d'essayer !"}
                </p>
              </div>

              {/* Solution */}
              {solution && (
                <div className="mb-6 rounded-xl bg-gradient-to-br from-ink-800 to-ink-900 p-4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-neon-500 font-bold mb-2">
                    🏍️ La Bête
                  </p>
                  <p className="text-2xl font-black text-white mb-1">{solutionLabel}</p>
                  <p className="text-sm text-chrome-400">
                    {solution.engine ?? "?"} · {solution.cylinders ?? "?"} cyl · {solution.year ?? solution.era ?? "?"}
                  </p>
                  {solution.funFact && (
                    <p className="mt-3 text-xs text-electric-400 italic border-l-2 border-electric-600 pl-3">
                      💡 {solution.funFact}
                    </p>
                  )}
                </div>
              )}

              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-electric-600 to-electric-500 text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-electric-600/50"
              >
                CONTINUER
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
