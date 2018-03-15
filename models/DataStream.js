var mongoose = require( 'mongoose' )

var dataStreamSchema = mongoose.Schema( {

  streamId: { type: String, index: true },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  private: { type: Boolean, default: false },
  
  sharedWith: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],

  // should replace 'sharedWith' in the near future
  canRead: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  canWrite: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  // canComment: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],

  anonymousComments: { type: Boolean, default: false },

  name: { type: String, default: 'Speckle Stream' },

  baseProperties: { type: Object, default: {} },

  globalMeasures: { type: Object, default: {} },

  isComputedResult: { type: Boolean, default: false },  

  objects: [ { type: mongoose.Schema.Types.ObjectId, ref: 'SpeckleObject' } ],

  layers: { type: Array, default: [ ] },

  parent: { type: String, default: null },

  children: { type: Array, default: [ ] },

  comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],

  deleted: { type: Boolean, default: false }

}, { timestamps: true } )

module.exports = mongoose.model( 'DataStream', dataStreamSchema )