FROM node:12 AS build-stage
RUN mkdir -p /usr/src/node_modules
ENV PATH /api/node_modules/.bin:$PATH
# RUN apk update
# RUN apk add git
# add for ARM compatibility 
# ENV PYTHONUNBUFFERED=1
# RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
# RUN apk add --update --no-cache make gcc libc-dev g++

# RUN rm -rf node_modules
COPY package.json ./
# COPY yarn.lock ./

# RUN yarn config set registry 'https://registry.npmjs.org/'
# RUN yarn config set registry 'https://registry.npm.taobao.org'

RUN yarn install
# RUN yarn install --frozen-lockfile
COPY . .
EXPOSE 3003 

FROM build-stage AS dev-stage
# RUN yarn add global node-dev
CMD ["yarn", "dev"]