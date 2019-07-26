'use strict'
const winston = require( '../../../config/logger' )

const User = require( '../../../models/User' )

module.exports = function ( req, res ) {
  if ( !req.params.userId ) {
    res.status( 400 )
    res.send( { success: false, message: 'Malformed request.' } )
  }

  let projection = '_id name surname company archived' + ( req.app.get( 'expose emails' ) ? ' email' : '' )

  User.findOne( { _id: req.params.userId }, projection )
    .then( user => {
      if ( !user ) throw new Error( 'no users found.' )
      res.send( { success: true, resource: user } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString() } )
    } )
}
