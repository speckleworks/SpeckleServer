'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const Client = require( '../../../../models/UserAppClient' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.clientId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  Client.findOne( { _id: req.params.clientId } )
    .then( client => PermissionCheck( req.user, 'delete', client ) )
    .then( client => {
      return client.remove( )
    } )
    .then( result => {
      return res.send( { success: true, message: 'Client was deleted! Bye bye data.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}