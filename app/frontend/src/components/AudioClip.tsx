import { useEffect, useRef, useState } from "react";

interface Props {
  audioFile?: string;
  autoStart?: boolean;
}

export const AudioClip = ({ audioFile, autoStart = false }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioFile) {
      console.log("AudioClip: Pas de fichier audio");
      setLoading(false);
      return;
    }

    console.log("AudioClip: Chargement de", audioFile);
    // Ajouter un timestamp pour forcer le rechargement et éviter le cache
    const audioUrl = `${audioFile}?t=${Date.now()}`;
    const audio = new Audio(audioUrl);
    audio.volume = 1.0; // Volume à 100%
    audioRef.current = audio;

    const handleLoadedData = () => {
      console.log("AudioClip: Fichier chargé, durée:", audio.duration);
      setDuration(audio.duration);
      setLoading(false);
      if (autoStart) {
        audio.play().catch((err) => {
          console.error("Autoplay bloqué:", err);
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setPlaying(false);
      audio.currentTime = 0;
      setCurrentTime(0);
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    const handleError = (e: Event) => {
      console.error("Erreur de chargement audio:", e);
      setError("Impossible de charger le fichier audio");
      setLoading(false);
    };

    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, [audioFile, autoStart]);

  const handlePlayPause = () => {
    console.log("AudioClip: handlePlayPause appelé", {
      hasAudio: !!audioRef.current,
      playing,
      audioFile
    });

    if (!audioRef.current) {
      console.error("AudioClip: Pas d'objet audio!");
      return;
    }

    if (playing) {
      console.log("AudioClip: Pause");
      audioRef.current.pause();
    } else {
      console.log("AudioClip: Play", audioRef.current.src);
      audioRef.current.play()
        .then(() => {
          console.log("AudioClip: Lecture démarrée avec succès");
        })
        .catch((err) => {
          console.error("AudioClip: Erreur de lecture:", err);
          setError("Erreur de lecture audio");
        });
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Barres de visualisation animées
  const visualizerBars = 12;
  const barHeights = Array.from({ length: visualizerBars }, (_, i) => {
    if (!playing) return 20;
    // Animation pseudo-aléatoire basée sur le temps
    const seed = Math.sin(currentTime * 10 + i) * 100;
    return 20 + Math.abs(seed) % 60;
  });

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-0.5 shadow-lg">
      {/* Border glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-racing-600 via-electric-600 to-neon-600 opacity-50 blur-lg"></div>

      <div className="relative rounded-lg bg-ink-950 p-3">
        {/* Audio player interface */}
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          {loading && (
            <div className="flex items-center gap-1.5 text-electric-400 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-electric-500"></div>
              <p className="text-[10px] font-medium">Chargement du clip audio...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-racing-400">
              <p className="text-[10px] font-medium">❌ {error}</p>
            </div>
          )}

          {!loading && !error && audioFile && (
            <>
              {/* Visualizer bars */}
              <div className="flex items-end gap-0.5 h-12">
                {barHeights.map((height, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-t-full transition-all duration-150 ${
                      playing
                        ? 'bg-gradient-to-t from-racing-600 to-neon-500'
                        : 'bg-chrome-700'
                    }`}
                    style={{
                      height: `${height}%`,
                    }}
                  ></div>
                ))}
              </div>

              {/* Progress bar */}
              {duration > 0 && (
                <div className="w-full max-w-xs">
                  <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-racing-600 via-neon-500 to-electric-600 transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-[8px] text-chrome-500">
                    <span>{currentTime.toFixed(1)}s</span>
                    <span>{duration.toFixed(1)}s</span>
                  </div>
                </div>
              )}

              {/* Main control button */}
              <button
                type="button"
                onClick={handlePlayPause}
                className={`
                  group relative px-6 py-2.5 rounded-full font-bold text-sm
                  transition-all duration-300 transform hover:scale-105
                  ${playing
                    ? 'bg-gradient-to-r from-electric-600 to-electric-500 text-white shadow-md shadow-electric-600/50'
                    : 'bg-gradient-to-r from-racing-600 to-racing-500 text-white shadow-md shadow-racing-600/50 hover:shadow-racing-500/70'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {playing ? (
                    <>
                      <span className="text-lg">⏸</span>
                      PAUSE
                    </>
                  ) : (
                    <>
                      <span className="text-lg">▶</span>
                      ÉCOUTER LE RUGISSEMENT
                    </>
                  )}
                </span>
              </button>

              {/* Info text */}
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-neon-500 font-bold mb-0.5">
                  🔊 Mode Audio Only
                </p>
                <p className="text-[9px] text-chrome-400">
                  Concentre-toi sur le son • 10-20 secondes de pur plaisir mécanique
                </p>
              </div>
            </>
          )}

          {!audioFile && !loading && (
            <div className="text-center text-chrome-500 text-xs py-4">
              Aucun son disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
