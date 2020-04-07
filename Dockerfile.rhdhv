# NODE
FROM node:10
# LABELS
LABEL version="1.x.x"
LABEL description="Speckle Server Docker Container Image"
# CREATE DIRS
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# INSTALL
COPY package*.json ./
RUN npm install
# GET PLUGINS
RUN mkdir -p plugins/admin
RUN git clone https://github.com/speckleworks/SpeckleAdmin.git plugins/admin
WORKDIR /usr/src/app/plugins/admin
RUN npm install; npm build
WORKDIR /usr/src/app
# VIEWER WILL BE DEPRECATED
# RUN mkdir -r plugins/viewer
# RUN git clone https://github.com/speckleworks/SpeckleViewer.git plugins/viewer
COPY . .
CMD ["node", "server.js"]