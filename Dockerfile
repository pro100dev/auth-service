# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build && \
    ls -la dist/

# Development stage
FROM node:20-slim AS dev

WORKDIR /app

COPY package*.json ./

RUN npm install && \
    npm install -g @nestjs/cli && \
    apt-get update && \
    apt-get install -y netcat-traditional procps && \
    rm -rf /var/lib/apt/lists/*

COPY . .
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["/bin/sh", "./entrypoint.sh"]

# Production stage
FROM node:20-slim AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production && \
    apt-get update && \
    apt-get install -y netcat-traditional procps && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/typeorm.config.ts ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["/bin/sh", "./entrypoint.sh"] 