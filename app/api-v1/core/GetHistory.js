'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const HistoryInstance        = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting history instance', req.params.streamId ) )
  HistoryInstance.findOne( { _id: req.params.historyId } )
    .then( instance => {
      if( !instance ) throw new Error( 'No history instance found' )
      res.send( { success: true, historyInstance: instance } )
    })
    .catch( err => {
      res.status(404)
      res.send( { success: false, message: 'Error finding history instance.', streamId: req.params.historyId } )
    })  
}