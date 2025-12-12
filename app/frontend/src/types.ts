export interface PlaybackPayload {
  videoId: string;
  playerVars: {
    start: number;
    end: number;
    autoplay: number;
    controls: number;
    disablekb: number;
    modestbranding: number;
    rel: number;
  };
}

export interface SourcePayload {
  embedUrl: string;
  playback: PlaybackPayload;
  duration: number;
}

export interface RoundSummary {
  id: number;
  status: string;
  difficulty: number;
  hintLevel: number;
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

export interface PlayerAnswers {
  manufacturer?: string;
  model?: string;
  engine?: string;
  cylinders?: string;
  year?: string;
}

export interface GuessRecord {
  id: number;
  playerName: string;
  guessText: string;
  score: number;
  correct: boolean;
  breakdown?: GuessEvaluation | null;
  createdAt: string;
  answers?: PlayerAnswers | null;
}

export interface NextRoundResponse {
  round: RoundSummary;
  source: SourcePayload;
  guesses: GuessRecord[];
}

export interface SolutionPayload {
  manufacturer?: string | null;
  name?: string | null;
  engine?: string | null;
  era?: string | null;
  cylinders?: string | null;
  year?: string | null;
  funFact?: string | null;
}

export interface GuessResponse {
  guess: GuessRecord & { breakdown: GuessEvaluation; answers?: PlayerAnswers };
  total: number;
  breakdown: GuessEvaluation;
  solution: SolutionPayload | null;
}

export interface HintResponse {
  level: number;
  message: string;
  remaining: number;
}
