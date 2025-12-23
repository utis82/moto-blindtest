import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Medal, Home, RotateCcw } from "lucide-react";

interface PlayerResult {
  id: number;
  name: string;
  position: number;
  totalScore: number;
}

interface RoundDetail {
  roundNumber: number;
  playerName: string;
  score: number;
  jokerUsed: string | null;
  motorcycle: string;
}

interface ResultsResponse {
  session: {
    id: number;
    status: string;
    totalRounds: number;
  };
  players: PlayerResult[];
  rounds: RoundDetail[];
}

const MEDAL_COLORS = {
  1: "from-yellow-400 to-yellow-600",
  2: "from-gray-300 to-gray-500",
  3: "from-orange-400 to-orange-600",
};

const MEDAL_ICONS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) return;
      try {
        const response = await fetch(
          `http://localhost:4000/api/game-session/${sessionId}/results`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors du chargement des résultats");
        }
        const data: ResultsResponse = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-600/30 border-t-neon-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-chrome-300">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Résultats non disponibles"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-racing-600 hover:bg-racing-500 text-white rounded-lg transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const sortedPlayers = [...results.players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-neon-400" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-neon-400 via-electric-400 to-racing-400 bg-clip-text text-transparent">
              Résultats Finaux
            </h1>
            <Trophy className="w-12 h-12 text-neon-400" />
          </div>
          <p className="text-chrome-300 text-lg">
            Partie terminée • {results.session.totalRounds} tours
          </p>
        </div>

        {/* Podium */}
        <div className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {sortedPlayers.slice(0, 3).map((player, index) => {
              const rank = index + 1;
              const medalColor = MEDAL_COLORS[rank as keyof typeof MEDAL_COLORS] || "from-chrome-600 to-chrome-800";

              return (
                <div
                  key={player.id}
                  className={`relative bg-gradient-to-br from-ink-800 to-ink-900 border-2 rounded-2xl p-6 ${
                    rank === 1
                      ? "border-yellow-500 md:order-2 md:scale-110"
                      : rank === 2
                      ? "border-gray-400 md:order-1"
                      : "border-orange-500 md:order-3"
                  } transition-all`}
                >
                  {/* Medal */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${medalColor} flex items-center justify-center text-3xl shadow-lg`}
                    >
                      {MEDAL_ICONS[rank as keyof typeof MEDAL_ICONS]}
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <div className="text-6xl font-black bg-gradient-to-r from-neon-400 to-electric-400 bg-clip-text text-transparent mb-2">
                      #{rank}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">{player.name}</h2>
                    <div className="text-4xl font-black text-neon-400 mb-1">
                      {player.totalScore}
                    </div>
                    <div className="text-chrome-400 text-sm">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classement complet */}
        {sortedPlayers.length > 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Medal className="w-6 h-6 text-electric-400" />
              Classement complet
            </h2>
            <div className="bg-gradient-to-br from-ink-800 to-ink-900 border border-chrome-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-chrome-700">
                    <th className="px-6 py-3 text-left text-chrome-400 font-semibold">Position</th>
                    <th className="px-6 py-3 text-left text-chrome-400 font-semibold">Joueur</th>
                    <th className="px-6 py-3 text-right text-chrome-400 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.slice(3).map((player, index) => (
                    <tr key={player.id} className="border-b border-chrome-800/50 last:border-0">
                      <td className="px-6 py-4 text-chrome-300">#{index + 4}</td>
                      <td className="px-6 py-4 text-white font-semibold">{player.name}</td>
                      <td className="px-6 py-4 text-right text-electric-400 font-bold">
                        {player.totalScore} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Détails des tours */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Détails des tours</h2>
          <div className="space-y-3">
            {results.rounds.map((round) => (
              <div
                key={`${round.roundNumber}-${round.playerName}`}
                className="bg-gradient-to-br from-ink-800 to-ink-900 border border-chrome-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-racing-600/20 text-racing-300 rounded-lg font-bold">
                    Tour {round.roundNumber}
                  </div>
                  <div className="text-white font-semibold">{round.playerName}</div>
                  <div className="text-chrome-400 text-sm">{round.motorcycle}</div>
                  {round.jokerUsed && (
                    <div className="px-2 py-1 bg-neon-600/20 text-neon-300 rounded text-xs">
                      Joker: {round.jokerUsed}
                    </div>
                  )}
                </div>
                <div className="text-electric-400 font-bold text-lg">{round.score} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/multiplayer/setup")}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-racing-600 to-electric-600 hover:from-racing-500 hover:to-electric-500 text-white text-lg font-bold rounded-xl transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Nouvelle partie
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-ink-800 border-2 border-chrome-700 hover:border-chrome-500 text-chrome-300 text-lg font-bold rounded-xl transition-all"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
