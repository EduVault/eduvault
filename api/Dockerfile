FROM node:12-alpine AS build-stage
ENV PATH /api/node_modules/.bin:$PATH
RUN apk update
RUN apk add git
WORKDIR /api
# RUN rm -rf node_modules
COPY package.json ./
COPY yarn.lock ./
# RUN yarn config set registry 'https://registry.npmjs.org/'
# RUN yarn config set registry 'https://registry.npm.taobao.org'

RUN yarn install
RUN yarn install --frozen-lockfile
COPY . .
# RUN yarn build
# RUN cd ./node_modules/multiformats && ls
EXPOSE 3003 

FROM build-stage AS dev-stage
# RUN yarn add global node-dev
CMD ["yarn", "dev"]