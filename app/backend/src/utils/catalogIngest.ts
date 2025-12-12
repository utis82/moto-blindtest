import { prisma } from "../lib/prisma";
import { catalog } from "../../../services/catalog";
import { fetchYouTubeInfo } from "./youtubeInfo";
import { inferMetadata } from "../../../services/ai_metadata";
import { clampWindow, extractVideoId } from "../../../services/youtube";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const resolveMeta = async (
  entry: (typeof catalog)[number]
): Promise<{
  title?: string;
  channel?: string;
  thumbnailUrl?: string;
}> => {
  try {
    const info = await fetchYouTubeInfo(entry.url);
    return {
      title: info.title,
      channel: info.author_name,
      thumbnailUrl: info.thumbnail_url,
    };
  } catch (error) {
    if (entry.meta) {
      console.warn(
        `Impossible de récupérer les meta depuis noembed, utilisation des données locales pour ${entry.url}`
      );
      return entry.meta;
    }
    throw error;
  }
};

const upsertEntry = async (url: string) => {
  const entry = catalog.find((candidate) => candidate.url === url);
  if (!entry) return;
  const meta = await resolveMeta(entry);
  const videoId = entry.videoId ?? extractVideoId(url);
  if (!videoId) {
    throw new Error(`Impossible d'extraire l'identifiant vidéo pour ${url}`);
  }
  const inference = inferMetadata({
    title:
      meta.title ??
      `${entry.fallback.manufacturer} ${entry.fallback.model}`.trim(),
    description: entry.fallback.funFact ?? "",
    channel: meta.channel ?? entry.fallback.manufacturer,
  });
  const motoName = inference.model ?? entry.fallback.model;
  const manufacturer = inference.manufacturer ?? entry.fallback.manufacturer;
  const slug = slugify(`${manufacturer}-${motoName}`);
  const moto = await prisma.moto.upsert({
    where: { slug },
    update: {
      engine: inference.engine ?? entry.fallback.engine,
      era: inference.era,
      funFact: inference.funFact ?? entry.fallback.funFact,
      cylinders: inference.cylinders ?? entry.fallback.cylinders,
      year: inference.year ?? entry.fallback.year,
    },
    create: {
      slug,
      manufacturer,
      name: motoName,
      engine: inference.engine ?? entry.fallback.engine,
      era: inference.era,
      funFact: inference.funFact ?? entry.fallback.funFact,
      cylinders: inference.cylinders ?? entry.fallback.cylinders,
      year: inference.year ?? entry.fallback.year,
    },
  });
  const window = clampWindow({
    startSeconds: entry.startSeconds ?? 20,
    endSeconds: entry.endSeconds ?? 35,
  });
  const source = await prisma.source.upsert({
    where: { url },
    update: {
      videoId,
      title: meta.title,
      channel: meta.channel,
      thumbnailUrl: meta.thumbnailUrl,
      startSeconds: window.startSeconds,
      endSeconds: window.endSeconds,
      duration: window.endSeconds - window.startSeconds,
      motoId: moto.id,
      aiConfidence: inference.confidence,
      aiMetadata: JSON.stringify(inference),
    },
    create: {
      url,
      videoId,
      title: meta.title,
      channel: meta.channel,
      thumbnailUrl: meta.thumbnailUrl,
      startSeconds: window.startSeconds,
      endSeconds: window.endSeconds,
      duration: window.endSeconds - window.startSeconds,
      motoId: moto.id,
      aiConfidence: inference.confidence,
      aiMetadata: JSON.stringify(inference),
    },
  });
  const activeRound = await prisma.round.findFirst({
    where: {
      sourceId: source.id,
      status: {
        in: ["PENDING", "ACTIVE"],
      },
    },
  });
  if (!activeRound) {
    await prisma.round.create({
      data: {
        sourceId: source.id,
        status: "PENDING",
        difficulty: 2,
      },
    });
  }
};

let ensurePromise: Promise<void> | null = null;

export const ensureCatalogIngested = async () => {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const item of catalog) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await upsertEntry(item.url);
        } catch (error) {
          console.error("Auto-ingestion échouée", error);
        }
      }
    })().finally(() => {
      ensurePromise = null;
    });
  }
  return ensurePromise;
};
