# Speckle Server
[![DOI](https://zenodo.org/badge/74043433.svg)](https://zenodo.org/badge/latestdoi/74043433) [![Build status](https://ci.appveyor.com/api/projects/status/xo9uun3wdo5x8538?svg=true)](https://ci.appveyor.com/project/SpeckleWorks/speckleserver)


This is the Speckle Server, which coordinates communications between the various SpeckleClients.


Speckle Server provides :
- a basic accounts system
- stream coordination
- design data collation and retrieval
- live update events
- a basic querying mechanism

## 5 Minute Docker Install ™️ (with Digital Ocean)

Head over to [Digital Ocean](https://www.digitalocean.com/) and create an account. Subsequently, create a new droplet (vm) via "One Click Apps" and select "Docker". Finally, `ssh` into your new virtual machine.

Execute the following commands:

    $ mkdir speckle && cd speckle
    $ curl https://raw.githubusercontent.com/speckleworks/SpeckleServer/master/docker-compose.yml -o docker-compose.yml
    $ docker-compose up

⚠️ *Imporant security notice*: Finally, make sure  you  create a digital ocean cloud firewall rule (and apply it to your droplet) to allow port 3000, or whatever port you're using. See discussion: https://github.com/speckleworks/SpeckleServer/issues/90#issuecomment-400011794

![screenshot](https://user-images.githubusercontent.com/7696515/41862603-4972fcc0-789c-11e8-8a79-268280376a1a.png)

Note: You're not restricted to digital ocean. Any machine with docker should be ok.

## Deploying to Heroku

    $ heroku create --stack cedar
    $ heroku addons:create mongolab:sandbox
    $ heroku addons:create heroku-redis:hobby-dev
    $ git push heroku master
    $ heroku open

## Deploying on Debian-based OSes (Ubuntu etc)

1) Install mongodb, redis servers and npm: 

       $ sudo apt-get install mongodb redis npm

2) If you don't want both the redis and mongo servers running all the time (For ex. if you are just testing), disable both startup scripts (If you wish to leave both running automatically, skip to step 5):

       $ sudo systemctl disable mongodb
       $ sudo systemctl disable redis-server`

3) And stop both mongo and redis processes that were started automatically by apt-get: 

       $ sudo systemctl stop mongodb
       $ sudo systemctl stop redis-server
       
4) Create a non-root user and folder for that user to hold the Speckle files (this is only to endure that the the folowing steps is not done as root or needing 'sudo'. User and folder name does not need to be speckle/Speckle): 

       $ sudo adduser speckle
       $ su - speckle
       $ mkdir Speckle 
       $ cd Speckle

5) Clone SpeckleServer and run npm to install the needed nodejs packages: 

       $ git clone https://github.com/speckleworks/SpeckleServer.git
       $ cd SpeckleServer
       $ npm install

6) Follow the instructions in `.env-base` file to configure your server. Use `nano .env` to edit.
    
7) Start mongo (create a folder somewhere to store the db): 

       $ mongodb --dbpath /path/to/some/folder
    
8) Start redis in another terminal. You might need to restart server instance after this step. 

       $ redis-server
 
9) Check that both mongo and redis are running OK and that you can connect to them with these two clients:

       $ service mongodb status
       $ redis-cli ping
    
10) Start Speckle in a third terminal: 

       $ node server.js

Check that you can registre a new account on you Speckle server. If not the first thing to try is to restart it an redo step 9 and 10.

Note: For a 'proper' deployment you might want to setup a firewall, use reverse-proxy ([ngix](https://www.nginx.com/) or similar) and ensure continued operation of the SpeckleServer (see [forever](https://www.npmjs.com/package/forever), [pm2](http://pm2.keymetrics.io/) or similar)

## API
[API docs are here](https://speckleworks.github.io/SpeckleSpecs/) - they are a good overview of what you can do with the speckle server.

## Current Limitations

- Because we rely on mongodb's wired tiger engine, objects larger than 16mb will cause trouble. Unfortunately, most of the defenses are on the client side. 
- The api will refuse payloads larger than MAX_REQ, which defaults to 10mb.

## Credits
Developed by Dimitrie A. Stefanescu [@idid](http://twitter.com/idid) and Project Contributors.

## License
[MIT](https://github.com/speckleworks/SpeckleServer/blob/master/LICENSE)
