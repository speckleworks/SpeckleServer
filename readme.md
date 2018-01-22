[![DOI](https://zenodo.org/badge/74043433.svg)](https://zenodo.org/badge/latestdoi/74043433)

# Speckle Server
This is the Speckle Server, which coordinates communications between the various SpeckleClients. It provides a basic accounts system, stream coordination, design data collation and retrieval, live update events and a basic querying mechanism.

## Deploy

Perquisites:  
- A machine running [docker](https://www.docker.com/community-edition#download).
- Have `git` installed too. 

Please note: the speckle server application is a clustered service that will spawn as many instances as you have CPU cores. 

Steps: 
1) Clone this repository and change your working path to this repository: 
`git clone https://github.com/speckleworks/SpeckleServer.git` then `cd SpeckleServer`. 

2) Run `docker-compose up -d`. This will take a bit of time at first. To stop the service, run `docker-compose down`.

3) Visit your speckle server [http://localhost](http://localhost) or whatever the IP address of your VPS is.

## Develop
More detailed instructions coming soon. Simply spin off an instance of Redis & Mongo locally, make sure in `config.js` that you're connecting to them, and spin out the server with `nodemon server.js` if  you want live reloads or `node server.js` otherwise. 

## API
[API docs are here](https://speckleworks.github.io/SpeckleOpenApi/#introduction) - they are a good overview of what you can do with the speckle server.


## Credits
Developed by Dimitrie A. Stefanescu [@idid](http://twitter.com/idid) / [UCL The Bartlett](https://www.ucl.ac.uk/bartlett/) / [InnoChain](http://innochain.net) / [Jenca](http://www.jenca.org)

This project has received funding from the European Union’s Horizon 2020 research and innovation programme under the Marie Sklodowska-Curie grant agreement No 642877.

### License
MIT.
