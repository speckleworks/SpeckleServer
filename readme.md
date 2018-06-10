# Speckle Server

> This is the Speckle Server, which coordinates communications between the various SpeckleClients.
[![DOI](https://zenodo.org/badge/74043433.svg)](https://zenodo.org/badge/latestdoi/74043433)

Speckle Server provides :
- a basic accounts system
- stream coordination
- design data collation and retrieval
- live update events
- a basic querying mechanism

## 5 Minute Docker Install ™️ (with Digital Ocean)

Head over to [Digital Ocean](https://www.digitalocean.com/) and create an account. Subsequently, create a new droplet (vm) via "One Click Apps" and select "Docker". Finally, `ssh` into your new virtual machine.

Execute the following commands:

>1. Create a directory where the app will reside:
>`mkdir speckle && cd speckle`
>
>2. Download the latest docker-compose file from the speckle server repo:
>`curl https://raw.githubusercontent.com/speckleworks/SpeckleServer/master/docker-compose.yml … -o docker-compose.yml`
>
>3. Launch it! 
>`docker-compose up`

NOTE: You're not restricted to digital ocean. Any machine with docker should be ok.

## Deploying to Heroku

    $ heroku create --stack cedar
    $ heroku addons:create mongolab:sandbox
    $ heroku addons:create heroku-redis:hobby-dev
    $ git push heroku master
    $ heroku open

## Deploying on Debian-based OSes (Ubuntu etc)

1) Install mongodb, redis servers and npm: 

       sudo apt-get install mongodb redis npm

2) If you don't want both the redis and mongo servers running all the time (For ex. if you are just testing), disable both startup scripts (If you wish to leave both running automatically, skip to step 4):

       sudo systemctl disable mongodb
       sudo systemctl disable redis-server`

3) And stop both mongo and redis processes that were started automatically by apt-get: 

       sudo systemctl stop mongodb
       sudo systemctl stop redis-server

4) Clone SpeckleServer and run npm to install the needed nodejs packages: 

       git clone https://github.com/speckleworks/SpeckleServer.git
       cd SpeckleServer
       npm install

5) Edit config.js and adjust the mongo url line and the redis url line: 

       url: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/speckle'
       url: process.env.REDIS_URL || 'redis://localhost:6379'
    
6) Start mongo (create a folder somewhere to store the db): 

       mongodb --dbpath /path/to/some/folder
    
7) Start redis in another terminal: 

       redis-server
 
8) Check that both mongo and redis are running OK and that you can connect to them with these two clients:

       mongo
       redis-cli
    
9) Start Speckle in a third terminal: 

       node server.js

## Develop
More detailed instructions coming soon. Simply spin off an instance of Redis & Mongo locally, make sure in `config.js` that you're connecting to them, and spin out the server with `nodemon server.js` if  you want live reloads or `node server.js` otherwise. 

## API
[API docs are here](https://speckleworks.github.io/SpeckleOpenApi/#introduction) - they are a good overview of what you can do with the speckle server.

## Current Limitations

- Because we rely on mongodb's wired tiger engine, objects larger than 16mb will cause trouble. Unfortunately, most of the defenses are on the client side. 
- The api will refuse payloads larger than MAX_REQ, which defaults to 10mb.

## Credits
Developed by Dimitrie A. Stefanescu [@idid](http://twitter.com/idid) and Project Contributors.

### License
[MIT](https://github.com/speckleworks/SpeckleServer/blob/master/LICENSE)
