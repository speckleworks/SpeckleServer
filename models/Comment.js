var mongoose = require('mongoose')

var commentSchema = mongoose.Schema({ 
  author: { type: Object, default: {} },
  text: { type: String, default: '' },
  camera: { type: Object, default: {} },
  screenshot: { type: String, default: '' },
  streamId: { type: String }
}, { timestamps: true } )

module.exports = mongoose.model( 'Comment', commentSchema ) 