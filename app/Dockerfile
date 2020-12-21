FROM node:13-alpine

WORKDIR /home/node/app
COPY package*.json ./
RUN npm install  --silent
COPY . .
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

COPY /home/node/app/dist /var/www/html
