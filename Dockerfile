# Multi-stage build pour Moto Blindtest sur Railway
# Build fullstack : Backend Express servant le Frontend React

FROM node:22-slim AS base
WORKDIR /app
# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Stage 1: Build Frontend
FROM base AS frontend-build
WORKDIR /app/frontend
COPY app/frontend/package*.json ./
RUN npm install
COPY app/frontend .
COPY app/shared ../shared
RUN npm run build

# Stage 2: Build Backend with Prisma
FROM base AS backend-build
WORKDIR /app/backend
COPY app/backend/package*.json ./
RUN npm install
COPY app/backend/tsconfig.json .
COPY app/backend/src ./src
COPY app/services ../services
COPY app/shared ../shared
COPY app/db ../db
# Generate Prisma client
RUN npm run prisma:generate
# Build backend
RUN npm run build

# Stage 3: Production
FROM node:22-slim AS production
WORKDIR /app
# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install production dependencies for backend
WORKDIR /app/backend
COPY app/backend/package*.json ./
RUN npm install --omit=dev

# Install ts-node and @prisma/client for seeding
RUN npm install --no-save ts-node @types/node

# Copy built backend
COPY --from=backend-build /app/backend/dist ./dist

# Copy built frontend to backend public directory
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# Copy database schema and migrations
COPY app/db ../db

# Copy Prisma generated client from backend build
COPY --from=backend-build /app/backend/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma CLI and all dependencies from backend build (needed for migrations)
COPY --from=backend-build /app/backend/node_modules/prisma ../db/node_modules/prisma
COPY --from=backend-build /app/backend/node_modules/@prisma ../db/node_modules/@prisma
COPY --from=backend-build /app/backend/node_modules/.bin ../db/node_modules/.bin

# Copy services and shared
COPY app/services ../services
COPY app/shared ../shared

# Copy audio files
COPY app/backend/public ./public

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Set environment
ENV NODE_ENV=production

# Expose port (Railway will set PORT dynamically)
EXPOSE ${PORT:-8080}

# Use startup script that initializes DB and starts the server
CMD ["/app/start.sh"]
