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
      if ( !layer ) throw new Error( 'No layer with that id/name found.' )

      let originalObjectList = [ ...stream.objects ]

      if ( req.body.objects ) {
        let layerObjects = stream.objects.slice( layer.startIndex, layer.startIndex + layer.objectCount )
        let amountRemoved = req.body.objects.length
        for ( let i = layer.startIndex + layer.objectCount - 1; i >= layer.startIndex; i++ ) {
          if ( req.body.objects.find( o => o === stream.objects[ i ].toString( ) ) )
            stream.objects.splice( i, 1 )
        }
        layer.objectCount -= amountRemoved
        stream.layers.forEach( l => {
          if ( l.startIndex > layer.startIndex ) l.startIndex -= amountRemoved
        } )
      } else {
        let layerObjects = stream.objects.slice( layer.startIndex, layer.startIndex + layer.objectCount )
        stream.objects.splice( layer.startIndex, layer.startIndex + layer.objectCount )
        let amountRemoved = layer.startIndex + layer.objectCount
        stream.layers.forEach( l => {
          if ( l.guid === layer.guid ) l.objectCount = 0
          if ( l.startIndex > layer.startIndex ) l.startIndex -= amountRemoved
        } )
      }

      let fullyRemoved = originalObjectList.reduce( ( arr, ob ) => {
        if ( !stream.objects.find( k => k.toString( ) == ob.toString( ) ) ) arr.push( ob )
      }, [ ] )
      SpeckleObject.updateMany( { '_id': { $in: fullyRemoved } }, { $pullAll: { partOf: [ req.params.streamId ] } } ).exec( )

      stream.markModified( 'layers' )
      stream.markModified( 'objects' )
      return stream.save( )
    } )
    .then( result => {
      res.send( { success: true, message: 'Objects on layer were purged.' } )
    } )
    .catch( err => {
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}