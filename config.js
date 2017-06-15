
var dbUser        = process.env.DB_USER ||  ""
var dbPw          = process.env.DB_PW || ""
var dbHost        = process.env.DB_HOST || "127.0.0.1"
var dbPort        = process.env.DB_PORT || 27017
var dbName        = process.env.DB_NAME || "speckle"
var dbAuth        = process.env.DB_AUTH || ""

module.exports = {
  server: {
    port: process.env.PORT || 8080
  },
  serverDescription: {
    serverName: process.env.SPECKLE_NAME || 'Speckle Bender',  // Not really important
    restApi: process.env.SPECKLE_URL || 'http://10.211.55.2:8080/api/v1', // Replace 'http://...` with the IP address your server is running on.
    // restApi: process.env.SPECKLE_URL || 'http://localhost:8080/api/v1', // Replace 'http://...` with the IP address your server is running on.
    ws: process.env.SPECKLE_SOCKET || 'ws://10.211.55.2:8080' // Same!
    // ws: process.env.SPECKLE_SOCKET || 'ws://localhost:8080' // Same!
  },
  mongo: {
    url: dbUser === '' ? `mongodb://${dbHost}:${dbPort}/${dbName}` : `mongodb://${dbUser}:${dbPw}@${dbHost}:${dbPort}/${dbName}`
  },
  sessionSecret: 'NaturalSparklingWaterMineral'
}
