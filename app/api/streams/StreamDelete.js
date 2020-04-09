'use strict'
const winston = require( '../../../config/logger' )

const DataStream = require( '../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  let myStream = null
  DataStream.findOne( { streamId: req.params.streamId }, 'owner children canRead canWrite' )
    .then( stream => PermissionCheck( req.user, 'delete', stream ) )
    .then( stream => {
      myStream = stream
      return DataStream.deleteMany( { streamId: { $in: [ ...myStream.children, req.params.streamId ] } } )
    } )
    .then( ( ) => {
      return res.send( { success: true, message: `Stream ${req.params.streamId} and its children have been deleted.`, deletedStreams: [ ...myStream.children, req.params.streamId ] } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
