'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const shortId = require( 'shortid' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  let stream = new DataStream( {
    owner: req.user._id,
    streamId: shortId.generate( ),
  } )
  
  if ( !req.body.objects ) req.body.objects = [ ]
  
  Promise.all( req.body.objects.reduce( ( arr, o ) => ( o._id !== undefined && o.type !== 'Placeholder' ) ? [ SpeckleObject.update( { _id: o._id }, o ), ...arr ] : arr, [ ] ) )
    .then( ( ) => SpeckleObject.find( { hash: { $in: req.body.objects.reduce( ( arr, o ) => o._id === undefined ? [ o.hash, ...arr ] : arr, [ ] ) } }, '_id hash' ) )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      return SpeckleObject.insertMany( req.body.objects.filter( so => so._id === undefined ) )
    } )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      stream.objects = req.body.objects.map( o => o._id )
      stream.layers = req.body.layers
      stream.name = req.body.name ? req.body.name : 'Speckle Stream'

      stream.private = req.body.private ? req.body.private : false
      stream.parent = req.body.parent
      stream.baseProperties = req.body.baseProperties
      stream.globalMeasures = req.body.globalMeasures
      stream.isComputedResult = req.body.isComputedResult ? req.body.isComputedResult : false

      SpeckleObject.updateMany( { '_id': { $in: stream.objects } }, { $addToSet: { partOf: stream.streamId } } ).exec( )
      return stream.save( )
    } )
    .then( streamm => {
      winston.debug( 'Created stream', stream.streamId )
      return res.send( { success: true, message: 'Created stream.', stream: stream } )
    } )
    .catch( err => {
      res.status( 400 )
      return res.send( { success: false, message: err.toString( ) } )
    } )
}