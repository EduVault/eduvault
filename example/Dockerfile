FROM node:12 AS build-stage
# RUN apk update
# RUN apk add git

WORKDIR /example
ENV NODE_ENV=development
ARG TEST=0
ENV VUE_APP_TEST=$TEST
ENV PATH /example/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
# RUN yarn config set registry 'https://registry.npmjs.org/'
# RUN yarn config set registry 'https://registry.npm.taobao.org'

RUN yarn install
COPY . .
# RUN ls node_modules/@eduvault
FROM build-stage AS dev-stage
# RUN yarn global add @vue/cli
CMD [ "yarn", "dev" ]
