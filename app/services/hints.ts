export interface HintContext {
  manufacturer?: string | null;
  name?: string | null;
  engine?: string | null;
  era?: string | null;
  year?: string | null;
  cylinders?: string | null;
  funFact?: string | null;
  channel?: string | null;
}

const friendly = (value?: string | null) =>
  value ? value.replace(/\s+/g, " ").trim() : undefined;

const buildSequence = (context: HintContext) => {
  const seq: string[] = [];
  if (context.manufacturer) {
    const clean = friendly(context.manufacturer);
    if (clean) seq.push(`Première lettre de la marque : ${clean[0]}`);
  }
  if (context.era) seq.push(`Période de production : ${context.era}`);
  if (context.engine) seq.push(`Architecture moteur : ${context.engine}`);
  if (context.cylinders)
    seq.push(`Nombre de cylindres : ${context.cylinders}`);
  if (context.year) seq.push(`Année clé : ${context.year}`);
  if (context.channel)
    seq.push(`Indice YouTube : vidéo postée par ${context.channel}`);
  if (context.funFact) seq.push(`Fun fact : ${context.funFact}`);
  if (context.name) {
    const words = context.name.split(/\s+/).filter(Boolean).length;
    seq.push(
      `Le nom du modèle contient ${words} mot${words > 1 ? "s" : ""}.`
    );
  }
  return seq;
};

export interface HintResult {
  level: number;
  message: string;
  remaining: number;
}

export const nextHint = (currentLevel: number, context: HintContext) => {
  const sequence = buildSequence(context);
  if (!sequence.length) {
    return {
      level: currentLevel,
      message: "Pas d'indice supplémentaire disponible.",
      remaining: 0,
    };
  }
  const nextLevel = Math.min(sequence.length, currentLevel + 1);
  return {
    level: nextLevel,
    message: sequence[nextLevel - 1],
    remaining: Math.max(sequence.length - nextLevel, 0),
  };
};
