import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full">
        {/* Titre principal */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-racing-400 via-electric-400 to-neon-400 bg-clip-text text-transparent">
            MOTO BLIND TEST
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gold-300 mb-4 sm:mb-8 px-4">
            Identifiez les motos au son de leur moteur
          </p>
        </div>

        {/* Bouton principal */}
        <button
          onClick={() => navigate("/setup")}
          className="group relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900 border-2 border-gold-700 rounded-2xl p-6 sm:p-12 hover:border-electric-500 transition-all duration-300 hover:scale-105 w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-electric-600/0 to-electric-600/0 group-hover:from-electric-600/20 group-hover:to-electric-600/5 transition-all duration-300"></div>

          <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-electric-500/20 rounded-full group-hover:bg-electric-500/30 transition-colors">
              <Play className="w-12 h-12 sm:w-20 sm:h-20 text-electric-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Commencer une partie
            </h2>

            <p className="text-gold-300 text-base sm:text-lg max-w-md text-center leading-relaxed px-4">
              Jouez seul ou entre amis. Testez vos connaissances et grimpez au sommet du classement !
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
