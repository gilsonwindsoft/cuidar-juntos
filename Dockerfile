# stage 1 - build
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package*.json ./

# FORÇA instalar tudo (inclusive devDependencies)
ENV NODE_ENV=development
RUN bun install

COPY . .

# Se existir build (vite, etc.), executa
RUN bun run build || echo "no build step"

# stage 2 - runtime
FROM oven/bun:1-alpine

WORKDIR /app

COPY --from=builder /app ./

# Agora sim: ambiente de produção
ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "start"]