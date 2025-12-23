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
  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api", apiRouter);
  app.use("/api/game-session", gameSessionRouter);
  return app;
};
