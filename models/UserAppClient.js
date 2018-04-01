var mongoose = require( 'mongoose' )

var clientSchema = mongoose.Schema( {
  // ownership & permissions
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  private: { type: Boolean, default: false },
  canRead: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  canWrite: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  anonymousComments: { type: Boolean, default: false },
  // comments
  comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],

  role: { type: String }, // Receiver, Sender, Hybrid

  documentName: { type: String },

  documentGuid: { type: String }, // document unique id. 

  documentType: { type: String }, // Rhino, Grasshopper, Node, Browser, etc.

  documentLocation: { type: String }, // Location

  streamId: { type: String }, // stream that we're connected to

  online: { type: Boolean, default: true, strict: false } 

}, { timestamps: true } )

module.exports = mongoose.model( 'UserAppClient', clientSchema )