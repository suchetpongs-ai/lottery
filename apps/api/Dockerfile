FROM node:18-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache openssl
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache openssl
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Implement Prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

RUN turbo run build --filter=api...

FROM node:18-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app .

CMD ["node", "apps/api/dist/main"]
