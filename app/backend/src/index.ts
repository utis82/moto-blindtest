import { createServer } from "./app";
import { PrismaClient } from "@prisma/client";
import { qcmCache } from "../../services/qcmOptionsCache";

const prisma = new PrismaClient();

async function startServer() {
  try {
    // Initialiser le cache QCM au démarrage
    console.log("[Server] Initialisation du cache QCM...");
    await qcmCache.initialize(prisma);
    console.log("[Server] Cache QCM initialisé avec succès ✓");

    const app = createServer();
    const port = Number(process.env.PORT) || 4000;

    app.listen(port, () => {
      console.log(`Moto blind test API ready on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("[Server] Erreur lors du démarrage:", error);
    process.exit(1);
  }
}

startServer();
