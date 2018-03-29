const winston           = require('winston')
const chalk             = require('chalk')

const Client            = require( '../../../../models/UserAppClient')
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if( !req.params.clientId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.'} )
  }
  Client.findOne( { _id: req.params.clientId } ) 
  .then( result => PermissionCheck( req.user, 'read', result ) )
  .then( result => {
    if( !result ) throw new Error( 'No client found.' )
    res.send( { success: true, message: 'Client found.', resource: result } )
  })
  .catch( err => {
    winston.error( err )
    res.status( 400 )
    res.send( { success: false, message: err.toString() } )
  })
}