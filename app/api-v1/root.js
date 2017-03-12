const winston           = require('winston')
const chalk             = require('chalk')

var tokenCheck          = require('../api/middleware/TokenCheck')

module.exports = function( app, express ) {
  var r = new express.Router()

  r.get( '/', ( req, res ) => {
    res.send({
      rest: 'http://localhost:8080/api/v1',
      ws: 'ws://localhost:8080'
    })
  } )

  r.post( '/', tokenCheck, ( req, res ) => {
    res.send('say what?')
  })


  // STREAMS
  // create a new stream
  r.post( '/streams', tokenCheck, require( './core/CreateStream' ) )
  // get all streams for a specific user token
  r.get( '/streams', tokenCheck, require( './core/GetAllStreams' ) )
  // get a specific stream
  r.get( '/streams/:streamId', tokenCheck, require( './core/GetStream' ) )
  // create a new stream history (from live)
  r.post( '/streams/:streamId/history', tokenCheck, require( './core/AddToHistory' ))

  // HISTORY
  // get a specific history instance
  r.get( '/history/:historyId', tokenCheck, require( './core/GetHistory' ))
  // update a specific history instance
  r.put( '/history/:historyId', tokenCheck, (req, res) => {
    
  })

  // GEOMS
  // get the geometry of an object
  r.get( '/geometry/:geometryHash', ( req, res ) => {

  })

  app.use( '/api/v1', r )
}