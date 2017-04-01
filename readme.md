# Speckle Server
This is the Speckle Server, which coordinates communications between the various SpeckleClients. It provides a basic accounts system, stream coordination, design data collation and retrieval, live update events and a basic querying mecahnism.

> Contributions are welcome, get in touch via [@idid](http://twitter.com/idid)!

## Super Quick Deployment Instructions
1) Install nodejs using [nvm](https://github.com/creationix/nvm). Tested against v4.4.3 and v7.7.3.
2) Clone this repository to a folder of your choice, say `SpeckleServer`.
3) **Configure your mongodb instance** by creating a `database.js` file in the `.secrets` folder that contains the following:
```js
module.exports = {
  url: 'mongodb://username:password@IP:PORT/DbName'
}
```
You can either deploy mongodb on your own or get a hosted version from somewhere, for example [mlab](https://mlab.com/) gives you 500mb for free. This should be ok to play around with.

4) **Configure the server description** file in the `.config` folder.
```js
module.exports = {
  serverName: 'Speckle Test Deployment', // Not really important
  restApi: 'http://10.211.55.2:8080/api/v1', // Replace 'http://...` with the IP address your server is running on.
  ws: 'ws://10.211.55.2:8080', // Same!
  resources: {
    [...] // not used, can ignore
  }
}
```
5) `npm install`
6) `node server.js` or `nodemon server.js` (you'll need to have nodemon installed for this to work: `npm install -g nodemon`
7) Done!


## Docker - Getting started

Download [Docker](https://www.docker.com/products/overview). If you are on Mac or Windows, [Docker Compose](https://docs.docker.com/compose) will be automatically installed. On Linux, make sure you have the latest version of [Compose](https://docs.docker.com/compose/install/).

Open docker-compose file and check that environment variables match the environment you are deploying the app to.

Run in this directory:
```
docker-compose up
```
The app will be running at [http://localhost:8080](http://localhost:8080)




## Documentation
It's forthcoming. [Do you want to help?](mailto:d.stefanescu@ucl.ac.uk)

## API
[Some basic documentation can be found here.](https://documenter.getpostman.com/collection/view/553672-bb9f112e-f1ad-3084-afe1-96a0ae8e80d7#intro) [expired link ffs!]


## Credits
Developed by Dimitrie A. Stefanescu [@idid](http://twitter.com/idid) / [UCL The Bartlett](https://www.ucl.ac.uk/bartlett/) / [InnoChain](http://innochain.net)

This project has received funding from the European Union’s Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 642877.

![Bartlett](http://streams.speckle.xyz/assets/bartlett-ucl.png)

![InnoChain](http://innochain.net/wp-content/uploads/logo2015.png)

### License
MIT.
