import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.moto.count();
  const withAudio = await prisma.moto.count({
    where: {
      sources: {
        some: {
          audioFile: {
            not: null
          }
        }
      }
    }
  });

  console.log(`\n📊 STATISTIQUES DU CATALOGUE`);
  console.log(`${'='.repeat(40)}`);
  console.log(`Total motos: ${count}`);
  console.log(`Motos avec audio: ${withAudio}`);
  console.log(`${'='.repeat(40)}\n`);
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
