'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const RadioTower        = require('../../ws/RadioTower')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  winston.debug( chalk.red( 'Updating live history instance metadata (layers and or name).' ) )
  let streamId = req.get( 'speckle-stream-id' )
  let wsId = req.get( 'speckle-ws-id' )
  
  let wsMsg = {
    layers: req.body.layers,
    name: req.body.streamName
  }

  if( !streamId )
    return winston.error( 'No stream id specified, db update & live event stopped.' )
  if( wsId )
    RadioTower.broadcast( streamId, { eventName: 'metadata-update', args: wsMsg }, wsId )
  else 
    winston.error( 'No socket id specified, live event propagation was stopped' )
  
  DataStream.findOne( { streamId: streamId })
  .then( stream => { 
    if( !stream || !stream.liveInstance ) throw new Error( 'Stream not found or malformed.' )
    if( stream.locked ) { /* TODO */ }
    stream.name = req.body.streamName
    stream.save()
    return HistoryInstance.findById( stream.liveInstance ) // TODO: exclude object field
  })
  .then( liveInstance => {
    if( !liveInstance ) throw new Error( 'No live instance found.' )
    liveInstance.name = req.body.streamName
    liveInstance.layers = req.body.layers
    return liveInstance.save()
  })
  .then( () => { 
    return res.send( { success: true, message: 'Metadata updated' } )
  })
  .catch( err => {
    if( err ) {
      winston.error( err )
      return res.send( { success: false, message: 'Something went wrong when updating metadata.' } )
    }
  })
}