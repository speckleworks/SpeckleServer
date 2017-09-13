'use strict'
const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../../models/DataStream' )

module.exports = ( req, res ) => {

  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  if ( !req.params.layerId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No layer guid provided.' } )
  }
  DataStream.findOne( { streamId: req.params.streamId }, 'layers' ).lean( )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' )
      if ( stream.private && ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) )
        throw new Error( 'Unauthorized. Please log in.' )
      let layer = stream.layers.find( l => l.guid === req.params.layerId )
      if( !layer )
        throw new Error( 'No layer with that id exists.' )
      return res.send( { success: true, message: 'Delivered layer.', layer: layer } )
    } )
    .catch( err => {
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.toString( ), streamId: req.streamId } )
    } )
}