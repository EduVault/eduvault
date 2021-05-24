FROM node:12

WORKDIR /app
COPY package.json /app/
COPY yarn.lock ./
RUN yarn add chromedriver --chromedriver-force-download && yarn install
CMD [ "yarn", "test"]