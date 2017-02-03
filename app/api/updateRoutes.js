'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const shortId           = require('shortid')

var streamIdCheck       = require('./middleware/StreamIdCheck')
var tokenCheck          = require('./middleware/TokenCheck')
////////////////////////////////////////////////////////////////////////
/// this file will need some splitting up later on.               /////.
////////////////////////////////////////////////////////////////////////

module.exports = function( app, express, broadcaster ) {

  var routes = new express.Router()

  routes.post( '/handshake', tokenCheck, ( req, res ) => {
    res.send( { success: true, message: 'This server does exist, and you do seem to have an api token registered with it.'})
  })

  ////////////////////////////////////////////////////////////////////////
  /// setters below                                                 /////.
  ////////////////////////////////////////////////////////////////////////
  
  // creates a new stream
  routes.post( '/stream', tokenCheck, require( './core/CreateStream' ) )
  
  // updates (and broadcasts) stream live instance metadata
  routes.post( '/metadata', tokenCheck, streamIdCheck, require( './core/UpdateMetadata' ) )

  // updates (and broadcasts) stream live instance update
  routes.post( '/live', tokenCheck, streamIdCheck, require( './core/UpdateData' ) )

  // todo | saves (and broadcasts) the current liveStreamInstance to the stream history
  routes.post( '/history', tokenCheck, streamIdCheck, require( './core/UpdateHistory') )
  
  ////////////////////////////////////////////////////////////////////////
  /// getters below                                                 //////
  ////////////////////////////////////////////////////////////////////////

  // checks if a stream exists
  routes.get ( '/stream/exists', streamIdCheck, require( './core/GetStreamExistance' ) )

  // gets all streams for a specific user (by token)
  routes.get( '/streams', tokenCheck, require( './core/GetAllStreams' ) )

  // gets a stream, populating the liveInstance 
  routes.get( '/stream', streamIdCheck, require( './core/GetStream' ) )
  
  // possibly most heavily used call (yet simplest too)
  routes.get( '/object', require( './core/GetObject' ) )

  app.use( '/api', routes )
}