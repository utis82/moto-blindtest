import data from "./catalog.data.json";

export interface CatalogEntry {
  url: string;
  videoId?: string;
  audioFile?: string;
  startSeconds?: number;
  endSeconds?: number;
  verified?: boolean;
  meta?: {
    title?: string;
    channel?: string;
    thumbnailUrl?: string;
  };
  fallback: {
    manufacturer: string;
    model: string;
    engine?: string;
    cylinders?: string;
    year?: string;
    funFact?: string;
  };
}

export const catalog: CatalogEntry[] = (data as CatalogEntry[]).filter(
  (entry) => entry.verified !== false
);
