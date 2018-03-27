'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const User              = require('../../../../models/User')

module.exports = function ( req, res ) {
  if(  !req.body.userId ) {
    res.status(400)
    res.send( { success: false, message: "Malformed request." } )
  }
  User.findOne( { _id : req.body.userId }, '_id name surname email company' )
  .then( user => {
    if( !user ) throw new Error( 'no users found.' )
    res.send( { success: true, users: user } )
  })
  .catch( err => {
    res.status( 400 )
    res.send( { success: false, message: err.toString() } )
  })
}