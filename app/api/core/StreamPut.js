'use strict'
const winston           = require( 'winston' )
const passport          = require( 'passport' )
const chalk             = require( 'chalk' )

const DataStream        = require( '../../../models/DataStream' )
const SpeckleObject     = require( '../../../models/SpeckleObject' )
const HistoryInstance   = require( '../../../models/HistoryInstance' )

module.exports = ( req, res ) => {
  
  winston.debug( chalk.bgGreen( 'Getting stream', req.params.streamId ) )
  
  if( !req.params.streamId ) {
    res.status( 400 ) 
    return res.send( { success:false, message: 'No stream id provided.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } )
  .then( stream => {
  
    if( !stream ) throw new Error( 'No stream found.' )

    if( !req.user ||  !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) 
      throw new Error( 'Unauthorized. Please log in.' ) 
    
    // req.body.objects
    // req.body.layers
    // req.body.name  

    res.status( 200 ) 
    return res.send( { success:true, message: 'Should update stream now' } )
  })
  .catch( err => {
    console.log( 'wott' )
    res.status( 400 )
    res.send( { success: false, message: err, streamId: req.streamId } )
  })  
}