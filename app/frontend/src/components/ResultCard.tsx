import type { GuessResponse } from "../types";

interface Props {
  result: GuessResponse | null;
}

const formatPercent = (value: number) => `${Math.round(value)}%`;

export const ResultCard = ({ result }: Props) => {
  if (!result) return null;
  const { breakdown, solution, total } = result;
  const solutionLabel = solution
    ? [solution.manufacturer, solution.name].filter(Boolean).join(" ").trim() ||
      "Mystère"
    : "";
  const lines = [
    { label: "Marque", value: breakdown.brandScore },
    { label: "Modèle", value: breakdown.modelScore },
    { label: "Architecture", value: breakdown.engineScore },
    { label: "Cylindres", value: breakdown.cylindersScore },
    { label: "Année", value: breakdown.yearScore },
    { label: "Vitesse", value: breakdown.speedBonus },
  ];
  const comparisons = [
    {
      label: "Marque",
      expected: solution?.manufacturer,
      actual: result.guess.answers?.manufacturer,
      score: breakdown.brandScore,
    },
    {
      label: "Modèle",
      expected: solution?.name,
      actual: result.guess.answers?.model,
      score: breakdown.modelScore,
    },
    {
      label: "Architecture",
      expected: solution?.engine,
      actual: result.guess.answers?.engine,
      score: breakdown.engineScore,
    },
    {
      label: "Cylindres",
      expected: solution?.cylinders,
      actual: result.guess.answers?.cylinders,
      score: breakdown.cylindersScore,
    },
    {
      label: "Année/Période",
      expected: solution?.year ?? solution?.era,
      actual: result.guess.answers?.year,
      score: breakdown.yearScore,
    },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-800/90 p-6 shadow-2xl">
      <div className="flex flex-col gap-1">
        <p className="text-sm uppercase tracking-widest text-slate-400">
          Résultat
        </p>
        <div className="flex items-baseline gap-4">
          <p className="text-5xl font-black text-white">{formatPercent(total)}</p>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              breakdown.correct
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-200"
            }`}
          >
            {breakdown.correct ? "Bonne réponse" : "Encore un effort"}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-500 to-orange-400"
            style={{ width: formatPercent(total) }}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lines.map((line) => (
          <div
            key={line.label}
            className="rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-200"
          >
            <p className="text-xs uppercase tracking-wider text-slate-400">
              {line.label}
            </p>
            <p className="text-lg font-semibold text-white">
              {formatPercent(line.value * 100)}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/5 bg-ink-900/70 p-4">
        <p className="text-sm uppercase tracking-widest text-slate-400">
          Vérité
        </p>
        {solution ? (
          <div className="mt-2 space-y-1 text-slate-50">
            <p className="text-2xl font-bold">{solutionLabel}</p>
            <p className="text-sm text-slate-400">
              {solution.engine ?? "Architecture inconnue"} ·{" "}
              {solution.cylinders ?? "?"} cyl ·{" "}
              {solution.year ?? solution.era ?? "Année inconnue"}
            </p>
            {solution.funFact && (
              <p className="mt-3 text-sm text-slate-300">
                Fun fact&nbsp;: {solution.funFact}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Réponse complète indisponible pour ce clip.
          </p>
        )}
      </div>
      <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-200 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Comparatif
          </p>
          <div className="mt-2 divide-y divide-white/10 rounded-xl border border-white/10">
            {comparisons.map((item) => (
              <div
                key={item.label}
                className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm"
              >
                <span className="w-32 text-xs uppercase tracking-widest text-slate-400">
                  {item.label}
                </span>
                <span
                  className={`flex-1 font-semibold ${
                    item.score >= 0.95
                      ? "text-emerald-300"
                      : item.score >= 0.5
                      ? "text-amber-300"
                      : "text-rose-300"
                  }`}
                >
                  {item.actual ?? "—"}
                </span>
                <span className="flex-1 text-right text-slate-300">
                  {item.expected ?? "Inconnu"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Analyse
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {breakdown.explanation.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
