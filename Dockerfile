# NODE
FROM node:10

# CREATE DIRS
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# INSTALL
COPY package*.json ./
RUN npm install --only=prod
# GET PLUGINS
RUN mkdir -p plugins/admin
RUN git clone https://github.com/speckleworks/SpeckleAdmin.git plugins/admin

# VIEWER WILL BE DEPRECATED
# RUN mkdir -r plugins/viewer
# RUN git clone https://github.com/speckleworks/SpeckleViewer.git plugins/viewer

COPY . .

# Version tag
ARG GIT_TAG

# LABELS
LABEL version=GIT_TAG
LABEL description="Speckle Server Docker Container Image"

# Fixed Env Vars
ENV SPECKLE_API_VERSION ${GIT_TAG:-UNKNOWN}

CMD ["node", "server.js"]
