FROM node:20-alpine
WORKDIR /app
COPY ../../backend/worker/package*.json ./
RUN npm ci --only=production
COPY ../../backend/worker/src ./src
ENV NODE_ENV=production
CMD ["npm", "start"]