import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seeds = [
  {
    manufacturer: "Ducati",
    name: "Panigale V4S",
    slug: "ducati-panigale-v4s",
    engine: "V4",
    era: "2018+",
    cylinders: "4",
    year: "2018",
    funFact: "Première superbike de série Ducati équipée d'un V4.",
    sources: [
      {
        url: "https://www.youtube.com/watch?v=6fVjQbtzICM",
        videoId: "6fVjQbtzICM",
        startSeconds: 25,
        endSeconds: 40,
      },
    ],
  },
  {
    manufacturer: "Yamaha",
    name: "YZF-R1 Akrapovic",
    slug: "yamaha-r1-akrapovic",
    engine: "Inline-4",
    era: "2015+",
    cylinders: "4",
    year: "2015",
    funFact: "L'ADN moteur de la R1 provient directement du MotoGP.",
    sources: [
      {
        url: "https://www.youtube.com/watch?v=zsznxlIOov0",
        videoId: "zsznxlIOov0",
        startSeconds: 20,
        endSeconds: 35,
      },
    ],
  },
  {
    manufacturer: "Harley-Davidson",
    name: "Breakout 114",
    slug: "harley-breakout-114",
    engine: "V-Twin",
    era: "2018+",
    cylinders: "2",
    year: "2018",
    funFact: "Le Breakout 114 est taillé pour cruiser en faisant vibrer tout le quartier.",
    sources: [
      {
        url: "https://www.youtube.com/watch?v=bPBcVWI6Mi4",
        videoId: "bPBcVWI6Mi4",
        startSeconds: 40,
        endSeconds: 55,
      },
    ],
  },
];

const main = async () => {
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
          motoId: createdMoto.id,
        },
        create: {
          url: source.url,
          videoId: source.videoId,
          startSeconds: source.startSeconds,
          endSeconds: source.endSeconds,
          duration: source.endSeconds - source.startSeconds,
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
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
