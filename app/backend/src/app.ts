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
  const publicPath = path.resolve(__dirname, "../../public");
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
  return app;
};
