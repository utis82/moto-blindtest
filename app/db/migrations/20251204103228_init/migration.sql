-- CreateTable
CREATE TABLE "Moto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "engine" TEXT,
    "era" TEXT,
    "funFact" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT,
    "channel" TEXT,
    "thumbnailUrl" TEXT,
    "startSeconds" INTEGER NOT NULL DEFAULT 0,
    "endSeconds" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 15,
    "motoId" INTEGER,
    "aiConfidence" REAL NOT NULL DEFAULT 0.5,
    "aiMetadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Source_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Round" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "hintLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Round_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roundId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL DEFAULT 'Solo rider',
    "guessText" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "breakdown" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guess_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Moto_slug_key" ON "Moto"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Source_url_key" ON "Source"("url");
