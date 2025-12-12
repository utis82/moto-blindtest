import { useEffect, useRef, useState } from "react";
import type { PlaybackPayload } from "../types";

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        config: {
          videoId: string;
          width?: number;
          height?: number;
          playerVars?: Record<string, number | string>;
          events?: Record<string, (event: { target: any; data?: number }) => void>;
        }
      ) => {
        loadVideoById?: (options: {
          videoId: string;
          startSeconds?: number;
          endSeconds?: number;
        }) => void;
        cueVideoById?: (options: {
          videoId: string;
          startSeconds?: number;
          endSeconds?: number;
        }) => void;
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        playVideo?: () => void | Promise<void>;
        pauseVideo: () => void;
        stopVideo?: () => void;
        setVolume?: (volume: number) => void;
        mute?: () => void;
        unMute?: () => void;
        destroy: () => void;
      };
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface Props {
  playback?: PlaybackPayload;
}

const scriptId = "yt-iframe-api";

export const YouTubeClip = ({ playback }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [apiReady, setApiReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.YT?.Player) {
      setApiReady(true);
      return;
    }
    if (!document.getElementById(scriptId)) {
      const tag = document.createElement("script");
      tag.id = scriptId;
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
  }, []);

  useEffect(() => {
    if (!apiReady || !playback || !containerRef.current || !window.YT?.Player) {
      return;
    }
    if (!playerRef.current) {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: playback.videoId,
        height: 360,
        width: 640,
        playerVars: {
          ...playback.playerVars,
          enablejsapi: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            console.log("YouTube player prêt, vidéo:", playback.videoId);
            try {
              event.target.unMute?.();
              event.target.setVolume?.(100);
              event.target.seekTo(playback.playerVars.start, true);
              event.target.pauseVideo();
              setReady(true);
              setPlaying(false);
            } catch (err) {
              console.error("Erreur lors de l'initialisation:", err);
            }
          },
          onStateChange: (event) => {
            if (
              window.YT?.PlayerState &&
              event.data === window.YT.PlayerState.ENDED
            ) {
              event.target.seekTo(playback.playerVars.start, true);
              setPlaying(false);
            }
            if (
              window.YT?.PlayerState &&
              event.data === window.YT.PlayerState.PAUSED
            ) {
              setPlaying(false);
            }
            if (
              window.YT?.PlayerState &&
              event.data === window.YT.PlayerState.PLAYING
            ) {
              setPlaying(true);
            }
          },
        },
      });
      return;
    }
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById({
        videoId: playback.videoId,
        startSeconds: playback.playerVars.start,
        endSeconds: playback.playerVars.end,
      });
    } else if (playerRef.current?.cueVideoById) {
      playerRef.current.cueVideoById({
        videoId: playback.videoId,
        startSeconds: playback.playerVars.start,
        endSeconds: playback.playerVars.end,
      });
    }
  }, [apiReady, playback]);

  useEffect(
    () => () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
      setPlaying(false);
    },
    []
  );

  const handlePlay = () => {
    if (!playerRef.current || !playback) return;
    const start =
      typeof playback.playerVars.start === "number"
        ? playback.playerVars.start
        : Number(playback.playerVars.start ?? 0);

    try {
      playerRef.current.seekTo(start, true);
      playerRef.current.unMute?.();
      playerRef.current.setVolume?.(100);
      const playResult = playerRef.current.playVideo?.();
      if (playResult && typeof playResult === "object" && "catch" in playResult) {
        (playResult as Promise<void>).catch((err) => {
          console.error("Erreur de lecture YouTube:", err);
          setPlaying(false);
        });
      }
      setPlaying(true);
    } catch (err) {
      console.error("Impossible de lancer la vidéo:", err);
      setPlaying(false);
    }
  };

  const handleStop = () => {
    playerRef.current?.pauseVideo();
    setPlaying(false);
  };

  const statusLabel = (() => {
    if (!apiReady) return "Chargement du lecteur YouTube...";
    if (!ready) return "Initialisation du clip...";
    return null;
  })();

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-0.5 shadow-lg">
      {/* Border glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-racing-600 via-electric-600 to-neon-600 opacity-50 blur-lg"></div>

      <div className="relative rounded-lg bg-ink-950 p-3">
        {/* Video player - visible for debugging */}
        <div
          ref={containerRef}
          className="w-full"
        />

        {/* Audio-only interface */}
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          {statusLabel && (
            <div className="flex items-center gap-1.5 text-electric-400 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-electric-500"></div>
              <p className="text-[10px] font-medium">{statusLabel}</p>
            </div>
          )}

          {ready && (
            <>
              {/* Visualizer bars */}
              <div className="flex items-end gap-0.5 h-12">
                {[...Array(playing ? 12 : 12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-t-full transition-all duration-300 ${
                      playing
                        ? 'bg-gradient-to-t from-racing-600 to-neon-500 animate-pulse'
                        : 'bg-chrome-700'
                    }`}
                    style={{
                      height: playing
                        ? `${20 + Math.random() * 80}%`
                        : '20%',
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>

              {/* Main control button */}
              <button
                type="button"
                onClick={playing ? handleStop : handlePlay}
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
        </div>
      </div>
    </div>
  );
};
