import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./app/db/dev.db",
    },
  },
});

async function exportSeed() {
  // Récupérer toutes les motos avec leurs sources
  const motos = await prisma.moto.findMany({
    include: {
      sources: true,
    },
  });

  console.log(`Found ${motos.length} motorcycles`);

  // Générer le code seed.ts
  const seedData = motos.map((moto) => {
    const sources = moto.sources.map((source) => ({
      url: source.url,
      videoId: source.videoId,
      startSeconds: source.startSeconds,
      endSeconds: source.endSeconds,
      audioFile: source.audioFile || undefined,
    }));

    return {
      manufacturer: moto.manufacturer,
      name: moto.name,
      slug: moto.slug,
      engine: moto.engine,
      era: moto.era,
      cylinders: moto.cylinders,
      year: moto.year,
      funFact: moto.funFact,
      sources,
    };
  });

  // Générer le fichier seed.ts
  const seedContent = `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seeds = ${JSON.stringify(seedData, null, 2)};

const main = async () => {
  console.log(\`Seeding \${seeds.length} motorcycles...\`);

  for (const moto of seeds) {
    const createdMoto = await prisma.moto.upsert({
      where: { slug: moto.slug },
      update: {
        funFact: moto.funFact,
        engine: moto.engine,
        era: moto.era,
      },
      create: {
        manufacturer: moto.manufacturer,
        name: moto.name,
        slug: moto.slug,
        engine: moto.engine,
        era: moto.era,
        cylinders: moto.cylinders,
        year: moto.year,
        funFact: moto.funFact,
      },
    });

    for (const source of moto.sources) {
      const createdSource = await prisma.source.upsert({
        where: { url: source.url },
        update: {
          startSeconds: source.startSeconds,
          endSeconds: source.endSeconds,
          duration: source.endSeconds - source.startSeconds,
          audioFile: source.audioFile,
          motoId: createdMoto.id,
        },
        create: {
          url: source.url,
          videoId: source.videoId,
          startSeconds: source.startSeconds,
          endSeconds: source.endSeconds,
          duration: source.endSeconds - source.startSeconds,
          audioFile: source.audioFile,
          motoId: createdMoto.id,
        },
      });

      await prisma.round.create({
        data: {
          sourceId: createdSource.id,
          status: "PENDING",
          difficulty: 2,
        },
      });
    }
  }

  console.log(\`✅ Seeded \${seeds.length} motorcycles successfully!\`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  // Écrire le fichier
  fs.writeFileSync("./app/db/seed.ts", seedContent);
  console.log(`✅ Generated seed.ts with ${seedData.length} motorcycles`);
}

exportSeed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
