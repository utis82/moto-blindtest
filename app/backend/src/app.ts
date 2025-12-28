import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import apiRouter from "./routes/api";
import gameSessionRouter from "./routes/gameSession";

const envCandidates = [
  process.env.APP_ENV_FILE,
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../db/.env"),
];

let envLoaded = false;
for (const candidate of envCandidates) {
  if (!candidate) continue;
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    envLoaded = true;
    break;
  }
}
if (!envLoaded) {
  dotenv.config();
}

export const createServer = () => {
  const app = express();
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(express.json());

  // Servir les fichiers statiques (audio)
  // En production Docker: /app/backend/public
  // En dev local: ../../public depuis dist/backend/src
  const publicPath = process.env.NODE_ENV === 'production'
    ? path.resolve("/app/backend/public")
    : path.resolve(__dirname, "../../public");
  const fs = require('fs');
  console.log("[Static] Serving files from:", publicPath);
  console.log("[Static] Public path exists:", fs.existsSync(publicPath));
  app.use(express.static(publicPath));

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/debug/files", (_req, res) => {
    const soundsPath = path.join(publicPath, "sounds");
    const files = fs.existsSync(soundsPath) ? fs.readdirSync(soundsPath) : [];
    res.json({ publicPath, soundsPath, files: files.slice(0, 5) });
  });
  app.use("/api", apiRouter);
  app.use("/api/game-session", gameSessionRouter);

  // Servir le frontend React (build en production)
  // En production Docker: /app/frontend/dist
  // En dev local: ../../../frontend/dist depuis dist/backend/src
  const frontendPath = process.env.NODE_ENV === 'production'
    ? path.resolve("/app/frontend/dist")
    : path.resolve(__dirname, "../../../frontend/dist");

  if (fs.existsSync(frontendPath)) {
    console.log("[Frontend] Serving React app from:", frontendPath);
    app.use(express.static(frontendPath));

    // Fallback pour le routing React (SPA) - doit être le dernier middleware
    app.use((_req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    console.log("[Frontend] Build not found at:", frontendPath);
    console.log("[Frontend] __dirname:", __dirname);
    console.log("[Frontend] NODE_ENV:", process.env.NODE_ENV);
  }

  return app;
};
