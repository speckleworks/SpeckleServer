'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const shortId           = require('shortid')

const RadioTower        = require('../../ws/RadioTower')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')
const DataObject        = require('../../../models/DataObject')

// const nonHashedTypes    = 'Number Point Vector Boolean String Line Plane'
const nonHashedTypes       = [ '404', "Number", "Boolean", "String", "Point", "Vector", "Line", "Interval", "Interval2d" ]

const hashedTypes = [ "Polyline", "Curve", "Mesh", "Brep" ] 
const encodedTypes = [ "Curve", "Brep" ]


module.exports = ( req, res ) => {
  winston.debug( chalk.red( 'Updating stream live history instance data.' ) )
  let streamId = req.params.streamId
  let historyId = req.params.historyId ? req.params.historyId : 'live'
  let wsId = req.get( 'speckle-ws-id' )

  winston.debug( chalk.bgBlue('streamid', streamId, 'history id', historyId, 'ws', wsId) )

  let toInsertInDb = []
  if( req.body.objects != null  && req.body.objects.length > 0)
    req.body.objects.forEach( obj => {
      if( hashedTypes.indexOf( obj.type ) >= 0 )
        toInsertInDb.push( obj )
    }) 
  // this is where we will store the ws broadcast message.
  let wsArgs = {}
  
  // one long promise chain, but it has comments!
  // 1: find the stream
  DataStream.findOne( { streamId : streamId } )
    .then( stream => {
      winston.debug( chalk.cyan( 'Finding live instance ', stream.historyId === 'live' ? stream.liveInstance : historyId, 'for stream', streamId ) )
      if( !stream || !stream.liveInstance ) throw new Error( 'Stream not found or malformed.' )
      if( stream.history.indexOf( historyId ) === -1 && historyId != 'live') throw new Error( 'History instance is not part of this stream' )
      
      wsArgs.streamId = streamId
      return HistoryInstance.findById( historyId === 'live' ? stream.liveInstance : historyId )
    })
    // 2: update the history instance data
    .then( historyInstance => {
      if( !historyInstance ) throw new Error( 'No live instance found.' )
      
      historyInstance.name = req.body.streamName
      historyInstance.layers = req.body.layers
      historyInstance.objectProperties = req.body.objectProperties

      historyInstance.objects = [] // set up fresh
      if( req.body.objects != null  && req.body.objects.length > 0)
        req.body.objects.forEach( obj => {
          historyInstance.objects.push( hashedTypes.indexOf( obj.type ) >= 0 ? { type: obj.type, hash: obj.hash } : obj ) 
        } )

      wsArgs.name = historyInstance.name
      wsArgs.layers = historyInstance.layers
      wsArgs.objects = historyInstance.objects
      wsArgs.objectProperties = historyInstance.objectProperties

      winston.debug( chalk.cyan( 'Saving live instance ' + historyInstance._id ) )
      return historyInstance.save()
    })
    // 3: save new DataObjects to database
    .then( () => { 
      if( toInsertInDb.length === 0 )
        return true
      else {
        winston.debug( chalk.cyan( 'Attempting to store', toInsertInDb.length, 'objects.' ) )
        return DataObject.insertMany( toInsertInDb )
      }
    })
    // 4: if no errors i'm jumping here, so let's broadcast and do magic
    .then( ( ) => {
      if( historyId === 'live' )
        RadioTower.broadcast( streamId, { eventName: 'live-update', args: wsArgs }, wsId )
      else 
        RadioTower.broadcast( streamId, { eventName: 'history-instance-update' }, wsId )
      return res.send( { success: true, message: 'Inserted ' + toInsertInDb.length + ' objects.', streamId: streamId, historyId: historyId } )
    })
    // if errors, check if it's E1100 (dupe keys in db): that's ok, broadcast the grand success.
    .catch( err => {
      // console.log( err )
      if( err.message.indexOf('E11000') >= 0 ) {
        winston.debug('E11000 dupe error.')
        if( historyId === 'live' )
          RadioTower.broadcast( streamId, { eventName: 'live-update', args: wsArgs }, wsId )
        return res.send( { success: true, message: 'Inserted ' + toInsertInDb.length + ' objects.', streamId: streamId, historyId: historyId } )
      }
      res.status(400)
      return res.send( { success: false, message: 'Something went wrong when updating stream live instance.', streamId: streamId, historyId: historyId} )
    })
}