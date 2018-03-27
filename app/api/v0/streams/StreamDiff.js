const winston = require( 'winston' )
const _ = require( 'lodash' )
const DataStream = require( '../../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId || !req.params.otherId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  if ( req.params.streamId == req.params.otherId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Can not diff the same stream, yo!' } )
  }

  let first = {}
  let second = {}

  DataStream.find( { streamId: { $in: [ req.params.streamId, req.params.otherId ] } } ).lean( )
    .then( streams => {
      if ( streams.length != 2 ) throw new Error( 'Failed to find streams.' )

      first = streams.find( s => s.streamId === req.params.streamId )
      second = streams.find( s => s.streamId === req.params.otherId )

      // check if user can read first stream
      return PermissionCheck( req.user, 'read', first )
    } )
    .then( ( ) => {
      // check if user can read second stream
      return PermissionCheck( req.user, 'read', second )
    } )
    .then( ( ) => {
      let objects = { common: null, inA: null, inB: null }
      objects.inA = _.differenceWith( first.objects, second.objects, ( arrVal, otherVal ) => arrVal.toString( ) === otherVal.toString( ) )
      objects.inB = _.differenceWith( second.objects, first.objects, ( arrVal, otherVal ) => arrVal.toString( ) === otherVal.toString( ) )
      objects.common = _.intersectionWith( first.objects, second.objects, ( arrVal, otherVal ) => arrVal.toString( ) === otherVal.toString( ) )

      let layers = { common: null, inA: null, inB: null }
      layers.common = _.intersectionWith( first.layers, second.layers, ( arrVal, otherVal ) => arrVal.guid === otherVal.guid )
      layers.inA = _.differenceWith( first.layers, second.layers, ( arrVal, otherVal ) => arrVal.guid === otherVal.guid )
      layers.inB = _.differenceWith( second.layers, first.layers, ( arrVal, otherVal ) => arrVal.guid === otherVal.guid )

      res.send( { success: true, objects: objects, layers: layers } )
    } )
    .catch( err => {
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )

}