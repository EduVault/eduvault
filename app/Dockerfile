# dev-stage
FROM node:13-alpine AS dev-stage

EXPOSE 8080

WORKDIR /base/app
COPY package*.json ./
RUN npm install  --silent
RUN npm install @vue/cli -g --silent
COPY . /base/app

CMD ["npm", "run", "serve"]


# production-stage
FROM node:13-alpine AS production-stage
