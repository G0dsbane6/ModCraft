FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y zsh bsdmainutils openjdk-17-jdk-headless wget unzip && \
    wget -q https://services.gradle.org/distributions/gradle-8.10-bin.zip -O /tmp/gradle.zip && \
    unzip -q /tmp/gradle.zip -d /opt && \
    ln -s /opt/gradle-8.10/bin/gradle /usr/local/bin/gradle && \
    rm /tmp/gradle.zip && \
    rm -rf /var/lib/apt/lists/*
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
