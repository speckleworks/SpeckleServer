var mongoose = require('mongoose')

var commentSchema = mongoose.Schema({ 
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, default: '' },
  cameraView: { type: Object, default: {} },
  screenshot: { type: String, default: '' }
}, { timestamps: true } )

module.exports = mongoose.model( 'Comment', commentSchema ) 