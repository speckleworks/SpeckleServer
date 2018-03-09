'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const mongoose = require( 'mongoose' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
const MergeLayers = require( '../../helpers/MergeLayers' )

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting stream', req.params.streamId ) )
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let stream = {}
  DataStream.findOne( { streamId: req.params.streamId } )
    .then( result => {
      stream = result
      
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