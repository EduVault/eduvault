FROM node:alpine

WORKDIR /app
COPY package.json /app/
RUN npm install chromedriver --chromedriver-force-download && npm install