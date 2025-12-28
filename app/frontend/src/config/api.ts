// Configuration de l'URL de l'API
// En production (Railway), l'API et le frontend sont servis par le même domaine
// En développement, l'API tourne sur localhost:4000
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000'
  : ''; // En production, chemins relatifs (même domaine)

export const API_ENDPOINTS = {
  createSession: `${API_BASE_URL}/api/game-session/create`,
  startSession: (sessionId: string) => `${API_BASE_URL}/api/game-session/${sessionId}/start`,
  getSession: (sessionId: string) => `${API_BASE_URL}/api/game-session/${sessionId}`,
  submitAnswer: (sessionId: string) => `${API_BASE_URL}/api/game-session/${sessionId}/answer`,
  useJoker: (sessionId: string) => `${API_BASE_URL}/api/game-session/${sessionId}/joker`,
  nextRound: (sessionId: string) => `${API_BASE_URL}/api/game-session/${sessionId}/next-round`,
};
