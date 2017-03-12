'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const DataStream        = require('../../../models/DataStream')

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting stream', req.get('speckle-stream-id') ) )

  DataStream.findOne( {streamId: req.params.streamId }, '-owner -sharedWith' )
    .then( stream => {
      if( !stream ) throw new Error( 'No stream found' )
      res.send( { success: true, stream: stream } )
    })
    .catch( err => {
      res.status(404)
      res.send( { success: false, message: 'Error finding stream.', streamId: req.streamId } )
    })  
}