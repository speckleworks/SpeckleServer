var mongoose = require( 'mongoose' )

var commentSchema = mongoose.Schema( {
  // ownership
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // threads
  comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],

  // content
  text: { type: String, required: true },

  // parent resource
  resource: { 
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true }
  },

  // minimal issue-like functionality
  closed: { type: Boolean, default: false },
  assignedTo: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  labels: [ { type: String } ],

  // camera view (can be expanded to hold other scene settings)
  view: { type: Object, default: {} },

  // screenshot
  screenshot: { type: String }

}, { timestamps: true } )

module.exports = mongoose.model( 'Comment', commentSchema )