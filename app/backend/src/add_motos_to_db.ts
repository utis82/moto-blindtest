import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface MotoToAdd {
  url: string;
  videoId: string;
  audioFile: string;
  startSeconds: number;
  endSeconds: number;
  verified: boolean;
  meta: {
    title: string;
    channel: string;
    thumbnailUrl: string;
  };
  fallback: {
    manufacturer: string;
    model: string;
    engine: string;
    cylinders: string;
    year: string;
    funFact: string;
  };
}

async function main() {
  // Lire le fichier JSON (accepter un argument pour le nom du fichier)
  const fileName = process.argv[2] || "add_20_motos.json";
  const jsonPath = path.join(__dirname, fileName);
  console.log(`📁 Lecture du fichier: ${fileName}`);
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as MotoToAdd[];

  console.log(`📋 ${data.length} motos à ajouter`);

  let added = 0;
  let skipped = 0;

  for (const item of data) {
    try {
      // Vérifier si la moto existe déjà
      const existingMoto = await prisma.moto.findFirst({
        where: {
          manufacturer: item.fallback.manufacturer,
          name: item.fallback.model,
        },
      });

      if (existingMoto) {
        console.log(`⏭️  Moto déjà existante: ${item.fallback.manufacturer} ${item.fallback.model}`);
        skipped++;
        continue;
      }

      // Déterminer l'ère basée sur l'année
      const year = parseInt(item.fallback.year);
      let era: string;
      if (year < 1980) era = "classic";
      else if (year < 2000) era = "retro";
      else era = "modern";

      // Créer un slug unique
      const slug = `${item.fallback.manufacturer.toLowerCase().replace(/\s+/g, "-")}-${item.fallback.model.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

      // Créer la moto
      const moto = await prisma.moto.create({
        data: {
          manufacturer: item.fallback.manufacturer,
          name: item.fallback.model,
          slug: slug,
          engine: item.fallback.engine,
          cylinders: item.fallback.cylinders,
          year: item.fallback.year,
          era: era,
          funFact: item.fallback.funFact,
        },
      });

      // Créer la source audio
      await prisma.source.create({
        data: {
          url: item.url,
          videoId: item.videoId,
          audioFile: item.audioFile,
          startSeconds: item.startSeconds,
          endSeconds: item.endSeconds,
          duration: item.endSeconds - item.startSeconds,
          title: item.meta.title,
          channel: item.meta.channel,
          thumbnailUrl: item.meta.thumbnailUrl,
          motoId: moto.id,
        },
      });

      console.log(`✅ Ajouté: ${item.fallback.manufacturer} ${item.fallback.model}`);
      added++;
    } catch (error) {
      console.error(`❌ Erreur pour ${item.fallback.manufacturer} ${item.fallback.model}:`, error);
    }
  }

  console.log(`\n✨ Terminé!`);
  console.log(`  - ${added} motos ajoutées`);
  console.log(`  - ${skipped} motos déjà existantes`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
