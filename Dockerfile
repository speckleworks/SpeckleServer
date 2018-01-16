FROM node:alpine

RUN mkdir /app

COPY . /app

COPY package.json /app

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD sh -c "sleep 5 && npm start" 
