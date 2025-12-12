export interface BasePlaybackWindow {
  url: string;
  videoId: string;
  startSeconds: number;
  endSeconds: number;
}

const WATCH_MATCH =
  /(?:youtu\.be\/|v=|\/shorts\/|embed\/)([A-Za-z0-9_-]{11})/i;

export const extractVideoId = (url: string) => {
  const match = url.match(WATCH_MATCH);
  return match ? match[1] : null;
};

export const clampWindow = (
  window: Pick<BasePlaybackWindow, "startSeconds" | "endSeconds">,
  minDuration = 10,
  maxDuration = 20
) => {
  const start = Math.max(0, window.startSeconds);
  const rawDuration = Math.max(window.endSeconds - start, minDuration);
  const duration = Math.min(rawDuration, maxDuration);
  return {
    startSeconds: start,
    endSeconds: start + duration,
  };
};

export const buildPlayerParams = (window: BasePlaybackWindow) => ({
  videoId: window.videoId,
  playerVars: {
    start: window.startSeconds,
    end: window.endSeconds,
    autoplay: 0,
    controls: 0,
    disablekb: 1,
    modestbranding: 1,
    rel: 0,
  },
});

export const buildEmbedUrl = (window: BasePlaybackWindow) => {
  const params = new URLSearchParams({
    start: String(window.startSeconds),
    end: String(window.endSeconds),
    autoplay: "0",
    controls: "0",
    rel: "0",
    enablejsapi: "1",
    modestbranding: "1",
  });
  return `https://www.youtube.com/embed/${window.videoId}?${params.toString()}`;
};

