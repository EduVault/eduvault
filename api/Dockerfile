# dev-stage
FROM node:13-alpine AS dev-stage

EXPOSE 3000 
WORKDIR /base/api
COPY package*.json ./
RUN npm install --silent
COPY . /base/api

CMD ["npm", "run", "serve"]


# production-stage
FROM node:13-alpine AS production-stage
