FROM node:13-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install  --silent
COPY . .
RUN npm ci
RUN npm run build
ENV NODE_ENV=production
COPY . .
COPY ./dist /var/www/shared/dist
CMD ["npm", "run", "build"]