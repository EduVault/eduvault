# dev-stage
FROM node:13-alpine AS dev-stage

WORKDIR /home/node/app
COPY package*.json ./
RUN npm install @vue/cli -g 
RUN npm install  --silent
COPY . .
EXPOSE 8080

CMD ["npm", "run", "serve"]


# production-stage
FROM node:13-alpine AS production-stage
EXPOSE 8080

WORKDIR /base/app
COPY package*.json .
RUN npm install  --silent
RUN npm install @vue/cli -g
COPY . /base/app

CMD ["npm", "run", "serve"]