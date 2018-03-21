const winston = require( 'winston' )
const chalk = require( 'chalk' )

const Client = require( '../../../../models/UserAppClient' )
const PermissionCheck = require( '../../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.clientId || !req.body.client ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  Client.findOne( { _id: req.params.clientId } )
    .then( resource => PermissionCheck( req.user, 'write', resource, Object.keys( req.body.client ) ) )
    .then( resource => {
      for ( let key in req.body.client ) {
        if ( resource.toObject( ).hasOwnProperty( key ) ) {
          resource[ key ] = req.body.client[ key ]
          resource.markModified( key )
        }
      }
      return resource.save( )
    } )
    .then( result => {
      res.send( { success: true, message: 'Client updated.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}