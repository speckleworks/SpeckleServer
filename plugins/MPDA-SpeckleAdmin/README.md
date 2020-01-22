# SpeckleAdmin

[![Netlify Status](https://api.netlify.com/api/v1/badges/e8575dfa-6bb4-4c96-866f-49eebc7370cc/deploy-status)](https://app.netlify.com/sites/speckleapp/deploys)

A simple front-end admin application for speckle. Demo: check it out live [here](https://app.speckle.systems)!

![SpeckleAdmin](https://user-images.githubusercontent.com/7696515/57015016-79c5f500-6c0a-11e9-9bfe-7af41e6ffd4f.png)

The easiest way to use SpeckleAdmin is to navigate to https://app.speckle.systems and login at your server. Data will strictly be transferred between the client (the app in your browser) and your server. This works within private networks, amongst firewalls, etc. as long as you have a SSL certificate for your server (ie, non-http*s* server adresses will not work). 

## Fresh installation for a speckle server deployment

1. `cd ~/${your speckle server install location}/plugins`
2. `git clone https://github.com/speckleworks/SpeckleAdmin.git`
3. `cd SpeckleAdmin`
4. `npm install`
5. `npm run build`
6. Restart your server, and navigate to its root address - done!

If you have previously installed the SpeckleAdmin frontend plugin, you should be able to just run the following commands from the plugin's folder (e.g., `~/${SpeckleServer Installation Folder}/plugins/SpeckleAdmin`). 
1. `git fetch`
2. `git pull`
3. `npm install` - to make sure to pull along any potential new dependencies
4. `npm run build`
5. Profit!

> ## Note: 
> the build step can fail on low powered VMs with < 1GB of RAM. There's two solutions to this: (a) get a beefier VM (or scale it up for this step), alternatively (b) use https://app.speckle.systems. 

## Development notes

To start a development server: `npm run dev`  
To build for production: `npm run build`

## License
MIT



