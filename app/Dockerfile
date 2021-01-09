FROM node:12-alpine AS build-stage
RUN apk update
RUN apk add git
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./

RUN yarn install
COPY . .

FROM build-stage AS dev-stage

# npm kept failing here, so using yarn
RUN yarn global add @vue/cli
EXPOSE 8081
CMD [ "yarn", "dev" ]
