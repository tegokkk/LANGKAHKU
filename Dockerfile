FROM node:24-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:24-bookworm-slim AS backend
WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001 STATIC_DIR=/app/frontend/dist PG_BIN=/usr/bin
WORKDIR /app/backend
COPY --from=backend /build/backend/node_modules ./node_modules
COPY backend/package.json ./
COPY backend/src ./src
COPY backend/scripts ./scripts
COPY backend/migrations ./migrations
COPY --from=frontend /build/frontend/dist /app/frontend/dist
RUN mkdir -p /state /backups && chown node:node /state /backups
USER node
EXPOSE 3001
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/v1/health/ready',{signal:AbortSignal.timeout(8000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
