import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Nettoyage de la base de données...\n");

  // Chemin vers les vrais fichiers audio
  const publicPath = path.resolve(__dirname, "../public/sounds");
  console.log(`📁 Répertoire audio: ${publicPath}\n`);

  if (!fs.existsSync(publicPath)) {
    console.error("❌ Le répertoire audio n'existe pas!");
    return;
  }

  // Lister tous les fichiers MP3 disponibles
  const availableFiles = fs.readdirSync(publicPath)
    .filter(f => f.endsWith('.mp3'))
    .map(f => `/sounds/${f}`);

  console.log(`🎵 ${availableFiles.length} fichiers MP3 trouvés\n`);

  // Récupérer toutes les motos
  const allMotos = await prisma.moto.findMany({
    include: {
      sources: true,
    },
  });

  console.log(`📊 ${allMotos.length} motos dans la base\n`);

  let kept = 0;
  let deleted = 0;

  for (const moto of allMotos) {
    const fullName = `${moto.manufacturer} ${moto.name}`;

    // Vérifier si la moto a une source avec un fichier audio valide
    const hasValidAudio = moto.sources.some(source =>
      source.audioFile && availableFiles.includes(source.audioFile)
    );

    if (hasValidAudio) {
      console.log(`✅ GARDE: ${fullName}`);
      kept++;
    } else {
      console.log(`❌ SUPPRIME: ${fullName}`);

      // Supprimer les sources associées
      await prisma.source.deleteMany({
        where: { motoId: moto.id },
      });

      // Supprimer la moto
      await prisma.moto.delete({
        where: { id: moto.id },
      });

      deleted++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ NETTOYAGE TERMINÉ");
  console.log("=".repeat(60));
  console.log(`✅ Motos conservées: ${kept}`);
  console.log(`❌ Motos supprimées: ${deleted}`);
  console.log(`\n💡 Base de données prête avec ${kept} motos fonctionnelles!`);
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
