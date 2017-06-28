# Speckle Server
This is the Speckle Server, which coordinates communications between the various SpeckleClients. It provides a basic accounts system, stream coordination, design data collation and retrieval, live update events and a basic querying mecahnism.

> Contributions are welcome, get in touch via [@idid](http://twitter.com/idid)!

## Super Quick Deployment Instructions

1) Install [Docker](https://www.docker.com/products/overview) and [docker-compose](https://docs.docker.com/compose) to your host.

2) Clone repository and change your working path to this repository.

3) If you want to use a hosted mongodb, open docker-compose.yml and update the ENVIRONMENT section under web service with details of your mongo instance.

4) Run it! `$ docker-compose up`

Visit your speckle server [http://localhost:8080](http://localhost:8080)

## Deployment Instructions for not using docker 
1) Install nodejs using [nvm](https://github.com/creationix/nvm). Tested against v4.4.3 and v7.7.3.

2) Clone this repository to a folder of your choice, say `SpeckleServer`.

3) Configure your mongodb instance and your server description in config.js

5) Run `npm install`

6) `node server.js` or `nodemon server.js` (you'll need to have nodemon installed for this to work: `npm install -g nodemon`

7) Done!

Visit your speckle server [http://localhost:8080](http://localhost:8080)

## Documentation
It's forthcoming. [Do you want to help?](mailto:d.stefanescu@ucl.ac.uk)

## API
[Some basic documentation can be found here.](https://documenter.getpostman.com/collection/view/553672-bb9f112e-f1ad-3084-afe1-96a0ae8e80d7#intro) [tbc: Need to update link!]


## Credits
Developed by Dimitrie A. Stefanescu [@idid](http://twitter.com/idid) / [UCL The Bartlett](https://www.ucl.ac.uk/bartlett/) / [InnoChain](http://innochain.net) / [Jenca](http://www.jenca.org)

This project has received funding from the European Union’s Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 642877.

![Bartlett](http://streams.speckle.xyz/assets/bartlett-ucl.png)

![InnoChain](http://innochain.net/wp-content/uploads/logo2015.png)

### License
MIT.
