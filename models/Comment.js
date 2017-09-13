var mongoose = require( 'mongoose' )

var commentSchema = mongoose.Schema( {
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  children: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],
  author: { type: Object, default: {} },
  text: { type: String, default: '' },
  camera: { type: Object, default: {} },
  streamId: { type: String }
}, { timestamps: true } )

module.exports = mongoose.model( 'Comment', commentSchema )