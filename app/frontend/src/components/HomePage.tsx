import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        {/* Titre principal */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-racing-400 via-electric-400 to-neon-400 bg-clip-text text-transparent">
            MOTO BLIND TEST
          </h1>
          <p className="text-2xl text-gold-300 mb-8">
            Identifiez les motos au son de leur moteur
          </p>
          <p className="text-lg text-gold-400">
            Modes Expert, QCM, 50-50 • Système de jokers • 1 à 6 joueurs
          </p>
        </div>

        {/* Bouton principal */}
        <button
          onClick={() => navigate("/setup")}
          className="group relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-gold-700 rounded-2xl p-12 hover:border-electric-500 transition-all duration-300 hover:scale-105 w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-electric-600/0 to-electric-600/0 group-hover:from-electric-600/20 group-hover:to-electric-600/5 transition-all duration-300"></div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="p-6 bg-electric-500/20 rounded-full group-hover:bg-electric-500/30 transition-colors">
              <Play className="w-20 h-20 text-electric-400" />
            </div>

            <h2 className="text-4xl font-bold text-white">
              Commencer une partie
            </h2>

            <p className="text-gold-300 text-lg max-w-md text-center leading-relaxed">
              Jouez seul ou entre amis. Testez vos connaissances et grimpez au sommet du classement !
            </p>
          </div>
        </button>

        {/* Infos supplémentaires */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-gold-400">
            23 motos disponibles • Audio haute qualité • Scoring précis
          </p>
          <p className="text-gold-500 text-sm">
            Honda • Yamaha • Ducati • Kawasaki • Suzuki • KTM • BMW • Aprilia • Harley-Davidson et plus...
          </p>
        </div>
      </div>
    </div>
  );
}
