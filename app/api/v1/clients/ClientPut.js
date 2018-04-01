const winston = require( 'winston' )
const chalk = require( 'chalk' )

const Client = require( '../../../../models/UserAppClient' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.clientId || !req.body) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  Client.findOne( { _id: req.params.clientId } )
    .then( resource => PermissionCheck( req.user, 'write', resource, Object.keys( req.body ) ) )
    .then( resource => resource.set( req.body ).save( ) )
    .then( resource => {
      res.send( { success: true, message: 'Client updated following fields: ' + Object.keys( req.body ) } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}