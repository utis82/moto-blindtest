const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const levenshtein = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [
    i,
  ]);
  for (let j = 0; j <= a.length; j += 1) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i += 1) {
    matrix[i] = matrix[i] ?? [];
    for (let j = 1; j <= a.length; j += 1) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const similarity = (expected: string, actual: string) => {
  const cleanExpected = normalize(expected);
  const cleanActual = normalize(actual);
  if (!cleanExpected || !cleanActual) return 0;
  const distance = levenshtein(cleanExpected, cleanActual);
  const maxLen = Math.max(cleanExpected.length, cleanActual.length);
  if (!maxLen) return 0;
  return 1 - distance / maxLen;
};

const fuzzySimilarity = (expected: string, actual: string) => {
  const cleanExpected = normalize(expected);
  const cleanActual = normalize(actual);
  if (!cleanExpected || !cleanActual) return 0;
  if (cleanExpected === cleanActual) return 1;
  if (
    cleanExpected.includes(cleanActual) ||
    cleanActual.includes(cleanExpected)
  ) {
    const ratio =
      Math.min(cleanExpected.length, cleanActual.length) /
      Math.max(cleanExpected.length, cleanActual.length);
    if (ratio >= 0.6) {
      return 1;
    }
  }
  return similarity(cleanExpected, cleanActual);
};

export interface MotoAnswer {
  manufacturer?: string | null;
  name?: string | null;
  engine?: string | null;
  era?: string | null;
  cylinders?: string | null;
  year?: string | null;
}

export interface PlayerAnswers {
  manufacturer?: string;
  model?: string;
  engine?: string;
  cylinders?: string;
  year?: string;
}

export interface GuessEvaluation {
  brandScore: number;
  modelScore: number;
  engineScore: number;
  cylindersScore: number;
  yearScore: number;
  speedBonus: number;
  total: number;
  correct: boolean;
  explanation: string[];
}

export const scoringProfile = {
  brandWeight: 0.25,
  modelWeight: 0.25,
  engineWeight: 0.15,
  cylindersWeight: 0.15,
  yearWeight: 0.15,
  speedWeight: 0.05,
  acceptance: 0.7,
};

export interface EvaluateGuessInput {
  answers: PlayerAnswers;
  moto: MotoAnswer;
  elapsedMs?: number;
}

const compareNumbers = (expected?: string | null, actual?: string) => {
  if (!expected || !actual) return 0;
  const exp = parseInt(expected, 10);
  const act = parseInt(actual, 10);
  if (Number.isNaN(exp) || Number.isNaN(act)) return 0;
  const diff = Math.abs(exp - act);
  if (diff === 0) return 1;
  if (diff === 1) return 0.8;
  if (diff <= 2) return 0.6;
  return 0;
};

export const evaluateGuess = ({
  answers,
  moto,
  elapsedMs = 0,
}: EvaluateGuessInput): GuessEvaluation => {
  const explanation: string[] = [];
  const brandScore = moto.manufacturer
    ? fuzzySimilarity(moto.manufacturer, answers.manufacturer ?? "")
    : 0;
  if (brandScore > 0.75) explanation.push("Marque validée");
  const modelScore = moto.name
    ? fuzzySimilarity(moto.name, answers.model ?? "")
    : 0;
  if (modelScore > 0.75) explanation.push("Modèle identifié");
  const engineScore = moto.engine
    ? fuzzySimilarity(moto.engine, answers.engine ?? "")
    : 0;
  if (engineScore > 0.5) explanation.push("Architecture moteur cohérente");
  const cylindersScore = compareNumbers(
    moto.cylinders,
    answers.cylinders ?? undefined
  );
  if (cylindersScore > 0.5) explanation.push("Nombre de cylindres OK");
  const yearScore = compareNumbers(moto.year, answers.year ?? undefined);
  if (yearScore > 0.5) explanation.push("Période respectée");
  const normalizedTime = Math.max(0, 1 - elapsedMs / 20000);
  const speedBonus = normalizedTime * scoringProfile.speedWeight;
  const total =
    brandScore * scoringProfile.brandWeight +
    modelScore * scoringProfile.modelWeight +
    engineScore * scoringProfile.engineWeight +
    cylindersScore * scoringProfile.cylindersWeight +
    yearScore * scoringProfile.yearWeight +
    speedBonus;
  const correct = total >= scoringProfile.acceptance;
  explanation.push(
    correct
      ? "Score suffisant, manche gagnée."
      : "Continue, tu te rapproches."
  );
  return {
    brandScore,
    modelScore,
    engineScore,
    cylindersScore,
    yearScore,
    speedBonus,
    total,
    correct,
    explanation,
  };
};

export const scoreToPercentage = (score: number) =>
  Math.round(Math.min(1, Math.max(0, score)) * 100);
