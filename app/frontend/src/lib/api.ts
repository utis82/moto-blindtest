import type {
  GuessResponse,
  HintResponse,
  NextRoundResponse,
  PlayerAnswers,
} from "../types";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  "http://localhost:4000";

const withBase = (path: string) =>
  `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

const jsonHeaders = {
  "Content-Type": "application/json",
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      (payload && (payload.error || payload.message)) ||
      `Erreur API (${response.status})`;
    throw new Error(message);
  }
  return (await response.json()) as T;
};

export const apiClient = {
  async getNextRound(skip = false) {
    const query = skip ? "?skip=true" : "";
    const res = await fetch(withBase(`/api/rounds/next${query}`), {
      method: "GET",
    });
    return handleResponse<NextRoundResponse>(res);
  },
  async submitGuess(input: {
    roundId: number;
    answers: PlayerAnswers;
    playerName?: string;
    elapsedMs?: number;
  }) {
    const res = await fetch(withBase("/api/guess"), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    });
    return handleResponse<GuessResponse>(res);
  },
  async requestHint(roundId: number) {
    const res = await fetch(withBase("/api/hints"), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ roundId }),
    });
    return handleResponse<HintResponse>(res);
  },
};
