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

  DataStream.findOne( { streamId: req.params.streamId } ).lean( )
    .then( stream => PermissionCheck( req.user, 'read', stream ) )
    .then( stream => {
      res.send( { success: true, message: 'Delivered layers.', layers: stream.layers } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.toString( ), streamId: req.streamId } )
    } )
}