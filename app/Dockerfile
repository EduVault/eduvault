FROM node:13-alpine

WORKDIR /base/app
COPY package*.json ./
RUN npm install  --silent
COPY . .
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

COPY /base/app/dist /var/www/html
