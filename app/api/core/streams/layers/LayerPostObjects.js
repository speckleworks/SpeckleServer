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
  let dbStream = [ ]
  let targetLayer = {}
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' )
      if ( stream.private && ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) )
        throw new Error( 'Unauthorized. Please log in.' )

      let layer = stream.layers.find( l => l.guid === req.params.layerId )
      if ( !layer ) layer = stream.layers.find( l => l.name === req.params.layerId )
      if( ! layer ) throw new Error( 'No layer with that id/name found.' )

      dbStream = stream
      targetLayer = layer
      return Promise.all( req.body.objects.reduce( ( arr, o ) => ( o._id !== undefined && o.type !== 'Placeholder' ) ? [ SpeckleObject.update( { _id: o._id }, o ), ...arr ] : arr, [ ] ) )
    } )
    .then( ( ) => SpeckleObject.find( { hash: { $in: req.body.objects.reduce( ( arr, o ) => o._id === undefined ? [ o.hash, ...arr ] : arr, [ ] ) } }, '_id hash' ) )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      return SpeckleObject.insertMany( req.body.objects.filter( so => so._id === undefined ) )
    } )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      dbStream.objects.splice( targetLayer.startIndex, 0, ...req.body.objects.map( o => o._id ) )
      dbStream.layers.forEach( layer => {
        if ( layer.guid === targetLayer.guid ) layer.objectCount += req.body.objects.length
        if ( layer.startIndex > targetLayer.startIndex ) layer.startIndex += req.body.objects.length
      } )
      dbStream.markModified( 'objects' )
      dbStream.markModified( 'layers' )

      SpeckleObject.updateMany( { '_id': { $in: dbStream.objects } }, { $addToSet: { partOf: dbStream.streamId } } ).exec( )

      return dbStream.save( )
    } )
    .then( stream => {
      res.send( { success: true, message: 'Stream layer was updated (objects appended)' } )
    } )
    .catch( err => {
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}