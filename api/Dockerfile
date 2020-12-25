FROM node:12-alpine AS build-stage
WORKDIR /api
COPY package*.json ./

ENV NODE_ENV=development

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
EXPOSE 3000 

FROM build-stage AS dev-stage
RUN yarn add global node-dev
CMD ["yarn", "dev"]