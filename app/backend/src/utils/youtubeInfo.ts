export interface YouTubeInfoPayload {
  title?: string;
  author_name?: string;
  description?: string;
  thumbnail_url?: string;
}

export const fetchYouTubeInfo = async (url: string) => {
  const response = await fetch(
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`
  );
  if (!response.ok) {
    throw new Error("Impossible de récupérer les métadonnées YouTube");
  }
  const payload = (await response.json()) as
    | (YouTubeInfoPayload & { error?: never })
    | { error: string };
  if ("error" in payload) {
    throw new Error(payload.error);
  }
  return payload;
};
