'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../../models/DataStream' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  if ( !req.params.layerId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No layer id provided.' } )
  }
  if( !req.body.layer ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No layer provided.' } ) 
  }

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' )
      if ( stream.private && ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) )
        throw new Error( 'Unauthorized. Please log in.' )

      let indexToReplace = stream.layers.findIndex( l => l.guid ===  req.params.layerId )
      if( indexToReplace < 0 )
        throw new Error( 'Layer with that guid did not exist.' )
      stream.layers[ indexToReplace ] = req.body.layer
      stream.layers[ indexToReplace ].guid = req.params.layerId // bypass guid replacement
      stream.markModified( 'layers' )
      return stream.save( )
    } )
    .then( stream => {
      res.status( 200 )
      return res.send( { success: true, message: 'Stream layer was replaced.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}