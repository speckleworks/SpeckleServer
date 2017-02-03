var mongoose = require('mongoose')

var dataStreamSchema = mongoose.Schema({ 
  streamId: { type: String, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, default:'Anonymous Data Stream' },
  liveInstance: { type: mongoose.Schema.Types.ObjectId, ref: 'HistoryInstance' }, 
  history: [ { type: mongoose.Schema.Types.ObjectId, ref: 'HistoryInstance' } ],
  private: { type: Boolean, default: false },
  sharedWith: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  locked: { type: Boolean, default: false },
  online: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false }
}, { timestamps: true } )

module.exports = mongoose.model('DataStream', dataStreamSchema) 