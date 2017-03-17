# Speckle Server
This is the Speckle Server, which coordinates communications between the various SpeckleClients.

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


### Credits
Developed by Dimitrie A. Stefanescu [@idid](http://twitter.com/idid) / [UCL The Bartlett](https://www.ucl.ac.uk/bartlett/) / [InnoChain](http://innochain.net)

### License 
MIT.
