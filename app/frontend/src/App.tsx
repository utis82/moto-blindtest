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
      {/* Arrière-plan coloré animé */}
      <div className="fixed inset-0 bg-gradient-to-br from-ink-950 via-racing-900/20 to-electric-900/20">
        {/* Cercles lumineux animés */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-racing-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-600/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-600/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>

        {/* Grille de course en arrière-plan */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, #fff 50px, #fff 51px)',
        }}></div>
      </div>

      {/* Logos des marques en filigrane doré */}
      <BrandLogosBackground />

      {/* Contenu */}
      <div className="relative z-10 h-screen flex flex-col">
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
