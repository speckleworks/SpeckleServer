const winston = require( '../../../config/logger' )
const q2m = require( 'query-to-mongo' )

const DataStream = require( '../../../models/DataStream' )
const UserAppClient = require( '../../../models/UserAppClient' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } ).lean( )
    .then( stream => PermissionCheck( req.user, 'read', stream ) )
    .then( ( ) => {
      let query = q2m( req.query )
      query.criteria[ 'streamId' ] = req.params.streamId
      return UserAppClient.find( query.criteria, query.options.fields, { sort: query.options.sort, skip: query.options.skip, limit: query.options.limit } )
    } )
    .then( clients => {
      res.send( { success: true, resources: clients, message: `Client list for stream ${req.params.streamId} returned.` } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
