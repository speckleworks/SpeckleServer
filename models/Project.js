var mongoose = require( 'mongoose' )

var projectSchema = mongoose.Schema( {

  // ownership & permissions
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  private: { type: Boolean, default: false },
  canRead: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  canWrite: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  anonymousComments: { type: Boolean, default: false },
  // comments
  comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],

  // project name
  name: { type: String, default: 'A Speckle Project' },
  //  streams in  this project
  streams: [ { type: mongoose.Schema.Types.ObjectId, ref: 'DataStream' } ],
  //  users in  this project
  users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],

}, { timestamps: true } )

module.exports = mongoose.model( 'Project', projectSchema )