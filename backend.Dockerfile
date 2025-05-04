# Backend Dockerfile  
# filepath: backend.Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy all backend files
COPY server.js ./
COPY redisClient.js ./
COPY solrClient.js ./
COPY backend/ ./backend/
COPY config/ ./config/

EXPOSE 3000

CMD ["node", "server.js"]