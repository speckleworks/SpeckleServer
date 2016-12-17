var mongoose = require('mongoose')

var historyInstanceSchema = mongoose.Schema( {
  name: { type: String },
  structure: { type: Array, default: [] }, 
  controllers: { type: Array, default: [] }, // gh specific
  // this is (might be) an antipattern
  objects: { type: Array, default: [] },
}, { timestamps: true } )

module.exports = mongoose.model('HistoryInstance', historyInstanceSchema)