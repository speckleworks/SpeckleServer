var mongoose = require('mongoose')

var historyInstanceSchema = mongoose.Schema( {
  name: { type: String },
  structure: { type: Array, default: [] }, 
  controllers: { type: Array, default: [] }, // gh specific
  objects: [ { type: mongoose.Schema.Types.ObjectId, ref: 'DataObject' } ],
}, { timestamps: true } )

module.exports = mongoose.model('HistoryInstance', historyInstanceSchema)