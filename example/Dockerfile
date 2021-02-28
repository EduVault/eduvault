FROM node:14 AS build-stage
# RUN apk update
# RUN apk add git

WORKDIR /example
ENV NODE_ENV=development

ENV PATH /example/node_modules/.bin:$PATH
COPY package.json ./
# COPY yarn.lock ./
RUN yarn config set registry 'https://registry.npmjs.org/'
# RUN yarn config set registry 'https://registry.npm.taobao.org'

RUN yarn install
COPY . .
COPY ./.env ./

FROM build-stage AS dev-stage
RUN yarn global add @vue/cli
EXPOSE 8082
CMD [ "yarn", "dev" ]
