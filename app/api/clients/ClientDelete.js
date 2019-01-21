'use strict'
const winston = require( '../../../config/logger' )

const Client = require( '../../../models/UserAppClient' )
const DataStream = require( '../../../models/DataStream' )

const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.clientId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  let client = null
  Client.findOne( { _id: req.params.clientId } )
    .then( result => {
      client = result
      return DataStream.findOne( { streamId: client.streamId }, 'canRead canWrite owner _id' )
    } )
    .then( stream => PermissionCheck( req.user, 'write', stream ) )
    .then( ( ) => {
      return client.remove( )
    } )
    .then( ( ) => {
      return res.send( { success: true, message: 'Client was deleted! Bye bye data.' } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
