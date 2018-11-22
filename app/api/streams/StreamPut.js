const winston = require( '../../../config/logger' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )
const BulkObjectSave = require( '../middleware/BulkObjectSave' )

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Patching stream', req.params.streamId ) )

  if ( !req.params.streamId || !req.body ) {
    return res.status( 400 ).send( { success: false, message: 'No streamId or stream provided.' } )
  }

  if ( Object.keys( req.body ).indexOf( 'streamId' ) )
    return res.status( 400 ).send( { success: false, message: 'You are trying to modify the streamId; that is not allowed. Sorry!' } )

  let stream = {}

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( result => PermissionCheck( req.user, 'write', result, Object.keys( req.body ) ) )
    .then( result => {
      stream = result
      return req.body.objects ? BulkObjectSave( req.body.objects, req.user ) : true
    } )
    .then( result => {
      stream.set( req.body )
      if ( req.body.objects ) stream.objects = result.map( obj => obj._id )
      return stream.save( )
    } )
    .then( ( ) => {
      res.send( { success: true, message: 'Patched stream fields: ' + Object.keys( req.body ) } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
