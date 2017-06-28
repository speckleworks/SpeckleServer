var mongoose = require( 'mongoose' )

var dataStreamSchema = mongoose.Schema( { 

  streamId: { type: String, index: true },
  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  private: { type: Boolean, default: false },
  
  sharedWith: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],

  name: { type: String, default:'Speckle Stream' },
  
  layerMaterials: { type: Object, default: { } },
  
  objects: [ { type: mongoose.Schema.Types.ObjectId, ref: 'SpeckleObject' } ],

  layers: { type: Array, default: [ ] },

  parent: { type: String, default: null },

  children: { type: Array, default: [ ] }
  
}, { timestamps: true } )

module.exports = mongoose.model( 'DataStream', dataStreamSchema ) 