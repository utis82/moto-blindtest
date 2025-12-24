import "./App.css";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./components/HomePage";
import { GameSetupPage } from "./components/GameSetupPage";
import { MultiplayerGamePage } from "./components/MultiplayerGamePage";
import { ResultsPage } from "./components/ResultsPage";
import { BrandLogosBackground } from "./components/BrandLogosBackground";

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Arrière-plan coloré animé - bleu foncé vers noir */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-blue-900/40 to-black" style={{ zIndex: 0 }}>
        {/* Cercles lumineux animés - or */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>

        {/* Grille de course en arrière-plan */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, #DAA520 50px, #DAA520 51px)',
        }}></div>
      </div>

      {/* Logos des marques en filigrane doré */}
      <BrandLogosBackground />

      {/* Contenu */}
      <div className="relative h-screen flex flex-col" style={{ zIndex: 10 }}>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<GameSetupPage />} />
            <Route path="/game/:sessionId" element={<MultiplayerGamePage />} />
            <Route path="/results/:sessionId" element={<ResultsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
