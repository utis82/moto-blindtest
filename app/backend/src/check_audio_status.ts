import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Analyse du catalogue de motos...\n");

  // Récupérer toutes les motos avec leurs sources
  const motos = await prisma.moto.findMany({
    include: {
      sources: true,
    },
    orderBy: {
      manufacturer: "asc",
    },
  });

  console.log(`📊 Total motos dans la base: ${motos.length}\n`);

  // Chemin vers les fichiers audio
  const publicPath = path.resolve(__dirname, "../../public/sounds");

  let motosWithAudio = 0;
  let motosWithoutAudio = 0;
  const missingAudio: string[] = [];
  const availableAudio: string[] = [];

  for (const moto of motos) {
    const fullName = `${moto.manufacturer} ${moto.name}`;

    if (moto.sources.length === 0) {
      console.log(`❌ ${fullName} - Aucune source audio définie`);
      missingAudio.push(fullName);
      motosWithoutAudio++;
      continue;
    }

    const source = moto.sources[0];
    if (!source.audioFile) {
      console.log(`❌ ${fullName} - Source sans fichier audio`);
      missingAudio.push(fullName);
      motosWithoutAudio++;
      continue;
    }

    // Vérifier si le fichier existe
    const audioPath = path.join(publicPath, path.basename(source.audioFile));
    if (fs.existsSync(audioPath)) {
      console.log(`✅ ${fullName} - Audio OK (${path.basename(source.audioFile)})`);
      availableAudio.push(fullName);
      motosWithAudio++;
    } else {
      console.log(`⚠️  ${fullName} - Fichier manquant: ${path.basename(source.audioFile)}`);
      missingAudio.push(fullName);
      motosWithoutAudio++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📈 RÉSUMÉ");
  console.log("=".repeat(60));
  console.log(`✅ Motos avec audio fonctionnel: ${motosWithAudio}`);
  console.log(`❌ Motos sans audio: ${motosWithoutAudio}`);
  console.log(`📁 Répertoire audio: ${publicPath}`);

  if (fs.existsSync(publicPath)) {
    const files = fs.readdirSync(publicPath).filter(f => f.endsWith('.mp3'));
    console.log(`🎵 Fichiers MP3 trouvés: ${files.length}`);
  }

  console.log("\n💡 RECOMMANDATION:");
  if (motosWithoutAudio > 0) {
    console.log(`Il faut supprimer les ${motosWithoutAudio} motos sans audio`);
    console.log(`ou télécharger les fichiers audio manquants.`);
    console.log(`\nPour un catalogue prêt à jouer, gardez seulement les ${motosWithAudio} motos avec audio.`);
  } else {
    console.log("✨ Toutes les motos ont des fichiers audio! Le catalogue est prêt!");
  }
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
