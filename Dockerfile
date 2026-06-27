FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y zsh openjdk-17-jdk-headless && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080
CMD ["node", "server/index.mjs"]
