'use strict'
const winston           = require( 'winston' )
const passport          = require( 'passport' )
const chalk             = require( 'chalk' )

const DataStream        = require( '../../../../models/DataStream' )
const SpeckleObject     = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {

  if( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } )
  .then( stream => {
    
    if( !stream ) throw new Error( 'No stream found.' )
    
    if( !stream.private ) return res.send( { success: true, stream: stream } )

    if( !req.user ||  !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) 
      throw new Error( 'Unauthorized. Please log in.' ) 
  
    return res.send( { success: true, message: 'Delivered stream meta.', stream: stream } )
  })
  .catch( err => {
    res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
    res.send( { success: false, message: err.toString() } )
  })  
}