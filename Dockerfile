FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/docs/package.json ./apps/docs/
COPY apps/socs/package.json ./apps/socs/
COPY packages/docs-ui/package.json ./packages/docs-ui/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app ./
COPY . .
ARG APP=docs
ARG NEXT_PUBLIC_DOCS_URL=https://docs.cerebronix.com
ARG NEXT_PUBLIC_SOCS_URL=https://developer.cerebronix.com
ENV NEXT_PUBLIC_DOCS_URL=$NEXT_PUBLIC_DOCS_URL
ENV NEXT_PUBLIC_SOCS_URL=$NEXT_PUBLIC_SOCS_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter "@cerebronix/${APP}" build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG APP=docs
ENV APP=$APP
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/public ./apps/${APP}/public
USER nextjs
EXPOSE 3000
CMD ["sh", "-c", "node apps/${APP}/server.js"]
