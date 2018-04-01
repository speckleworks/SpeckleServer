const winston = require( 'winston' )
const chalk = require( 'chalk' )
const Client = require( '../../../../models/UserAppClient' )

module.exports = ( req, res ) => {
  if ( !req.body ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request. Client not created.' } )
  }

  let myClient = new Client( req.body )
  
  if ( !req.user )
    return res.send( { success: true, message: 'Anonymous client created.', resource: { _id: 'temp-' + myClient._id } } )
  else 
    myClient.owner = req.user._id

    myClient.save( )
    .then( result => {
      res.send( { success: true, message: 'Client created.', resource: result } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}