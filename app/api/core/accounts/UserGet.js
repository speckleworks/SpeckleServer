'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const User              = require('../../../../models/User')

module.exports = function ( req, res ) {
  winston.debug('update user route')
  console.log( req.body )
  User.findOne( { _id : req.user._id }, '-password' )
  .then( myUser => {
    if( !myUser ) throw new Error('no user found.')
    res.send( myUser )
  })
  .catch( err => {
    res.status(400)
    res.send( { success: false, message: err.toString() } )
  })
}