const winston           = require('winston')
const chalk             = require('chalk')
const Client            = require( '../../../../models/UserAppClient')

module.exports = ( req, res ) => {
  if( !req.params.clientId || !req.body.client ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.'} )
  }
  Client.findOne( { _id: req.params.clientId } ) 
  .then( result => {
    if( !result ) throw new Error( 'No client found.' )
    
    for( let key in req.body.client )
      result[ key ] = req.body.client[ key ]

    return result.save()
  })
  .then( result => {
    res.send( { success: true, message: 'Client updated.' } )
  })
  .catch( err => {
    res.status( 400 )
    res.send( { success: false, message: err.toString() } )
  })
}