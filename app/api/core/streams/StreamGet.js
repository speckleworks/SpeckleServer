'use strict'
const winston           = require( 'winston' )
const passport          = require( 'passport' )
const chalk             = require( 'chalk' )

const DataStream        = require( '../../../../models/DataStream' )
const SpeckleObject     = require( '../../../../models/SpeckleObject' )
const AssembleObjects   = require( '../../helpers/AssembleObjects' )

module.exports = ( req, res ) => {

  if( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let myStream = {}

  DataStream.findOne( { streamId: req.params.streamId } ).populate( 'objects' ).lean()
  .then( stream => {
    
    if( !stream ) throw new Error( 'No stream found.' )
    if( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' ) 
    if( stream.private && ( !req.user ||  !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) ) 
      throw new Error( 'Unauthorized. Please log in.' ) 

    myStream = stream
    return AssembleObjects( stream.objects )
  })
  .then( assObjects => {
    myStream.objects = assObjects
    return res.send( { success: true, message: 'Delivered stream.' ,stream: myStream } )
  })
  .catch( err => {
    console.log( err )
    res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
    res.send( { success: false, message: err.message, streamId: req.streamId } )
  })  
}