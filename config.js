let serverName = process.env.SPECKLE_NAME ? process.env.SPECKLE_NAME : 'Default Speckle Server'
let maxRequestSize = process.env.REQ_SIZE || '10mb'

module.exports = {
  serverDescription: {
    serverName: serverName,
    maxRequestSize: maxRequestSize,
    indentResponses: process.env.INDENT_RESPONSES == 'true' ? true : false
  },
  mongo: {
    url: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://mongo:27017/speckle'
  },
  redis: {
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_ADDR || 'redis'}:${process.env.REDIS_PORT || '6379'}`
  },
  sessionSecret: 'NaturalSparklingWaterMineral'
}
