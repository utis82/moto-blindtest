# Multi-stage build pour Moto Blindtest sur Railway
# Build fullstack : Backend Express servant le Frontend React

FROM node:22-alpine AS base
WORKDIR /app

# Stage 1: Build Frontend
FROM base AS frontend-build
WORKDIR /app/frontend
COPY app/frontend/package*.json ./
RUN npm install
COPY app/frontend .
COPY app/shared ../shared
RUN npm run build

# Stage 2: Build Backend
FROM base AS backend-build
WORKDIR /app/backend
COPY app/backend/package*.json ./
RUN npm install
COPY app/backend/tsconfig.json .
COPY app/backend/src ./src
COPY app/services ../services
COPY app/shared ../shared
RUN npm run build

# Stage 3: Generate Prisma Client
FROM base AS prisma-generate
WORKDIR /app/db
COPY app/db/schema.prisma .
COPY app/db/package*.json ./
RUN npm install
RUN npx prisma generate

# Stage 4: Production
FROM node:22-alpine AS production
WORKDIR /app

# Install production dependencies for backend
WORKDIR /app/backend
COPY app/backend/package*.json ./
RUN npm install --omit=dev

# Copy built backend
COPY --from=backend-build /app/backend/dist ./dist

# Copy built frontend to backend public directory
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# Copy database schema and migrations
COPY app/db ../db

# Copy Prisma generated client
COPY --from=prisma-generate /app/db/node_modules/.prisma ../backend/node_modules/.prisma

# Copy services and shared
COPY app/services ../services
COPY app/shared ../shared

# Copy audio files
COPY app/backend/public ../backend/public

# Set environment
ENV NODE_ENV=production

# Expose port (Railway will set PORT dynamically)
EXPOSE ${PORT:-8080}

# Start the backend (which serves the frontend)
CMD ["node", "dist/backend/src/index.js"]
