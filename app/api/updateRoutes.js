var winston           = require('winston')
var chalk             = require('chalk')
var shortId           = require('shortid')

var RadioTower        = require('../ws/RadioTower')

var DataStream        = require('../../models/DataStream')
var HistoryInstance   = require('../../models/HistoryInstance')
var User              = require('../../models/User')



module.exports = function( app, express, broadcaster ) {

  var routes = new express.Router()

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

    RadioTower.broadcast( req.body.streamId, { eventName: 'metadata-update', data: req.body.data }, req.body.sessionId )

    DataStream.findOne( { streamId: req.body.streamId })
    .then( stream => { 
      if( !stream || !stream.liveInstance ) throw new Error( 'Stream not found or malformed.' )
      stream.name = req.body.data.streamName
      stream.save() 
      return HistoryInstance.findById( stream.liveInstance ) // TODO: exclude object field
    })
    .then( liveInstance => {
      if( !liveInstance ) throw new Error( 'No live instance found.' )
      liveInstance.name = req.body.data.streamName
      liveInstance.structure = req.body.data.parameters
      liveInstance.controllers = req.body.data.controllers
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
  
  /// getters below
  routes.get( '/streams', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting *all* streams.' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })

  routes.get( '/stream', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting stream.' ) )
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

  // possibly most heavily used call, considering splitting into standalone app
  routes.get( '/object', ( req, res ) => {
    winston.debug( chalk.bgGreen( 'Getting object from store.' ) )
    res.send({ success: false, message: 'Not yet implemented.' }) 
  })
  app.use( '/api', routes )
}

function tokenCheck( req, res, next ) { 
  if( !req.body.token ) {
    winston.debug( chalk.bgRed( 'No token provided.' ) )
    return res.send( { success: false, message:'No token provided.' } )
  }
  winston.debug( chalk.blue.underline('token check: ' + req.body.token ))
  
  // TODO properly
  if( req.body.token === 'asdf' ) { 
    req.user = {
      name: 'dimitrie',
      _id: '58402bb3cb1fd1cab2ff6c5f'
    }
    next() 
  }
  else {
    winston.debug( chalk.bgRed( 'token check failed: ' + req.body.token ) )
    return res.send( { success: false, message:'Token check failed.' } ) 
  }  
}