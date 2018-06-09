# NODE
FROM node:8-alpine

# LABELS
LABEL version="1.x.x"
LABEL description="Speckle Server Docker Container Image"

# CREATE DIRS
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# INSTALL
COPY package*.json ./
RUN npm install

COPY . .
CMD ["node", "server.js"]
