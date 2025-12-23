import { useNavigate } from "react-router-dom";
import { Users, User } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Titre principal */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-racing-400 via-electric-400 to-neon-400 bg-clip-text text-transparent">
            MOTO BLIND TEST
          </h1>
          <p className="text-xl text-chrome-300">
            Identifiez les motos au son de leur moteur
          </p>
        </div>

        {/* Cartes de choix */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mode Solo */}
          <button
            onClick={() => navigate("/solo")}
            className="group relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-chrome-700 rounded-2xl p-8 hover:border-racing-500 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-racing-600/0 to-racing-600/0 group-hover:from-racing-600/20 group-hover:to-racing-600/5 transition-all duration-300"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-racing-500/20 rounded-full group-hover:bg-racing-500/30 transition-colors">
                  <User className="w-16 h-16 text-racing-400" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Mode Solo
              </h2>

              <p className="text-chrome-300 text-lg leading-relaxed">
                Jouez seul et testez vos connaissances à votre rythme.
                Améliorez votre score personnel.
              </p>

              <div className="mt-6 flex justify-center">
                <span className="px-4 py-2 bg-racing-500/20 text-racing-300 rounded-lg text-sm font-semibold">
                  Classique
                </span>
              </div>
            </div>
          </button>

          {/* Mode Multijoueur */}
          <button
            onClick={() => navigate("/multiplayer/setup")}
            className="group relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-chrome-700 rounded-2xl p-8 hover:border-electric-500 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-electric-600/0 to-electric-600/0 group-hover:from-electric-600/20 group-hover:to-electric-600/5 transition-all duration-300"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-electric-500/20 rounded-full group-hover:bg-electric-500/30 transition-colors">
                  <Users className="w-16 h-16 text-electric-400" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Mode Multijoueur
              </h2>

              <p className="text-chrome-300 text-lg leading-relaxed">
                Affrontez vos amis en tour par tour. Modes Expert, QCM, 50-50 et système de jokers.
              </p>

              <div className="mt-6 flex justify-center gap-2">
                <span className="px-3 py-1.5 bg-electric-500/20 text-electric-300 rounded-lg text-xs font-semibold">
                  1-6 Joueurs
                </span>
                <span className="px-3 py-1.5 bg-neon-500/20 text-neon-300 rounded-lg text-xs font-semibold">
                  Nouveau
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Infos supplémentaires */}
        <div className="mt-12 text-center">
          <p className="text-chrome-400 text-sm">
            23 motos disponibles • Audio haute qualité • Scoring précis
          </p>
        </div>
      </div>
    </div>
  );
}
