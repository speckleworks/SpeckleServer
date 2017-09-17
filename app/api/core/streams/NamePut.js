'use strict'
const winston           = require( 'winston' )
const chalk             = require( 'chalk' )

const DataStream        = require( '../../../../models/DataStream' )
const MergeLayers       = require( '../../helpers/MergeLayers' )

module.exports = ( req, res ) => {
  
  winston.debug( chalk.bgGreen( 'Getting stream', req.params.streamId ) )
  
  if( !req.params.streamId ) {
    res.status( 400 ) 
    return res.send( { success:false, message: 'No stream id provided.' } )
  }

  let geometries = []
  let parsedObj = []
  let myStream = {}
  DataStream.findOne( { streamId: req.params.streamId } )
  .then( stream => {
    if( !stream ) throw new Error( 'No stream found.' )
    if( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' ) 
    if( stream.private && ( !req.user ||  !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) ) 
      throw new Error( 'Unauthorized. Please log in.' )  
    if( !req.body.name ) throw new Error( 'No name was provided.' )

    stream.name = req.body.name
    return stream.save()
  })
  .then( stream => {
    res.status( 200 ) 
    return res.send( { success: true, message: 'Stream name was updated.', streamId: stream.streamId } )
  })
  .catch( err => {
    winston.error( err )
    res.status( 400 )
    res.send( { success: false, message: err.toString() , streamId: req.streamId } )
  })  
}