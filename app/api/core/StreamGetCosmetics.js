'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting stream cosmetics', req.get('speckle-stream-id') ) )
  DataStream.findOne( { streamId: req.params.streamId }, 'layerMaterials' )
    .then( stream => {
      if( !stream ) throw new Error( 'No stream found' )
      res.send( { success: true, data: stream } )
    })
    .catch( errs => {
      res.status(404)
      res.send( { success: false, message: errs.toString(), streamId: req.streamId } )
    })  
}