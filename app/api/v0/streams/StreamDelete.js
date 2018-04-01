'use strict'
const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  let stream = {}
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( result => {
      if ( !result ) throw new Error( 'No stream found.' )
      stream = result
      return PermissionCheck( req.user, 'delete', result )
    } )
    .then( () => {
      return stream.remove( )
    } )
    .then( result => {
      return res.send( { success: true, message: 'Stream was deleted!' } )
    } )
    .catch( err => {
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}