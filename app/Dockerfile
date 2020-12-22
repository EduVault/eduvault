FROM node:13-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm ci
ENV NODE_ENV=production
RUN npm run build
