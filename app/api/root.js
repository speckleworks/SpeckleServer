const winston = require( 'winston' )
const chalk = require( 'chalk' )
const passport = require( 'passport' )

var tokenCheck = require( './middleware/TokenCheck' )
var serverDescription = require( '../../config' ).serverDescription

module.exports = function( app, express ) {
  var r = new express.Router( )

  // strict auth will return a 401 if no authorization header is present
  let strictAuth = passport.authenticate( 'jwt-strict', { session: false } )
  // relaxed auth allows for annonymous access to the endpoint, but permissions should be checked inside
  let relaxedAuth = passport.authenticate( [ 'jwt-strict', 'anonymous' ], { session: false } )

  r.get( '/', ( req, res ) => {
    res.send( serverDescription )
  } )

  //
  // ACCOUNTS
  // 
  // create a new account
  r.post( '/accounts/register', require( './core/accounts/UserCreate' ) )
  // returns a jwt-strict token
  r.post( '/accounts/login', require( './core/accounts/UserLogin' ) )
  // get profile
  r.get( '/accounts/profile', strictAuth, require( './core/accounts/UserGet' ) )
  // update profile
  r.put( '/accounts/profile', strictAuth, require( './core/accounts/UserPut' ) )
  // get all streams for a specific user token
  r.get( '/accounts/streams', strictAuth, require( './core/accounts/UserGetStreams' ) )
  // get all clients for a specific user token
  r.get( '/accounts/clients', strictAuth, require( './core/accounts/UserGetClients' ) )

  // 
  // CLIENTS //
  // 
  r.post( '/clients/', relaxedAuth, require( './core/clients/ClientCreate' ) )
  r.get( '/clients/:clientId', strictAuth, require( './core/clients/ClientGet' ) )
  r.put( '/clients/:clientId', strictAuth, require( './core/clients/ClientPut' ) )

  // 
  // STREAMS Core //
  // 
  // create a new stream
  r.post( '/streams', strictAuth, require( './core/streams/StreamPost' ) )
  // get stream
  r.get( '/streams/:streamId', relaxedAuth, require( './core/streams/StreamGet' ) )
  // update a stream (objects, layers, name)
  r.put( '/streams/:streamId', strictAuth, require( './core/streams/StreamPut' ) )
  // delete a stream
  r.delete( '/streams/:streamId', strictAuth, require( './core/streams/StreamDelete' ) )
  // duplicate a stream
  r.post( '/streams/:streamId/clone', strictAuth, require( './core/streams/StreamDuplicate' ) )

  // 
  // Stream NAME //
  // 
  // get stream name
  r.get( '/streams/:streamId/name', relaxedAuth, require( './core/streams/NameGet' ) )
  // update stream name
  r.post( '/streams/:streamId/name', relaxedAuth, require( './core/streams/NamePut' ) )

  // 
  // Stream LAYERS //
  // 

  // 1. Collection ops
  // Get stream layers
  r.get( '/streams/:streamId/layers', relaxedAuth, require( './core/streams/LayersGet' ) )
  // Add stream layers
  r.post( '/streams/:streamId/layers', relaxedAuth, require( './core/streams/LayersPost' ) )
  // Replace stream layers
  r.put( '/streams/:streamId/layers', relaxedAuth, require( './core/streams/LayersPut' ) )
  // Diff stream layers
  r.patch( '/streams/:streamId/layers', relaxedAuth, require( './core/streams/LayersPatch' ) )
  // Delete stream layers
  r.delete( '/streams/:streamId/layers', relaxedAuth, require( './core/streams/LayersDelete' ) )

  // 2. Individual ops
  r.get( '/streams/:streamId/layers/:layerId', relaxedAuth, require( './core/streams/LayerSingleGet' ) )
  // Replace stream layer
  r.put( '/streams/:streamId/layers/:layerId', relaxedAuth, require( './core/streams/LayerSinglePut' ) )
  // Update stream layer
  r.patch( '/streams/:streamId/layers/:layerId', relaxedAuth, require( './core/streams/LayerSinglePatch' ) )
  // Delete stream layer
  r.delete( '/streams/:streamId/layers/:layerId', relaxedAuth, require( './core/streams/LayerSingleDelete' ) )

  // 3. Layer object manipulations
  r.get( '/streams/:streamId/layers/:layerId/objects', relaxedAuth, require( './core/streams/layers/LayerGetObjects' ) ) 
  r.post( '/streams/:streamId/layers/:layerId/objects', relaxedAuth, require( './core/streams/layers/LayerPostObjects' ) ) // add
  r.put( '/streams/:streamId/layers/:layerId/objects', relaxedAuth, require( './core/streams/layers/LayerPutObjects' ) ) // replace
  r.delete( '/streams/:streamId/layers/:layerId/objects', relaxedAuth, ( rq, rs ) => { rs.send( 'todo' ) } )

  //
  // STREAM OBJECTS //
  // 

  // 1. Collection ops
  // Get stream objects
  r.get( '/streams/:streamId/objects', relaxedAuth, require( './core/streams/ObjectsGet' ) )
  // Add stream objects
  r.post( '/streams/:streamId/objects', relaxedAuth, require( './core/streams/ObjectsPost' ) )
  // Replace stream objects
  r.put( '/streams/:streamId/objects', relaxedAuth, require( './core/streams/ObjectsPut' ) )
  // Delete stream object list
  r.delete( '/streams/:streamId/objects', relaxedAuth, require( './core/streams/ObjectsDelete' ) )

  // 2.Individual ops
  // 
  // Delete an object from a stream list
  r.delete( '/streams/:streamId/objects/:objectId', relaxedAuth, require( './core/streams/ObjectDelete' ) )

  //
  // OBJECTS //
  // These routes are for hackers. Creating objects outside streams is discouraged.
  // 
  // Create an object
  r.post( '/objects', strictAuth, require( './core/objects/ObjectPost' ) )
  // Create many objects
  r.post( '/objects/bulk', strictAuth, require( './core/objects/ObjectPostBulk' ) )
  // Get an object
  r.get( '/objects/:objectId', require( './core/objects/ObjectGet' ) )
  // update one
  r.put( '/objects/:objectId', strictAuth, require( './core/objects/ObjectPut' ) )
  // delete one
  r.delete( '/objects/:objectId', strictAuth, require( './core/objects/ObjectDelete' ) )


  // COMMENTS
  // r.get( '/comments/:streamId', require( './core/CommentsGet' ) )
  // r.post( '/comments', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/CommentPost' ) )

  app.use( '/api', r )
}