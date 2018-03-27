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

  DataStream.findOne( { streamId: req.params.streamId }, 'name private owner canRead canWrite' )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      return PermissionCheck( req.user, 'read', stream )
    } )
    .then( stream => {
      res.send( { success: true, name: stream.name, message: 'This api route will be deprecated. Please use PATCH /api/stream/:streamId' } )
    } )
    .catch( err => {
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}