# stage 1 - build
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=development
RUN bun install

COPY . .

RUN bun run build || echo "no build step"

# stage 2 - runtime
FROM oven/bun:1

WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "start"]