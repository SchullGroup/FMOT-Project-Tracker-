# syntax=docker/dockerfile:1
# The web app image (Next.js standalone server). Build from the repository root:
#   docker build -f apps/web/Dockerfile --build-arg API_ORIGIN=https://<staging api> -t fmot-web .
# Both arguments are fixed at build time: NEXT_PUBLIC_* goes into the browser bundle, and Next.js resolves the /api
# rewrite (next.config.ts) when it builds. One image per environment.
ARG NODE_VERSION=26.11.1

FROM node:${NODE_VERSION}-bookworm-slim AS base
RUN npm install --global pnpm@12.11.2 && npm cache clean --force
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter "web..."
COPY packages/shared packages/shared
COPY apps/web apps/web
ARG API_ORIGIN=http://localhost:4000
ARG NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
ENV API_ORIGIN=${API_ORIGIN} \
    NEXT_PUBLIC_MAP_STYLE_URL=${NEXT_PUBLIC_MAP_STYLE_URL} \
    NEXT_PUBLIC_API_MOCK=0 \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @fmot/shared build \
    && cd apps/web && node scripts/copy-maplibre-worker.mjs && pnpm exec next build

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# The standalone output keeps the workspace layout: the server is apps/web/server.js.
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/sign-in').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
