FROM node:13-alpine

WORKDIR /base/api
COPY package*.json ./
RUN npm install --silent
COPY . .

EXPOSE 3000 
CMD ["npm", "run", "serve"]