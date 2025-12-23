import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Play, Home, UserPlus, X } from "lucide-react";
import { GAME_CONSTRAINTS, validateGameConfiguration } from "../../../shared/gameConstraints";

interface Player {
  name: string;
}

export function GameSetupPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([{ name: "" }, { name: "" }]);
  const [totalRounds, setTotalRounds] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const addPlayer = () => {
    if (players.length < GAME_CONSTRAINTS.MAX_PLAYERS) {
      setPlayers([...players, { name: "" }]);
      setError(null);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > GAME_CONSTRAINTS.MIN_PLAYERS) {
      setPlayers(players.filter((_, i) => i !== index));
      setError(null);
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...players];
    updated[index] = { name };
    setPlayers(updated);
    setError(null);
  };

  const incrementRounds = () => {
    if (totalRounds < GAME_CONSTRAINTS.MAX_ROUNDS) {
      setTotalRounds(totalRounds + 1);
      setError(null);
    }
  };

  const decrementRounds = () => {
    if (totalRounds > GAME_CONSTRAINTS.MIN_ROUNDS) {
      setTotalRounds(totalRounds - 1);
      setError(null);
    }
  };

  const startGame = async () => {
    // Validation des noms
    const filledPlayers = players.filter((p) => p.name.trim() !== "");
    if (filledPlayers.length < GAME_CONSTRAINTS.MIN_PLAYERS) {
      setError(`Au moins ${GAME_CONSTRAINTS.MIN_PLAYERS} joueur requis`);
      return;
    }

    // Vérifier les doublons
    const names = filledPlayers.map((p) => p.name.trim());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      setError("Les noms des joueurs doivent être uniques");
      return;
    }

    // Validation de la configuration
    const validation = validateGameConfiguration(filledPlayers.length, totalRounds);
    if (!validation.valid) {
      setError(validation.error || "Configuration invalide");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4000/api/game-session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerNames: names,
          totalRounds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création de la session");
      }

      const data = await response.json();

      // Démarrer la session
      const startResponse = await fetch(
        `http://localhost:4000/api/game-session/${data.sessionId}/start`,
        { method: "POST" }
      );

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || "Erreur lors du démarrage de la session");
      }

      // Rediriger vers la page de jeu
      navigate(`/game/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-ink-800 border border-chrome-700 rounded-lg hover:border-chrome-500 transition-colors"
          >
            <Home className="w-5 h-5 text-chrome-300" />
            <span className="text-chrome-300">Retour</span>
          </button>

          <h1 className="text-4xl font-black bg-gradient-to-r from-electric-400 to-neon-400 bg-clip-text text-transparent">
            Configuration de la partie
          </h1>

          <div className="w-24"></div>
        </div>

        {/* Carte de configuration */}
        <div className="bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-chrome-700 rounded-2xl p-8">
          {/* Section Joueurs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-electric-400" />
                Joueurs ({players.length}/{GAME_CONSTRAINTS.MAX_PLAYERS})
              </h2>
              <button
                onClick={addPlayer}
                disabled={players.length >= GAME_CONSTRAINTS.MAX_PLAYERS}
                className="flex items-center gap-2 px-4 py-2 bg-electric-600 hover:bg-electric-500 disabled:bg-chrome-800 disabled:text-chrome-500 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(index, e.target.value)}
                      placeholder={`Joueur ${index + 1}`}
                      className="w-full px-4 py-3 bg-ink-950 border-2 border-chrome-700 rounded-lg text-white placeholder:text-chrome-600 focus:border-electric-500 focus:outline-none transition-colors"
                      maxLength={20}
                    />
                  </div>
                  {players.length > GAME_CONSTRAINTS.MIN_PLAYERS && (
                    <button
                      onClick={() => removePlayer(index)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section Nombre de tours */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Nombre de tours</h2>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={decrementRounds}
                disabled={totalRounds <= GAME_CONSTRAINTS.MIN_ROUNDS}
                className="p-3 bg-chrome-700 hover:bg-chrome-600 disabled:bg-chrome-900 disabled:text-chrome-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Minus className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className="text-6xl font-black bg-gradient-to-r from-racing-400 to-electric-400 bg-clip-text text-transparent">
                  {totalRounds}
                </div>
                <div className="text-chrome-400 text-sm mt-1">
                  ({GAME_CONSTRAINTS.MIN_ROUNDS}-{GAME_CONSTRAINTS.MAX_ROUNDS} tours)
                </div>
              </div>

              <button
                onClick={incrementRounds}
                disabled={totalRounds >= GAME_CONSTRAINTS.MAX_ROUNDS}
                className="p-3 bg-chrome-700 hover:bg-chrome-600 disabled:bg-chrome-900 disabled:text-chrome-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
              <p className="text-red-400 text-center font-semibold">{error}</p>
            </div>
          )}

          {/* Bouton Démarrer */}
          <button
            onClick={startGame}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-racing-600 to-electric-600 hover:from-racing-500 hover:to-electric-500 disabled:from-chrome-800 disabled:to-chrome-800 disabled:text-chrome-500 text-white text-xl font-bold rounded-xl transition-all disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Démarrer la partie
              </>
            )}
          </button>

          {/* Infos */}
          <div className="mt-6 p-4 bg-ink-950/50 rounded-lg">
            <p className="text-chrome-400 text-sm text-center">
              {players.filter(p => p.name.trim() !== "").length > 1
                ? "Chaque joueur recevra une moto différente à chaque tour."
                : "Une moto différente à chaque tour."}
              <br />
              Modes: Expert (100%), QCM (60%), 50-50 (30%) • Jokers: Indice (-10pts), Révélation (-15pts)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
