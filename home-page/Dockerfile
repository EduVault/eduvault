FROM node:12 AS build-stage

WORKDIR /home-page
ENV PATH /home-page/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./

# RUN yarn config set registry 'https://registry.npmjs.org/'
# RUN yarn config set registry 'https://registry.npm.taobao.org'

RUN yarn install
COPY . .

FROM build-stage AS dev-stage
CMD [ "yarn", "dev" ]
