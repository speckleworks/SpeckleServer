'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const RadioTower        = require('../../ws/RadioTower')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  winston.debug( chalk.bgCyan( 'Updating (adding one) stream history snapshots.') )
  // Note: this should just duplicate the existing live instance. that's kind-of it.
  // Broadcast: to streamid, before db commit (take risks)
  res.send({ success: false, message: 'Not yet implemented.' }) 
}