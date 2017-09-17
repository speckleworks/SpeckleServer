'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const uuid              = require('uuid/v4')
const User              = require('../../../../models/User')
const Comment           = require('../../../../models/Comment')

module.exports = function( req, res ) {
  winston.debug( 'comment post.' )
  
  if( !req.body.comment ) {
    res.status(400)
    return res.send( { success: false, message: 'No comment present in body.' } )
  }

  let comment = new Comment( {
    author: req.body.comment.author,
    camera: req.body.comment.camera,
    streamId: req.body.comment.streamId,
    text: req.body.comment.text
  } )

  comment.save()
  .then( () => {
    return res.send( { success: true, message: 'Comment saved.' } )
  })
  .catch( err => {
    res.status( 400 )
    return res.send( { success:false, message: err.toString() } )
  })
}