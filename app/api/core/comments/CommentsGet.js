'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const uuid              = require('uuid/v4')
const User              = require('../../../../models/User')
const Comment           = require('../../../../models/Comment')

module.exports = function( req, res ) {

  Comment.find( { streamId: req.params.streamId } )
  .then( comments => {
    console.log( comments )
    return res.send( { success: true, comments: comments } )
  })
  .catch( err => {
    res.status( 400 )
    return res.send( { success: false, error: err } )
  })
}