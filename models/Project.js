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
  permissions: { 
    streamsDefaulPrivate: { type: Boolean, default: false },
    canRead: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
    canWrite: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  },
  
  //  sub projects
  subProjects: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Project' } ],

  // strict false so peeps can expand the schema if they wanna add shit 💩
}, { timestamps: true, strict: false } )

module.exports = mongoose.model( 'Project', projectSchema )