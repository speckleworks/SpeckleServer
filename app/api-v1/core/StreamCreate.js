'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const shortId           = require('shortid')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  winston.debug( chalk.bgCyan( 'Creating a new stream, sending streamid back.' ) )

  var liveInstance = new HistoryInstance({ name: 'A1'})
  liveInstance.save() 
    .then( instance => {
      var myStream = new DataStream( {
        owner: req.user._id,
        streamId: shortId.generate(),
        liveInstance: instance._id,
        history: [ instance._id ]
      } )
      return myStream.save()
    })
    .then( stream => {
      return res.send( { success: true, message: 'Creted stream.', data: stream } )
    })
    .catch( err => {
      res.status(400)
      return res.send( { success: false, message: 'Failed to create stream.'} )
    })
}