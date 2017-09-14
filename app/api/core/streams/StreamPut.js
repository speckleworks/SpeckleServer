'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const mongoose = require( 'mongoose' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
const MergeLayers = require( '../../helpers/MergeLayers' )

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting stream', req.params.streamId ) )
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let stream = {}
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( result => {
      stream = result
      stream.name = req.body.name ? req.body.name : stream.name
      stream.layers = req.body.layers ? MergeLayers( stream.layers, req.body.layers ) : stream.layers
      return Promise.all( req.body.objects.reduce( ( arr, o ) => ( o._id !== undefined && o.type !== 'Placeholder' ) ? [ SpeckleObject.update( { _id: o._id }, o ), ...arr ] : arr, [ ] ) )
    } )
    .then( ( ) => SpeckleObject.find( { hash: { $in: req.body.objects.reduce( ( arr, o ) => o._id === undefined ? [ o.hash, ...arr ] : arr, [ ] ) } }, '_id hash' ) )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      return SpeckleObject.insertMany( req.body.objects.filter( so => so._id === undefined ) )
    } )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      stream.objects = req.body.objects.map( o => o._id )
      stream.markModified( 'name' )
      stream.markModified( 'layers' )
      stream.markModified( 'objects' )
      return stream.save( )
    } )
    .then( result => {
      res.send( { success: true, message: 'Updated stream.' } )
    })
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}