FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build && \
    ls -la dist/

EXPOSE 3000

CMD ["npm", "run", "start:dev"] 