FROM node:20-alpine
WORKDIR /app
COPY ../../backend/worker/package*.json ./
RUN npm ci
COPY ../../backend/worker .
CMD ["node", "index.js"]