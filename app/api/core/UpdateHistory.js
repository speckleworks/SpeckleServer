'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const RadioTower        = require('../../ws/RadioTower')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  let streamId = req.get( 'speckle-stream-id' )
  let wsId = req.get( 'speckle-ws-id' )

  winston.debug( chalk.cyan( 'Updating (adding one) stream history snapshots. streamid:', streamId, 'ws:',wsId ))
  
  let historyUpdateMsg = []
  let newHistoryInstance = {} 
  DataStream.findOne( { streamId : streamId } ).populate('liveInstance').populate('history', 'name _id createdAt')
    .then( stream => { 
      if( !stream ) return res.send({ success: false, message: 'Stream not found.' }) 
      historyUpdateMsg = stream.history.slice( 0 ) // important: do not keep track of the ref, make a clone
      newHistoryInstance = new HistoryInstance( {
        name: stream.liveInstance.name,
        properties: stream.liveInstance.properties,
        layers: stream.liveInstance.layers,
        objects: stream.liveInstance.objects,
        objectProperties: stream.liveInstance.objectProperties
      })
      historyUpdateMsg.push(  { name: newHistoryInstance.name, _id: newHistoryInstance._id, createdAt: newHistoryInstance.createdAt } )
      stream.history.push( newHistoryInstance._id )
      return stream.save() 
    })
    .then( () => {
      winston.debug('Saved stream history')
      return newHistoryInstance.save() 
    })
    .then( () => {
      RadioTower.broadcast( streamId, { eventName: 'history-update', args: historyUpdateMsg }, wsId )
      winston.debug('Saved history instance and broadcast')
      return res.send( { success: true, message: 'New history instance saved.' } ) 
    })
    .catch( err => { 
      winston.error( err )
      return res.send({ success: false, message: 'Could not save history instance.' }) 
    })
}