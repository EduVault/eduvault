# dev-stage
FROM node:13-alpine AS dev-stage

RUN mkdir -p /home/node/api/node_modules && chown -R node:node /home/node/api
WORKDIR /home/node/api
COPY package*.json ./
USER node
RUN npm install --silent
COPY --chown=node:node . .

EXPOSE 3000 
CMD ["npm", "run", "serve"]


# production-stage
FROM node:13-alpine AS production-stage
EXPOSE 3000 
WORKDIR /base/api
COPY package*.json .
RUN npm install
COPY . /base/api

CMD ["npm", "run", "serve"]