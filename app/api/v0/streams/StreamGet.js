'use strict'
const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )


const DataStream = require( '../../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {

  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let stream = null
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( doc => {
      stream = doc
      return PermissionCheck( req.user, 'read', doc )
    } )
    .then( ( ) => {
      if ( !stream ) throw new Error( 'No stream found.' )
      return res.send( { success: true, message: 'Delivered stream.', stream: stream } )
    } )
    .catch( err => {
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}