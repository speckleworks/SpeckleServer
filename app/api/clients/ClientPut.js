const winston = require( '../../../config/logger' )

const Client = require( '../../../models/UserAppClient' )
const DataStream = require( '../../../models/DataStream' )

const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.clientId || !req.body ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  let client = null
  Client.findOne( { _id: req.params.clientId } )
    .then( result => {
      client = result
      return DataStream.findOne( { streamId: client.streamId }, 'canRead canWrite owner _id' )
    } )
    .then( resource => PermissionCheck( req.user, 'write', resource, Object.keys( req.body ) ) )
    .then( () => client.set( req.body ).save( ) )
    .then( ( ) => {
      res.send( { success: true, message: 'Client updated following fields: ' + Object.keys( req.body ) } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
