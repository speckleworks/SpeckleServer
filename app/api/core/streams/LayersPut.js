'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../../models/DataStream' )
const MergeLayers = require( '../../helpers/MergeLayers' )
const PermissionCheck = require( '../../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }
  if ( !req.body.layers ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No layers provided.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => PermissionCheck( req.user, 'write', stream ) )
    .then( stream => {
      stream.layers = req.body.layers
      stream.markModified( 'layers' )
      return stream.save( )
    } )
    .then( stream => {
      res.status( 200 )
      return res.send( { success: true, message: 'Stream layers were replaced. WARNING: Deprecated.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}