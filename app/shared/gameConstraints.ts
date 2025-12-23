/**
 * Constantes partagées pour le système de jeu multijoueur
 * Utilisé par le backend (validation) et le frontend (UI)
 */

export const GAME_CONSTRAINTS = {
  // Nombre de joueurs
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 6,

  // Nombre de manches
  MIN_ROUNDS: 5,
  MAX_ROUNDS: 23, // Total de sources disponibles
  ROUND_PRESETS: [5, 10, 15, 20] as const,

  // Validation: nombre de sources nécessaires
  AVAILABLE_SOURCES: 23, // Vérifié dans la DB
} as const;

export const JOKER_COSTS = {
  hint: 10, // Indice général: -10 points
  reveal: 15, // Révéler un champ: -15 points
} as const;

export const RESPONSE_MULTIPLIERS = {
  expert: 1.0, // 100% des points du champ
  qcm: 0.6, // 60% des points du champ
  fifty_fifty: 0.3, // 30% des points du champ
} as const;

export const FIELD_WEIGHTS = {
  manufacturer: 25, // Marque
  model: 25, // Modèle
  engine: 20, // Moteur/Architecture
  cylinders: 15, // Nombre de cylindres
  year: 10, // Année
  speed: 5, // Bonus de vitesse (max)
  // Total: 100 points
} as const;

export type FieldName = keyof Omit<typeof FIELD_WEIGHTS, "speed">;
export type ResponseType = keyof typeof RESPONSE_MULTIPLIERS;

/**
 * Valide que la combinaison joueurs/manches est possible
 * @param playerCount Nombre de joueurs
 * @param totalRounds Nombre de manches
 * @returns true si possible, false sinon
 */
export function validateGameConfiguration(
  playerCount: number,
  totalRounds: number
): { valid: boolean; error?: string } {
  if (
    playerCount < GAME_CONSTRAINTS.MIN_PLAYERS ||
    playerCount > GAME_CONSTRAINTS.MAX_PLAYERS
  ) {
    return {
      valid: false,
      error: `Le nombre de joueurs doit être entre ${GAME_CONSTRAINTS.MIN_PLAYERS} et ${GAME_CONSTRAINTS.MAX_PLAYERS}`,
    };
  }

  if (
    totalRounds < GAME_CONSTRAINTS.MIN_ROUNDS ||
    totalRounds > GAME_CONSTRAINTS.MAX_ROUNDS
  ) {
    return {
      valid: false,
      error: `Le nombre de manches doit être entre ${GAME_CONSTRAINTS.MIN_ROUNDS} et ${GAME_CONSTRAINTS.MAX_ROUNDS}`,
    };
  }

  const sourcesNeeded = playerCount * totalRounds;
  if (sourcesNeeded > GAME_CONSTRAINTS.AVAILABLE_SOURCES) {
    const maxRounds = Math.floor(
      GAME_CONSTRAINTS.AVAILABLE_SOURCES / playerCount
    );
    return {
      valid: false,
      error: `Impossible: ${playerCount} joueurs × ${totalRounds} manches = ${sourcesNeeded} sources nécessaires, mais seulement ${GAME_CONSTRAINTS.AVAILABLE_SOURCES} disponibles. Maximum: ${maxRounds} manches pour ${playerCount} joueurs.`,
    };
  }

  return { valid: true };
}

/**
 * Calcule le nombre maximum de manches pour un nombre de joueurs donné
 * @param playerCount Nombre de joueurs
 * @returns Nombre maximum de manches
 */
export function getMaxRounds(playerCount: number): number {
  if (
    playerCount < GAME_CONSTRAINTS.MIN_PLAYERS ||
    playerCount > GAME_CONSTRAINTS.MAX_PLAYERS
  ) {
    return 0;
  }
  return Math.floor(GAME_CONSTRAINTS.AVAILABLE_SOURCES / playerCount);
}
