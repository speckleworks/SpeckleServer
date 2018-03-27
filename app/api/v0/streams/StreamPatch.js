'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const mongoose = require( 'mongoose' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
const MergeLayers = require( '../helpers/MergeLayers' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Patching stream', req.params.streamId ) )

  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let stream = {}
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( result => {
      stream = result
      return PermissionCheck( req.user, 'write', result )
    })
    .then(() => {
      for ( var key in req.body ) {
        if ( stream.toObject( ).hasOwnProperty( key ) ) {
          stream[ key ] = req.body[ key ]
          stream.markModified( key )
          console.log( "patching " + key )
        }
      }
      return stream.save( )
    } )
    .then( result => {
      res.send( { success: true, message: 'Patched stream.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}