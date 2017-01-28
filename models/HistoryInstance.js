var mongoose = require('mongoose')

var historyInstanceSchema = mongoose.Schema( {
  // name of history instance
  name: { type: String },
  // general properties can go in here
  properties: { type: Array, default: [] },
  // layer list
  layers: { type: Array, default: [] },
  // object list, mixed embedded values and refs
  objects: { type: Array, default: [] },
  // user properties list for objects (if any)
  objectProperties: { type: Array, default: [] }
}, { timestamps: true } )

module.exports = mongoose.model('HistoryInstance', historyInstanceSchema)