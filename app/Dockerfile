FROM node:12-alpine AS build-stage

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install
COPY . .
RUN npm ci

FROM build-stage AS dev-stage

# npm kept failing here, so using yarn
RUN yarn global add @vue/cli
EXPOSE 8080
CMD [ "npm", "run", "serve" ]
