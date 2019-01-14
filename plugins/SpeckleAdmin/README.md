# SpeckleAdmin
A simple admin app for [speckle](https://speckle.works).


![image](https://user-images.githubusercontent.com/7696515/50599992-5be4bf80-0eb8-11e9-8b01-7698b407c7ac.png)

If you have an account on the speckle test server (hestia), check it out live [here](https://hestia.speckle.works).

## Fresh installation for a speckle server deployment
Depending on your version, you should have in your server install location a `plugins` dir. If you don't, do update your server first and come back!

1. `cd ~/${your speckle server install location}/plugins`
2. `git clone https://github.com/speckleworks/SpeckleAdmin.git`
3. Restart your server, and navigate to its root address - TADA!
4. Profit!

If you have previously installed the SpeckleAdmin frontend plugin, you should be able to just
1. `git fetch`
2. `git pull`

## Development notes

To start a development server: `npm run dev`
To build for production: `npm run build`

Please note: we use a custom build of the vuematerial library that fixes [this issue](https://github.com/vuematerial/vue-material/issues/1977). As soon as this lands on npm, we'll upgrade and you won't need to custom build it yourself. 

## License
MIT



