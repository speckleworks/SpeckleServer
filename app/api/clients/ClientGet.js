const winston = require( '../../../config/logger' )

const Client = require( '../../../models/UserAppClient' )
const DataStream = require( '../../../models/DataStream' )

const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.clientId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  let client = null
  Client.findOne( { _id: req.params.clientId } ).populate( 'owner', 'name surname email company' )
    .then( result => {
      client = result
      return DataStream.findOne( { streamId: client.streamId }, 'canRead canWrite owner _id' )
    } )
    .then( result => PermissionCheck( req.user, 'read', result ) )
    .then( result => {
      if ( !result ) throw new Error( 'No client found.' )
      res.send( { success: true, message: 'Client found.', resource: client } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
