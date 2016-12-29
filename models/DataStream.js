var mongoose = require('mongoose')

var dataStreamSchema = mongoose.Schema({ 
  streamId: { type: String, index: true },
  name: { type: String, default:'Anonymous Data Stream' },
  liveInstance: { type: mongoose.Schema.Types.ObjectId, ref: 'HistoryInstance' }, 
  history: [ { type: mongoose.Schema.Types.ObjectId, ref: 'HistoryInstance' } ],
  private: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: { type: Array, default: [] }
}, { timestamps: true } )

module.exports = mongoose.model('DataStream', dataStreamSchema)