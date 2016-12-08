'use strict'

const winston           = require('winston')
const chalk             = require('chalk')
const shortId           = require('shortid')

const RadioTower        = require('../ws/RadioTower')

const DataStream        = require('../../models/DataStream')
const HistoryInstance   = require('../../models/HistoryInstance')
const User              = require('../../models/User')

////////////////////////////////////////////////////////////////////////
/// this file will need some splitting up later on.               /////.
////////////////////////////////////////////////////////////////////////

module.exports = function( app, express, broadcaster ) {

  var routes = new express.Router()

  routes.post( '/handshake', tokenCheck, ( req, res ) => {
    winston.debug( chalk.bgCyan( 'Identity check passed...' ) )
    res.send( { success: true, message: 'This server does exist, and you do seem to have an api token registered with it.'})
  })

  ////////////////////////////////////////////////////////////////////////
  /// setters below                                                 //////
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
  routes.post( '/metadata', tokenCheck, ( req, res ) => {
    winston.debug( chalk.bgCyan( 'Updating live history instance metadata (structure and or name).' ) )
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
      stream.name = req.body.streamName
      stream.save() 
      return HistoryInstance.findById( stream.liveInstance ) // TODO: exclude object field
    })
    .then( liveInstance => {
      if( !liveInstance ) throw new Error( 'No live instance found.' )
      liveInstance.name = req.body.streamName
      liveInstance.structure = req.body.parameters
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

  routes.post( '/live', tokenCheck, ( req, res ) => {
    winston.debug( chalk.bgCyan( 'Updating stream live history instance data.' ) )
    // Broadcast: to streamid, after db commit (don't take risks)

    res.send({ success: false, message: 'Not yet implemented.' }) 
  })

  routes.post( '/history', tokenCheck, ( req, res ) => { 
    winston.debug( chalk.bgCyan( 'Updating (adding one) stream history snapshots.') )
    // Broadcast: to streamid, before db commit (take risks)

    res.send({ success: false, message: 'Not yet implemented.' }) 
  })
  
  ////////////////////////////////////////////////////////////////////////
  /// getters below                                                 //////
  ////////////////////////////////////////////////////////////////////////

  routes.get( '/streams', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting *all* streams.' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })

  routes.get ( '/stream/exists', (req, res) => {
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

  routes.get( '/stream', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting stream.' ) )
    winston.debug(req.body.streamId, 'asdfasdfasdfasdfasdfasdfasdfasDF<£$!@£!@£!£!@£')
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })

  routes.get( '/metadata', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting metadata (structure, name) of history instance (live or history).' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })

  routes.get( '/history', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting stream history instance.' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })

  // possibly most heav ily used call, considering splitting into standalone app
  routes.get( '/object', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting object from store.' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })
  app.use( '/api', routes )
}

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