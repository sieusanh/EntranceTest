FROM node:current-alpine
#FROM node:latest

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

# EXPOSE 80

CMD ["npm", "start"]