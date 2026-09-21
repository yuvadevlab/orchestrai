# Multi-stage production Dockerfile for OrchestrAI monorepo apps
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.2.1

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

EXPOSE 8000 8001 3001
CMD ["node", "dist/index.js"]
