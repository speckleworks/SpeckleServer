var mongoose = require( 'mongoose' )

var dataStreamSchema = mongoose.Schema( {
  // stream short id
  streamId: { type: String, index: true },

  // ownership & permissions
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  private: { type: Boolean, default: !( process.env.PUBLIC_STREAMS === 'true' ) },
  canRead: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  canWrite: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  anonymousComments: { type: Boolean, default: false },

  // comments
  comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],

  name: { type: String, default: 'Speckle Stream' },
  description: { type: String, default: 'This is a simple speckle stream.' },
  commitMessage: { type: String },
  tags: [ { type: String } ],

  baseProperties: { type: Object, default: {} },

  globalMeasures: { type: Object, default: {} },

  isComputedResult: { type: Boolean, default: false },

  objects: [ { type: mongoose.Schema.Types.ObjectId, ref: 'SpeckleObject' } ],

  layers: { type: Array, default: [ ] },

  viewerLayers: { type: Array, default: [ ] },

  // versioning
  parent: { type: String, default: null },
  children: { type: Array, default: [ ] },
  ancestors: { type: Array, default: [ ] },

  deleted: { type: Boolean, default: false },

  // keeps track wether this stream can be edited from the online ui or not.
  // it's set by default to NOPE
  onlineEditable: { type: Boolean, default: false },

  jobNumber: { type: String, default: ''}

}, { timestamps: true, strict: false } )

module.exports = mongoose.model( 'DataStream', dataStreamSchema )
