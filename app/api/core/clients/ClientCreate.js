const winston           = require('winston')
const chalk             = require('chalk')
const Client            = require( '../../../../models/UserAppClient')

module.exports = ( req, res ) => {
  if( !req.body.client ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request. Client not created.'} )
  }

  let myClient = new Client( {
    role: req.body.client.role,
    documentName: req.body.client.documentName,
    documentType: req.body.client.documentType,
    documentGuid: req.body.client.documentGuid,
    streamId: req.body.client.streamId,
    online: true,
    owner: req.user._id
  } )

  myClient.save() 
  .then( result => {
    res.send( { success: true, message: 'Client created.', clientId: result._id } )
  })
  .catch( err => {
    res.status( 400 )
    res.send( { success: false, message: err.toString() } )
  })

}