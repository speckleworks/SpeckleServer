var user = process.env.DB_USER ||  "reportsUser"
var pw = process.env.DB_PW || "password"
var host = process.env.DB_HOST || "127.0.0.1"
var port = process.env.DB_PORT || 27017
var name = process.env.DB_NAME || "speckle"
var auth = process.env.DB_AUTH || "admin"


module.exports = {
  server: {
    port: process.env.PORT || 8080
  },
  speckle: {
    serverName: process.env.SPECKLE_NAME || 'Speckle OSX Localhost',  // Not really important
    restApi: process.env.SPECKLE_URL || 'http://127.0.0.1:8080/api/v1', // Replace 'http://...` with the IP address your server is running on.
    ws: process.env.SPECKLE_SOCKET || 'ws://127.0.0.1:8080' // Same!
  },
  mongo: {
    url: `mongodb://${user}:${pw}@${host}:${port}/${name}?authSource=${auth}`
  },
  session: {
    secret: 'NaturalSparklingWaterMineral'
  }
}
