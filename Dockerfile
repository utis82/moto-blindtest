FROM node:22-alpine AS backend-deps
WORKDIR /app/backend
COPY app/backend/package*.json ./
RUN npm install

FROM backend-deps AS backend-build
COPY app/backend/tsconfig.json .
COPY app/backend/src ./src
COPY app/services ../services
COPY app/db ../db
RUN npm run build

FROM node:22-alpine AS backend
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY app/backend/package.json ./
COPY app/services ../services
COPY app/db ../db
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:deploy && node dist/backend/src/index.js"]

FROM node:22-alpine AS frontend-deps
WORKDIR /app/frontend
COPY app/frontend/package*.json ./
RUN npm install

FROM frontend-deps AS frontend-build
ARG VITE_API_BASE=http://localhost:4000
ENV VITE_API_BASE=$VITE_API_BASE
COPY app/frontend .
RUN npm run build

FROM nginx:1.27-alpine AS frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
