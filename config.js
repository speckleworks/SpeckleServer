const dbUser = process.env.DB_USER || ''
const dbPw = process.env.DB_PW || ''
const dbHost = process.env.DB_HOST || '127.0.0.1'
const dbPort = process.env.DB_PORT || 27017
const dbName = process.env.DB_NAME || 'speckle_v3'
const dbAuth = process.env.DB_AUTH || ''
const maxRequestSize = process.env.REQ_SIZE || '10mb'

module.exports = {
  init: false,
  server: {
    port: process.env.PORT || 8080,
    maxRequestSize: maxRequestSize
  },
  serverDescription: {
    serverName: process.env.SPECKLE_NAME || 'Speckle Server', // Not really important
    restApi: process.env.SPECKLE_URL || 'http://10.211.55.2:8080/api', // Replace 'http://...` with the IP address your server is running on.
    ws: process.env.SPECKLE_SOCKET || 'ws://10.211.55.2:8080', // Same!
    maxRequestSize: maxRequestSize
  },
  mongo: {
    url: dbUser === '' ? `mongodb://${dbHost}:${dbPort}/${dbName}` : `mongodb://${dbUser}:${dbPw}@${dbHost}:${dbPort}/${dbName}`
  },
  sessionSecret: 'NaturalSparklingWaterMineral'
}