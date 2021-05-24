FROM node:12
ENV PATH /app/node_modules/.bin:$PATH
WORKDIR /app
COPY package.json /app/
# COPY yarn.lock ./
RUN yarn install
COPY ./ ./
RUN yarn tsc
COPY test-build /test-build
CMD [ "yarn", "nightwatch"]