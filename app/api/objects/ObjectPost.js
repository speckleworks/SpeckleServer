const winston = require( '../../../config/logger' )

const BulkObjectSave = require( '../middleware/BulkObjectSave' )

module.exports = ( req, res ) => {
  if ( !req.body ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }

  BulkObjectSave( req.body instanceof Array ? req.body : [ req.body ], req.user )
    .then( objects => {
      res.send( { success: true, message: 'Saved objects to database.', resources: objects.map( o => { return { type: 'Placeholder', _id: o._id } } ) } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString() } )
    } )
}
