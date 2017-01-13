'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const shortId           = require('shortid')

const RadioTower        = require('../ws/RadioTower')

const DataStream        = require('../../models/DataStream')
const HistoryInstance   = require('../../models/HistoryInstance')
const DataObject        = require('../../models/DataObject')
const User              = require('../../models/User')

// const nonHashedTypes    = 'Number Point Vector Boolean String Line Plane'
const nonHashedTypes       = [ '404', 'Number', 'Boolean', 'String', 'Point', 'Vector', 'Line']

////////////////////////////////////////////////////////////////////////
/// this file will need some splitting up later on.               /////.
////////////////////////////////////////////////////////////////////////

module.exports = function( app, express, broadcaster ) {

  var routes = new express.Router()

  routes.post( '/handshake', tokenCheck, ( req, res ) => {
    winston.debug( chalk.black.bgCyan( 'Identity check passed...' ) )
    res.send( { success: true, message: 'This server does exist, and you do seem to have an api token registered with it.'})
  })

  ////////////////////////////////////////////////////////////////////////
  /// setters below                                                 /////.
  ////////////////////////////////////////////////////////////////////////
  
  // Role: Creates a new stream & sends the short id back
  routes.post( '/stream', tokenCheck, ( req, res ) => {
    winston.debug( chalk.bgCyan( 'Creating a new stream, sending streamid back.' ) )

    var liveInstance = new HistoryInstance({ name: 'Anonymous Stream Live Instance'})
    liveInstance.save() 
    .then( instance => {
      var myStream = new DataStream( {
        owner: req.user._id,
        streamId: shortId.generate(),
        liveInstance: instance._id
      } )
      return myStream.save()
    })
    .then( stream => {
      return res.send( { success: true, streamId: stream.streamId, message: 'Sucessfully created new stream.' } )
    })
    .catch( err => {
      return res.send( { success: false, message: 'Failed to create stream.'} )
    })
  })

  // Role: Updates stream name and metadata for live history instance of stream & emits metadata update event to room
  routes.post( '/metadata', tokenCheck, streamIdCheck, ( req, res ) => {
    winston.debug( chalk.red( 'Updating live history instance metadata (structure and or name).' ) )
    let streamId = req.get( 'speckle-stream-id' )
    let wsId = req.get( 'speckle-ws-id' )
    
    if( !streamId )
      return winston.error( 'No stream id specified, db update & live event stopped.' )
    if( wsId )
      RadioTower.broadcast( streamId, { eventName: 'metadata-update', args: req.body }, wsId )
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
      liveInstance.structure = req.body.structure
      liveInstance.controllers = req.body.controllers
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
  })

  // Role: Updates stream everything.
  routes.post( '/live', tokenCheck, streamIdCheck, ( req, res ) => {
    winston.debug( chalk.red( 'Updating stream live history instance data.' ) )
    let streamId = req.get( 'speckle-stream-id' )
    let wsId = req.get( 'speckle-ws-id' )

    let toInsertInDb = []
    req.body.objects.forEach( obj => {
      if( obj.hasOwnProperty('value') && nonHashedTypes.indexOf( obj.type ) < 0 )
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
        liveInstance.name = req.body.metaData.streamName
        liveInstance.structure = req.body.metaData.structure
        liveInstance.objects = [] // set up fresh
        req.body.objects.forEach( obj => {
          liveInstance.objects.push( nonHashedTypes.indexOf( obj.type ) < 0 ? { type: obj.type, hash: obj.hash } : obj ) 
        } )

        wsArgs.liveInstance = liveInstance
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
          winston.debug('Got a dupe or more in db. Carry on, all is well.')
          RadioTower.broadcast( streamId, { eventName: 'live-update', args: wsArgs }, wsId )
          return res.send( { success: true, message: 'Some dupe objects in db were not saved, but all should be ok. '})
        }
        winston.error( err )
        return res.send( { success: false, message: 'Something went wrong when updating stream live instance.' } )
      })
  })

  // Role: Saves the current live instance of the stream as a historical Instance. 
  routes.post( '/history', tokenCheck, streamIdCheck, ( req, res ) => { 
    winston.debug( chalk.bgCyan( 'Updating (adding one) stream history snapshots.') )
    // Note: this should just duplicate the existing live instance. that's kind-of it.
    // Broadcast: to streamid, before db commit (take risks)
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })
  
  ////////////////////////////////////////////////////////////////////////
  /// getters below                                                 //////
  ////////////////////////////////////////////////////////////////////////

  routes.get ( '/stream/exists', streamIdCheck, (req, res) => {
    let streamId = req.get( 'speckle-stream-id' )
    winston.debug( chalk.white.underline( 'Checking if stream exists', streamId ) )
    DataStream.count( { streamId: streamId } )
    .then( count => {
      if( count > 0 )
        res.send( { found: true } )
      else 
        res.send( { found: false } )
    } )
    .catch( err => {
      res.send( { found: false } )
    })
  })

  routes.get( '/streams', tokenCheck, ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting *all* streams for user ', req.user._id ) )
    DataStream.find( { owner: req.user._id } )
      .then( streams => { 
        res.send( { success: true, message:'Stream list for user ' + req.user._id, streams: streams })
      })
      .catch( err => {
        winston.error( 'Could not retrieve stream list for', req.user._id )
        res.send( { success: false, message: 'Something failed.'} )
      })
  })

  routes.get( '/stream', streamIdCheck, ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting stream', req.get('speckle-stream-id') ) )
    DataStream.findOne( {streamId: req.streamId }, '-owner -sharedWith' ).populate('liveInstance')
      .then( stream => {
        if( !stream ) throw new Error( 'No stream found' )
        res.send( { success: true, message: 'Stream found', stream: stream } )
      })
      .catch( err => {
        res.send( { success: false, message: 'Error finding stream.' } )
      })  
  })

  routes.get( '/metadata', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting metadata (structure, name) of history instance (live or history).' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })

  routes.get( '/live', streamIdCheck, ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting live stream', req.streamId ) )
    DataStream.findOne( { streamId: req.streamId }, '-owner -sharedWith' ).populate( 'liveInstance' )
      .then( stream => {
        if( !stream ) throw new Error( 'Stream not found/ is null. ')
          res.send( stream )
       }) 
      .catch( err => { 
        winston.error( err )
        res.send( { success: false, message: 'something went wrong. could not find stream. ' } )
      } )
  })

  routes.get( '/history', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting stream history instance.' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })
  
  // possibly most heavily used call (yet simplest too), considering splitting into standalone app?
  routes.get( '/object', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting object from store.' ), req.query.hash )
    DataObject.findOne( { hash: req.query.hash } )
      .then( obj => {
        if( !obj ) return res.send( { success: false, message: 'Failed to find object.' } )
        return res.send( { success: true, obj: obj })
      })
      .catch( err => {
        return res.send( { success: false, message: 'Failed to find object.', objectHash: req.query.hash } )
      })
  })

  routes.get( '/object/encoded', (req, res) => {
    // returns the encoded value of the object
  })

  routes.get( '/object/speckle', (req, res) => {
    // returns the speckle value (value) of the object
  })

  routes.get( '/objects', ( req, res ) => { 
    winston.debug( chalk.bgGreen( 'Getting A LOTTA objects from store.') )
  })  


  app.use( '/api', routes )
}

