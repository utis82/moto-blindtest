import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface DownloadedMoto {
  manufacturer: string;
  model: string;
  engine: string;
  cylinders: string;
  year: string;
  funFact: string;
  audioFile: string;
  videoId: string;
  youtubeUrl: string;
  startSeconds: number;
  endSeconds: number;
}

async function main() {
  const fileName = process.argv[2] || "downloaded_motos.json";
  const jsonPath = path.join(__dirname, fileName);
  console.log(`📁 Lecture du fichier: ${fileName}`);
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as DownloadedMoto[];

  console.log(`📋 ${data.length} motos à ajouter\n`);

  let added = 0;
  let skipped = 0;

  for (const item of data) {
    try {
      // Vérifier si la moto existe déjà
      const existingMoto = await prisma.moto.findFirst({
        where: {
          manufacturer: item.manufacturer,
          name: item.model,
        },
      });

      if (existingMoto) {
        console.log(`⏭️  Moto déjà existante: ${item.manufacturer} ${item.model}`);
        skipped++;
        continue;
      }

      // Déterminer l'ère
      const year = parseInt(item.year);
      let era: string;
      if (year < 1980) era = "classic";
      else if (year < 2000) era = "retro";
      else era = "modern";

      // Créer un slug unique
      const slug = `${item.manufacturer.toLowerCase().replace(/\s+/g, "-")}-${item.model.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

      // Créer la moto
      const moto = await prisma.moto.create({
        data: {
          manufacturer: item.manufacturer,
          name: item.model,
          slug: slug,
          engine: item.engine,
          cylinders: item.cylinders,
          year: item.year,
          era: era,
          funFact: item.funFact,
        },
      });

      // Créer la source audio
      await prisma.source.create({
        data: {
          url: item.youtubeUrl,
          videoId: item.videoId,
          audioFile: item.audioFile,
          startSeconds: item.startSeconds,
          endSeconds: item.endSeconds,
          duration: item.endSeconds - item.startSeconds,
          title: `${item.manufacturer} ${item.model} Sound`,
          channel: "YouTube",
          thumbnailUrl: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
          motoId: moto.id,
        },
      });

      console.log(`✅ Ajouté: ${item.manufacturer} ${item.model}`);
      added++;

      // Petit délai pour éviter de surcharger
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Erreur pour ${item.manufacturer} ${item.model}:`, error);
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
