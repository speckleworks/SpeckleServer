'use strict'
const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )
const q2m = require( 'query-to-mongo' )

const DataStream = require( '../../../../../models/DataStream' )
const SpeckleObject = require( '../../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {

  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  let streamObjects = [ ]
  let layerObjects = [ ]
  let streamLayer = {}
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' )
      if ( stream.private && ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) )
        throw new Error( 'Unauthorized. Please log in.' )

      let layer = stream.layers.find( l => l.guid === req.params.layerId )
      if ( !layer ) layer = stream.layers.find( l => l.name === req.params.layerId )
      if( ! layer ) throw new Error( 'No layer with that id/name found.' )
      
      streamObjects = stream.objects.map( o => o.toString( ) )
      streamLayer = layer
      let query = q2m( req.query )
      layerObjects = stream.objects.slice( layer.startIndex, layer.startIndex + layer.objectCount )
      query.criteria[ '_id' ] = { $in: layerObjects }
      return SpeckleObject.find( query.criteria, query.options.fields, { sort: query.options.sort } )
    } )
    .then( objects => {
      let list = layerObjects.reduce( ( arr, o ) => [ ...arr, objects.find( oo => oo._id.toString( ) === o.toString( ) ) ], [ ] )
      res.send( { success: true, objects: list, layer: streamLayer } )
    } )
    .catch( err => {
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}