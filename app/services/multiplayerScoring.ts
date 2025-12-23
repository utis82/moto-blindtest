import {
  FIELD_WEIGHTS,
  RESPONSE_MULTIPLIERS,
  JOKER_COSTS,
  type FieldName,
  type ResponseType,
} from "../shared/gameConstraints";
import {
  fuzzySimilarity,
  compareNumbers,
  type MotoAnswer,
} from "./scoring";

/**
 * Évalue la précision d'une réponse pour un champ spécifique
 * @param fieldName Nom du champ
 * @param expected Réponse correcte
 * @param actual Réponse du joueur
 * @returns Score de précision entre 0 et 1
 */
export function evaluateFieldAccuracy(
  fieldName: FieldName,
  expected: string | null | undefined,
  actual: string
): number {
  if (!expected || !actual) return 0;

  // Utiliser la comparaison numérique pour cylinders et year
  if (fieldName === "cylinders" || fieldName === "year") {
    return compareNumbers(expected, actual);
  }

  // Utiliser fuzzy similarity pour les champs texte
  return fuzzySimilarity(expected, actual);
}

/**
 * Interface pour une réponse à un champ
 */
export interface FieldAnswerInput {
  fieldName: FieldName;
  responseType: ResponseType;
  answer: string;
}

/**
 * Interface pour le résultat d'évaluation d'un champ
 */
export interface FieldEvaluationResult {
  fieldName: FieldName;
  accuracy: number; // 0-1
  points: number; // Points absolus obtenus
  maxPoints: number; // Points maximum possibles
  correct: boolean; // > 0.75 pour considérer comme correct
  correctAnswer: string;
}

/**
 * Interface pour l'entrée de calcul de score de manche
 */
export interface RoundScoreInput {
  fieldAnswers: FieldAnswerInput[];
  correctAnswers: MotoAnswer;
  jokerUsed?: string | null;
  elapsedMs?: number;
}

/**
 * Interface pour le résultat de score de manche
 */
export interface RoundScoreResult {
  fieldResults: FieldEvaluationResult[];
  fieldPointsTotal: number;
  speedBonus: number;
  jokerPenalty: number;
  totalScore: number; // 0-100
}

/**
 * Calcule le score pour une manche complète en mode multijoueur
 * @param input Données de la manche (réponses, jokers, temps)
 * @returns Résultat détaillé du scoring
 */
export function calculateRoundScore(input: RoundScoreInput): RoundScoreResult {
  const { fieldAnswers, correctAnswers, jokerUsed, elapsedMs = 0 } = input;

  // 1. Évaluer chaque champ
  const fieldResults: FieldEvaluationResult[] = fieldAnswers.map((field) => {
    // Récupérer la bonne réponse depuis l'objet moto
    let expectedValue: string | null | undefined;
    switch (field.fieldName) {
      case "manufacturer":
        expectedValue = correctAnswers.manufacturer;
        break;
      case "model":
        expectedValue = correctAnswers.name; // "name" dans Moto = "model" pour le joueur
        break;
      case "engine":
        expectedValue = correctAnswers.engine;
        break;
      case "cylinders":
        expectedValue = correctAnswers.cylinders;
        break;
      case "year":
        expectedValue = correctAnswers.year;
        break;
      default:
        expectedValue = null;
    }

    // Évaluer la précision (0-1)
    const accuracy = evaluateFieldAccuracy(
      field.fieldName,
      expectedValue,
      field.answer
    );

    // Calculer les points
    const maxPoints = FIELD_WEIGHTS[field.fieldName];
    const multiplier = RESPONSE_MULTIPLIERS[field.responseType];
    const points = maxPoints * accuracy * multiplier;

    return {
      fieldName: field.fieldName,
      accuracy,
      points,
      maxPoints: maxPoints * multiplier, // Points max avec le multiplicateur
      correct: accuracy > 0.75, // Seuil de 75% pour "correct"
      correctAnswer: expectedValue || "",
    };
  });

  // 2. Calculer la somme des points de champs
  const fieldPointsTotal = fieldResults.reduce(
    (sum, result) => sum + result.points,
    0
  );

  // 3. Calculer le bonus de vitesse (0 à 5 points)
  const normalizedTime = Math.max(0, 1 - elapsedMs / 20000); // 20 secondes max
  const speedBonus = normalizedTime * FIELD_WEIGHTS.speed;

  // 4. Calculer la pénalité joker
  let jokerPenalty = 0;
  if (jokerUsed === "hint") {
    jokerPenalty = JOKER_COSTS.hint;
  } else if (jokerUsed?.startsWith("reveal_")) {
    jokerPenalty = JOKER_COSTS.reveal;
  }

  // 5. Calculer le score total (arrondir et clamper [0, 100])
  const rawTotal = fieldPointsTotal + speedBonus - jokerPenalty;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  return {
    fieldResults,
    fieldPointsTotal,
    speedBonus,
    jokerPenalty,
    totalScore,
  };
}

/**
 * Calcule le score en pourcentage pour affichage
 * @param score Score absolu (0-100)
 * @returns Score en pourcentage (0-100)
 */
export function scoreToPercentage(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score)));
}
