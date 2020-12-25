FROM node:12-alpine AS build-stage

WORKDIR /home-page
ENV PATH /home-page/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .

FROM build-stage AS dev-stage
EXPOSE 8083
CMD [ "yarn", "dev" ]
