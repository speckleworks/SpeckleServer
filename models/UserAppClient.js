var mongoose = require('mongoose')

// schema to keep track of user application clients (receivers and senders). 
// why? to make a graph later on of all the connections
var clientSchema = mongoose.Schema( {
  role: { type: String }, // Receiver, Sender, Hybrid
  documentName: { type: String },
  documentGuid: { type: String }, // document unique id. 
  documentType: { type: String }, // Rhino, Grasshopper, Node, Browser, etc.
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  streamId: { type: String }, // stream that we're connected to
  online: { type: Boolean, default: true, strict: false }
} )

module.exports = mongoose.model( 'UserAppClient', clientSchema )