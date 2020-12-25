FROM node:12-alpine AS build-stage

WORKDIR /example
ENV PATH /example/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .

FROM build-stage AS dev-stage
RUN yarn global add @vue/cli
EXPOSE 8080
CMD [ "yarn", "serve" ]
