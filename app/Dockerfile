FROM node:12 AS build-stage
# RUN apk update
# RUN apk add git
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./ 

# RUN yarn config set registry 'https://registry.npmjs.org/'
# RUN yarn config set registry 'https://registry.npm.taobao.org'


RUN yarn install
COPY . .

FROM build-stage AS dev-stage
ARG TEST=0
ENV VUE_APP_TEST=$TEST
ENV NODE_ENV=development
# npm kept failing here, so using yarn
# RUN yarn global add @vue/cli
CMD [ "yarn", "dev" ]
