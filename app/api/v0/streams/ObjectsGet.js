'use strict'
const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )
const q2m = require( 'query-to-mongo' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {

  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  let streamObjects = [ ]
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' )
      if ( stream.private && ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) )
        throw new Error( 'Unauthorized. Please log in.' )
      streamObjects = stream.objects.map( o => o.toString( ) )
      let query = q2m( req.query )
      query.criteria[ '_id' ] = { $in: stream.objects }
      return SpeckleObject.find( query.criteria, query.options.fields, { sort: query.options.sort, offset: query.options.offset, limit: query.options.limit } )
    } )
    .then( objects => {
      let list = streamObjects.reduce( ( arr, o ) => {
        let match = objects.find( oo => oo._id == o )
        if( match ) arr.push( match )
        return arr
      }, [ ] )
      res.send( { success: true, objects: list, message: 'Object list returned. If querying, duplication of objects in list will not be respected.' } )
    } )
    .catch( err => {
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}