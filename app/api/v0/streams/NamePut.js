'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {

  winston.debug( chalk.bgGreen( 'Getting stream', req.params.streamId ) )

  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      return PermissionCheck( req.user, 'read', stream )
    } )
    .then( stream => {
      if ( !req.body.name ) throw new Error( 'No name was provided.' )
      stream.name = req.body.name
      return stream.save( )
    } )
    .then( stream => {
      res.status( 200 )
      return res.send( { success: true, message: 'Stream name was updated.', streamId: stream.streamId, message: 'This api route will be deprecated. Please use PATCH /api/stream/:streamId' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ), streamId: req.streamId } )
    } )
}