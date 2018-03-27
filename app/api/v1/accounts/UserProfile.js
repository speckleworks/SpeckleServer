'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const User = require( '../../../../models/User' )

module.exports = function( req, res ) {
  if ( !req.params.userId ) {
    res.status( 400 )
    res.send( { success: false, message: "Malformed request." } )
  }
  User.findOne( { _id: req.params.userId }, '_id name surname email company' )
    .then( user => {
      if ( !user ) throw new Error( 'no users found.' )
      res.send( { success: true, resource: user } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}