'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../../models/DataStream' )

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting *all* streams for user ', req.user._id ) )
  DataStream.find( { owner: req.user._id }, 'name streamId deleted locked sharedWith private liveInstance createdAt updatedAt history' )
    .then( streams => {
      // TODO: Shared with streams
      res.send( { success: true, message: 'Stream list for user ' + req.user._id, ownedStreams: streams, sharedWithStreams: [ ] } )
    } )
    .catch( err => {
      res.status( 400 )
      res.send( { success: false, message: 'Something failed.' } )
    } )
}