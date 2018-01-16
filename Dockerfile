# NODE
FROM node:8-alpine

# LABELS
LABEL version="0.0.3"
LABEL description="This is the Speckle Server docker images."
LABEL maintainer="hi@dimitrie.org"

# CREATE DIRS
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# INSTALL
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]