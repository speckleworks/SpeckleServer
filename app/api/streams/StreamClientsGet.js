const winston = require( 'winston' )
const uuid = require( 'uuid/v4' )
const q2m = require( 'query-to-mongo' )

const DataStream = require( '../../../models/DataStream' )
const UserAppClient = require( '../../../models/UserAppClient' )
const PermissionCheck = require( '../middleware/PermissionCheck' )
const PrepareQuery = require( '../middleware/PrepareQuery' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let query = PrepareQuery( req.query )

  DataStream.findOne( { streamId: req.params.streamId } ).lean()
    .then( stream => PermissionCheck( req.user, 'read', stream ) )
    .then( stream => {
      let query = q2m( req.query )
      query.criteria['streamId'] = req.params.streamId
      console.log( query )
      return UserAppClient.find(query.criteria, query.options.fields, { sort: query.options.sort, offset: query.options.offset, limit: query.options.limit } )
    } )
    .then( clients => {
      res.send( { success: true, resources: clients, message: `Client list for stream ${req.params.streamId} returned.` } )
    })
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
