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

  // prevent streamId changes
  if ( Object.keys( req.body ).indexOf( 'streamId' ) )
    delete req.body.streamId

  let stream = {}
  let objsToSave = [ ]
  if ( req.body.objects )
    objsToSave = req.body.objects.filter( o => o.type !== 'Placeholder' )

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( result => PermissionCheck( req.user, 'write', result, Object.keys( req.body ) ) )
    .then( result => {
      stream = result
      return objsToSave.length > 0 ? BulkObjectSave( objsToSave, req.user ) : true
    } )
    .then( result => {
      stream.set( req.body )
      if ( objsToSave.length > 0 ) stream.objects = result.map( obj => obj._id )

      stream.canRead = stream.canRead.filter( x => !!x )
      stream.canWrite = stream.canWrite.filter( x => !!x )

      return stream.save( )
    } )
    .then( ( ) => {
      res.send( { success: true, message: 'Patched stream fields: ' + Object.keys( req.body ) } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
