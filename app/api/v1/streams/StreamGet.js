const winston = require( 'winston' )
const chalk = require( 'chalk' )
const uuid = require( 'uuid/v4' )

const DataStream = require( '../../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )
const PrepareQuery = require( '../middleware/PrepareQuery' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let query = PrepareQuery( req.query )

  DataStream.findOne( { streamId: req.params.streamId }, query.options.fields ).lean( )
    .then( stream => PermissionCheck( req.user, 'read', stream ) )
    .then( stream => {
      if ( ( !stream.layers || stream.layers.length === 0 ) )
        stream.layers = stream.objects ? [ getDefaultLayer( stream.objects.length ) ] : [ ]
      if ( stream.objects )
        stream.objects = stream.objects.map( id => { return { type: 'Placeholder', _id: id } } )

      return res.send( { success: true, message: 'Delivered stream.', resource: stream } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}

// creats a default speckle layer
function getDefaultLayer( length ) {
  return {
    name: 'Default Generated Speckle Layer',
    guid: uuid( ),
    orderIndex: 0,
    startIndex: 0,
    objectCount: length,
    topology: `0;0-${length} `,
    properties: { color: { a: 1, hex: 'Black' } }
  }
}