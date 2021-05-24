FROM node:12

WORKDIR /app
COPY package.json /app/
RUN npm install chromedriver --chromedriver-force-download && npm install
CMD [ "yarn", "test"]