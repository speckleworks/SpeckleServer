module.exports = {
  apps : [{
    name   : "SpeckleServer",
    script : "./server.js",
    env: {
	"SPECKLE_NAME":"Shiny Speckle Server",
	"REQ_SIZE":"16mb",
	"MONGO_URI":"mongodb://localhost:27017/speckle_v3",
	"REDIS_PORT":"6379",
	"REDIS_ADDR":"127.0.0.1",
    }
  }]
}
