FROM node:12
ENV PATH /example/node_modules/.bin:$PATH
WORKDIR /app
COPY package.json /app/
COPY yarn.lock ./
RUN yarn add chromedriver --chromedriver-force-download && yarn install
COPY ./ ./
RUN yarn tsc
COPY test-build /test-build
CMD [ "npx", "nightwatch"]