////////////////////////////////////////////////////////////////////////
/// middlewarelow                                                 /////.
////////////////////////////////////////////////////////////////////////

// checks if a user exists with the token in the header, and adds him to the request
function tokenCheck( req, res, next ) { 
  let token = req.get('speckle-token')
  if( !token ) {
    winston.debug( chalk.bgRed( 'No token provided.' ) )
    return res.send( { success: false, message:'No token provided.' } )
  }
  winston.debug( chalk.blue.underline('token check: ' + token ))
  
  // TODO properly
  if( token === 'asdf' ) { 
    req.user = {
      name: 'dimitrie',
      _id: '58402bb3cb1fd1cab2ff6c5f'
    }
    next() 
  }
  else {
    winston.debug( chalk.bgRed( 'token check failed: ' + token ) )
    return res.send( { success: false, message:'Token check failed.' } ) 
  }  
}

// just checks if there's a streamId in the headers of the request.
function streamIdCheck( req, res, next ) {
  let streamId = req.get( 'speckle-stream-id' )
  if( !streamId ) {
    winston.debug( chalk.bgRed( 'No streamId provided. This route requires a streamId to work.' ) )
    return res.send( {success: false, message: 'No streamId provided. Did you set up your headers right?' } )
  }
  req.streamId = streamId
  next()
}
