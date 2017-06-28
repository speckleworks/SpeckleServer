'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const RadioTower        = require('../../ws/RadioTower')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  winston.debug( chalk.red( 'Updating live history instance metadata.' ) )

  let streamId = req.params.streamId
  let historyId = req.params.historyId ? req.params.historyId : 'live'
  let wsId = req.get( 'speckle-ws-id' )
  
  let wsMsg = {
    layers: req.body.layers,
    name: req.body.streamName
  }

  if( !streamId ) {
    res.status(400)
    return res.send( { success: false, message: 'No streamId provided.' } )
  }
  if( wsId && historyId === 'live' )
    RadioTower.broadcast( streamId, { eventName: 'metadata-update', args: wsMsg }, wsId )
  else 
    winston.error( 'No socket id specified, live event propagation was stopped' )
  
  DataStream.findOne( { streamId: streamId })
  .then( stream => { 
    if( !stream || !stream.liveInstance ) throw new Error( 'Stream not found or malformed.' )
    if( stream.history.indexOf( historyId ) === -1 && historyId != 'live') throw new Error( 'History instance is not part of this stream' )
    
    stream.name = req.body.streamName
    stream.save()
    return HistoryInstance.findById( historyId === 'live' ? stream.liveInstance : historyId, '-objects' ) // TODO: exclude object field
  })
  .then( liveInstance => {
    if( !liveInstance ) throw new Error( 'No live instance found.' )
    liveInstance.name = req.body.streamName
    liveInstance.layers = req.body.layers
    return liveInstance.save()
  })
  .then( () => { 
    res.status( 200 )
    return res.send( { success: true, message: 'Metadata updated', streamId: streamId, historyId: historyId } )
  })
  .catch( err => {
    if( err ) {
      res.status( 400 )
      return res.send( { success: false, message: 'Stream Live Metadata failed update.', streamId: streamId, historyId: historyId } )
    }
  })
}