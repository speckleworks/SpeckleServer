FROM node:argon

RUN mkdir /app

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

EXPOSE 8080

CMD sh -c "sleep 5 && npm start" 
