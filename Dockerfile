# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build && \
    ls -la dist/

# Development stage
FROM node:20-slim AS development

WORKDIR /app

COPY package*.json ./

RUN npm install && \
    apt-get update && \
    apt-get install -y netcat-traditional procps && \
    rm -rf /var/lib/apt/lists/*

COPY . .
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]

# Production stage
FROM node:20-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production && \
    apt-get update && \
    apt-get install -y netcat-traditional procps && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY .env ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"] 