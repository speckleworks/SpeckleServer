'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const DataStream        = require('../../../models/DataStream')

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting stream', req.get('speckle-stream-id') ) )
  DataStream.findOne( {streamId: req.streamId }, '-owner -sharedWith' ).populate('liveInstance')
    .then( stream => {
      if( !stream ) throw new Error( 'No stream found' )
      let response = { 
        success: true, 
        message: 'Stream found',
        name: stream.liveInstance.name,
        layers: stream.liveInstance.layers,
        objects: stream.liveInstance.objects,
        history: stream.liveInstance.history
      }
      res.send( response )
    })
    .catch( err => {
      res.send( { success: false, message: 'Error finding stream.', streamId: req.streamId } )
    })  
}