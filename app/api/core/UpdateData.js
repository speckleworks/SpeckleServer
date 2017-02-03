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

module.exports = ( req, res ) => {
  winston.debug( chalk.red( 'Updating stream live history instance data.' ) )
  console.log(req.body.objectProperties)
  let streamId = req.get( 'speckle-stream-id' )
  let wsId = req.get( 'speckle-ws-id' )

  let toInsertInDb = []

  req.body.objects.forEach( obj => {
    if( obj.hasOwnProperty('value') && obj.value != null && nonHashedTypes.indexOf( obj.type ) < 0 )
      toInsertInDb.push( obj )
  }) 

  winston.debug( chalk.red( 'Will try and insert', toInsertInDb.length, 'objects in database.') )
  
  // this is where we will store the ws broadcast message.
  let wsArgs = {}
  
  // one long promise chain, but it has comments!
  // 1: find the stream
  DataStream.findOne( { streamId : streamId } )
    .then( stream => {
      winston.debug( chalk.cyan( 'Finding live instance ', stream.liveInstance, 'for stream', streamId ) )
      if( !stream || !stream.liveInstance ) throw new Error( 'Stream not found or malformed.' )
      
      wsArgs.streamId = streamId
      return HistoryInstance.findById( stream.liveInstance )
    })
    // 2: update the liveInstance data
    .then( liveInstance => {
      if( !liveInstance ) throw new Error( 'No live instance found.' )
      winston.debug( chalk.cyan( 'Saving live instance ' + liveInstance._id ) )
      liveInstance.name = req.body.streamName
      liveInstance.layers = req.body.layers
      liveInstance.objects = [] // set up fresh
      req.body.objects.forEach( obj => {
        liveInstance.objects.push( nonHashedTypes.indexOf( obj.type ) < 0 ? { type: obj.type, hash: obj.hash } : obj ) 
      } )
      // save them custom props dude
      liveInstance.objectProperties = req.body.objectProperties

      wsArgs.name = liveInstance.name
      wsArgs.layers = liveInstance.layers
      wsArgs.objects = liveInstance.objects
      wsArgs.objectProperties = liveInstance.objectProperties

      return liveInstance.save()
    })
    // 3: save new DataObjects to database
    .then( () => { 
      if( toInsertInDb.length === 0 ) {
        winston.debug( chalk.cyan( 'Nothing to insert re new objects, done.' ) )
        // exit ok from this promise
        return true
      } else {
        winston.debug( chalk.cyan( 'Attempting to store', toInsertInDb.length, 'objects.' ) )
        return DataObject.insertMany( toInsertInDb )
      }
    })
    // 4: if no errors i'm jumping here, so let's broadcast and do magic
    .then( () => {
      winston.debug('Stored stuff.')
      RadioTower.broadcast( streamId, { eventName: 'live-update', args: wsArgs }, wsId )
      res.send( { success: true, message: 'Inserted ' + toInsertInDb.length + ' objects.'} )
    })
    // if errors, check if it's E1100 (dupe keys in db): that's ok, broadcast the grand success.
    .catch( err => {
      if( err.message.indexOf('E11000') >= 0 ) {
        winston.error( err )
        winston.debug('Got a dupe or more in db. Carry on, all is well.')
        RadioTower.broadcast( streamId, { eventName: 'live-update', args: wsArgs }, wsId )
        return res.send( { success: true, message: 'Some dupe objects in db were not saved, but all should be ok. '})
      }
      winston.error( err )
      return res.send( { success: false, message: 'Something went wrong when updating stream live instance.' } )
    })
}