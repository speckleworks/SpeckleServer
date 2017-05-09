var dbUser    = process.env.DB_USER ||  ""
var dbPw      = process.env.DB_PW || ""
var host      = process.env.DB_HOST || "127.0.0.1"
var dbPort    = process.env.DB_PORT || 27017
var name      = process.env.DB_NAME || "speckle"
var auth      = process.env.DB_AUTH || ""


module.exports = {
  server: {
    port: process.env.PORT || 8080
  },
  serverDescription: {
    serverName: process.env.SPECKLE_NAME || 'Speckle Bender',  // Not really important
    restApi: process.env.SPECKLE_URL || 'http://10.211.55.2:8080/api/v1', // Replace 'http://...` with the IP address your server is running on.
    ws: process.env.SPECKLE_SOCKET || 'ws://10.211.55.2:8080' // Same!
  },
  mongo: {
    url: dbUser === '' ? `mongodb://${host}:${dbPort}/${name}` : `mongodb://${dbUser}:${dbPw}@${host}:${dbPort}/${name}`
  },
  sessionSecret: 'NaturalSparklingWaterMineral'
}
