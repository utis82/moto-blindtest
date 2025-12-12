# Moto Blindtest

Blind test complet dédié aux rugissements de moteurs de moto. Le backend Express/TypeScript auto-alimente la base depuis un catalogue YouTube, complète les fiches moto via une heuristique “mini IA” et expose les endpoints de manches/scoring/indices. Le frontend React/Vite/Tailwind propose une UI sombre exclusivement audio avec des champs séparés (marque, modèle, cylindres, architecture, année) et un breakdown détaillé des scores. Prisma + SQLite servent de couche de persistance (Postgres prêt pour plus tard). Le tout est structuré dans `/app` pour un futur déploiement Docker.

## Architecture

- `app/backend` – API Express (TypeScript) + scripts Prisma et ingestion automatique.
- `app/services` – Services partagés (catalogue vidéo, scoring structuré, indices, heuristique IA, helper YouTube).
- `app/db` – Schéma Prisma, migrations, seed et configuration `.env`.
- `app/frontend` – Vite + React + Tailwind (GamePage audio-only, ResultCard, historique).

## Fonctionnalités clés

- Auto-ingestion : `app/services/catalog.data.json` contient une liste extensible de vidéos YouTube (vérifiées). À chaque démarrage ou premier `/api/rounds/next`, le backend les charge via noembed, découpe une fenêtre audio et crée/actualise les fiches motos/rounds Prisma (`ensureCatalogIngested`). Ajoute autant d'entrées que nécessaire (100+), tant que `verified` est `true` et que les métadonnées sont fiables.
- Endpoints REST : `/api/rounds/next`, `/api/guess`, `/api/hints`.
- Mini IA heuristique (`services/ai_metadata.ts`) pour inférer marque/modèle/architecture/cylindres/année/fun fact depuis les métadonnées YouTube.
- Service de scoring structuré (`services/scoring.ts`) : pondérations par champ (marque, modèle, moteur, cylindres, année) + bonus rapidité.
- Indices progressifs (`services/hints.ts`) enrichis de nouveaux indices (cylindres, année, fun fact, chaîne).
- UI sombre uniquement audio : lecteur masqué, barre de progression, formulaire multi-champs, carte de résultats détaillée (scores par champ + vérité + fun fact), historique et bouton indices.
- Prisma schema `Moto`, `Source`, `Round`, `Guess` + seed de motos emblématiques.
- Dockerfile multi-stage (backend + frontend) + `docker-compose.yml` pour une stack prête à empaqueter.

## Pré-requis

- WSL Ubuntu avec Node.js ≥ 20, npm et SQLite.
- Prisma CLI (installée via `npm install` du backend).

## Configuration `.env`

Un exemple est disponible dans `app/db/.env.example`.

```bash
cp app/db/.env.example app/db/.env
```

Variables :

- `PORT` – port exposé par l’API Express (par défaut `4000`).
- `DATABASE_URL` – connexion Prisma (SQLite `file:../db/dev.db`, pourra devenir Postgres plus tard).

Le backend charge aussi ce fichier via `dotenv`, inutile de le dupliquer ailleurs.

## Installation & lancement (WSL Ubuntu)

```bash
# Backend
cd app/backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev      # API http://localhost:4000

# Frontend (nouvelle session)
cd app/frontend
npm install
npm run dev      # UI http://localhost:5173
```

Accès UI : http://localhost:5173 (proxy vers `/api` ou `VITE_API_BASE` configurable). Lancer le backend avant la partie frontend.

## Scripts utiles

- Backend : `npm run build`, `npm start` (Express compilé), `npm run prisma:migrate`, `npm run prisma:seed`.
- Frontend : `npm run build`, `npm run preview`.

## Seed & base Prisma

`app/db/seed.ts` charge plusieurs motos iconiques (Panigale V4S, Yamaha R1, Breakout 114, BMW S1000RR, etc.) avec les nouvelles informations (cylindres, année). Relancer le seed est idempotent. En runtime, l’API appellera aussi `services/catalog` pour ajouter automatiquement toute vidéo absente en base.

### Ajouter plus de sources vérifiées

- `app/services/catalog.data.json` héberge la liste des sons disponibles. Chaque entrée contient l’URL YouTube + la fenêtre audio + des métadonnées certifiées.
- Ajoute autant d’objets que nécessaire (100/200...) en renseignant `verified: true` uniquement si les infos sont sûres.
- Les champs `fallback` sont utilisés lors de la création de la moto : marque, modèle, architecture, cylindres, année, fun fact.
- Après modification, relance l’API (`npm run dev`) pour que `ensureCatalogIngested` mette à jour la base et programme de nouveaux rounds.

## Docker

Construire et lancer les deux services :

```bash
docker compose up --build
```

- `api` – build `Dockerfile` (target `backend`), lance `npm run prisma:deploy` puis l’API sur `:4000` (auto-ingestion incluse).
- `web` – build `Dockerfile` (target `frontend`), sert le build Vite via Nginx sur `:5173`. `VITE_API_BASE` peut être surchargé (`docker compose build web --build-arg VITE_API_BASE=http://mon-api:4000`).

Volume `./app/db` monté dans `api` pour conserver la base SQLite locale.

## Tests & vérification rapide

- `curl http://localhost:4000/healthz` pour vérifier l’API.
- `GET /api/rounds/next` affiche la prochaine manche (si aucune source n'existe, l'auto-ingestion se déclenche).
- `POST /api/guess` avec les champs structurés renvoie le score détaillé.
- Frontend : vérifier GamePage (audio masqué, formulaire multi-champs, indices, carte résultat avec comparatif).

## Notes

- Passage à Postgres : modifier `DATABASE_URL`, adapter `schema.prisma` (provider) puis relancer `prisma migrate`.
- Services partagés (`app/services`) servent autant au backend qu’à de futurs workers/CLI.
- Pour développer côté front, `VITE_API_BASE` peut être défini dans `app/frontend/.env` si l’API tourne sur un port spécifique.
