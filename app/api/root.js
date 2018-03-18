const winston = require( 'winston' )
const chalk = require( 'chalk' )
const passport = require( 'passport' )

var tokenCheck = require( './middleware/TokenCheck' )
var serverDescription = require( '../../config' ).serverDescription

module.exports = function( app, express ) {
  var r = new express.Router( )

  // strict auth will return a 401 if no authorization header is present. pass means req.user exists
  let mandatoryAuthorisation = passport.authenticate( 'jwt-strict', { session: false } )
  // relaxed auth allows for annonymous access to the endpoint, but permissions should be checked inside. pass doesn't guarantee req.user
  let optionalAuthorisation = passport.authenticate( [ 'jwt-strict', 'anonymous' ], { session: false } )

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
  r.get( '/accounts/profile', mandatoryAuthorisation, require( './core/accounts/UserGet' ) )
  // update profile
  r.put( '/accounts/profile', mandatoryAuthorisation, require( './core/accounts/UserPut' ) )
  // get all streams for a specific user token
  r.get( '/accounts/streams', mandatoryAuthorisation, require( './core/accounts/UserGetStreams' ) )
  // get all clients for a specific user token
  r.get( '/accounts/clients', mandatoryAuthorisation, require( './core/accounts/UserGetClients' ) )

  // get display profile  
  r.get( '/accounts/:userId', mandatoryAuthorisation, require( './core/accounts/UserProfile' ) )
  // search profiles by email (restrict to 10)
  r.post( '/accounts/search', mandatoryAuthorisation, require( './core/accounts/UserSearch' ) )


  // 
  // CLIENTS //
  // 
  r.post( '/clients/', optionalAuthorisation, require( './core/clients/ClientCreate' ) )
  r.get( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientGet' ) )
  r.put( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientPut' ) )

  // 
  // STREAMS Core //
  // 
  // create a new stream 
  r.post( '/streams', mandatoryAuthorisation, require( './core/streams/StreamPost' ) )
  // get stream / perm check 'read'
  r.get( '/streams/:streamId', optionalAuthorisation, require( './core/streams/StreamGet' ) )
  // update a stream / perm check 'write'
  r.put( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamPut' ) )
  // patch a stream / perm check 'write'
  r.patch( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamPatch' ) )
  
  // delete a stream
  r.delete( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamDelete' ) )

  // Special stuff:
  // duplicate a stream / perm check 'read'
  r.post( '/streams/:streamId/clone', mandatoryAuthorisation, require( './core/streams/StreamDuplicate' ) )
  // diff a stream against another / perm check 'read' / perm check 'read'
  r.get( '/streams/:streamId/diff/:otherId', optionalAuthorisation, require( './core/streams/StreamDiff' ) )

  // 
  // Stream NAME //
  // 
  // get stream name
  // TODO: deprecate, replaced by patch, perm chec
  r.get( '/streams/:streamId/name', optionalAuthorisation, require( './core/streams/NameGet' ) )
  // update stream name, replaced by patch
  r.put( '/streams/:streamId/name', mandatoryAuthorisation, require( './core/streams/NamePut' ) )

  // 
  // Stream LAYERS //
  // 

  // 1. Collection ops
  // Get stream layers
  r.get( '/streams/:streamId/layers', optionalAuthorisation, require( './core/streams/LayersGet' ) )
  // Add stream layers
  r.post( '/streams/:streamId/layers', optionalAuthorisation, require( './core/streams/LayersPost' ) )
  // Replace stream layers
  r.put( '/streams/:streamId/layers', optionalAuthorisation, require( './core/streams/LayersPut' ) )
  // Diff stream layers
  r.patch( '/streams/:streamId/layers', optionalAuthorisation, require( './core/streams/LayersPatch' ) )
  // Delete stream layers
  r.delete( '/streams/:streamId/layers', optionalAuthorisation, require( './core/streams/LayersDelete' ) )

  // 2. Individual ops
  r.get( '/streams/:streamId/layers/:layerId', optionalAuthorisation, require( './core/streams/LayerSingleGet' ) )
  // Replace stream layer
  r.put( '/streams/:streamId/layers/:layerId', optionalAuthorisation, require( './core/streams/LayerSinglePut' ) )
  // Update stream layer
  r.patch( '/streams/:streamId/layers/:layerId', optionalAuthorisation, require( './core/streams/LayerSinglePatch' ) )
  // Delete stream layer
  r.delete( '/streams/:streamId/layers/:layerId', optionalAuthorisation, require( './core/streams/LayerSingleDelete' ) )

  // 3. Layer object manipulations
  r.get( '/streams/:streamId/layers/:layerId/objects', optionalAuthorisation, require( './core/streams/layers/LayerGetObjects' ) )
  r.post( '/streams/:streamId/layers/:layerId/objects', optionalAuthorisation, require( './core/streams/layers/LayerPostObjects' ) ) // add
  r.put( '/streams/:streamId/layers/:layerId/objects', optionalAuthorisation, require( './core/streams/layers/LayerPutObjects' ) ) // replace
  r.delete( '/streams/:streamId/layers/:layerId/objects', optionalAuthorisation, require( './core/streams/layers/LayerDeleteObjects' ) )

  //
  // STREAM OBJECTS //
  // 

  // 1. Collection ops
  // Get stream objects
  r.get( '/streams/:streamId/objects', optionalAuthorisation, require( './core/streams/ObjectsGet' ) )
  // Add stream objects
  r.post( '/streams/:streamId/objects', mandatoryAuthorisation, require( './core/streams/ObjectsPost' ) )
  // Replace stream objects
  r.put( '/streams/:streamId/objects', mandatoryAuthorisation, require( './core/streams/ObjectsPut' ) )
  // Delete stream object list
  r.delete( '/streams/:streamId/objects', mandatoryAuthorisation, require( './core/streams/ObjectsDelete' ) )

  // 2.Individual ops
  // 
  // Delete an object from a stream list
  r.delete( '/streams/:streamId/objects/:objectId', mandatoryAuthorisation, require( './core/streams/ObjectDelete' ) )

  //
  // OBJECTS //
  // These routes are for hackers. Creating objects outside streams is discouraged.
  // 
  // Create an object
  r.post( '/objects', mandatoryAuthorisation, require( './core/objects/ObjectPost' ) )
  // Create many objects
  r.post( '/objects/bulk', mandatoryAuthorisation, require( './core/objects/ObjectPostBulk' ) )
  // Get an object
  r.get( '/objects/:objectId', optionalAuthorisation, require( './core/objects/ObjectGet' ) )
  // Get more objects
  r.post( '/objects/getbulk/', optionalAuthorisation, require( './core/objects/ObjectsGetBulk' ) )
  // update one
  r.put( '/objects/:objectId', mandatoryAuthorisation, require( './core/objects/ObjectPut' ) )
  // delete one
  r.delete( '/objects/:objectId', mandatoryAuthorisation, require( './core/objects/ObjectDelete' ) )


  // TODO: Comment system (once auth is revamped)
  // r.get( '/comments/:streamId', optionalAuthorisation, require( './core/comments/CommentsGet' ) )
  // r.post( '/comments/:streamId', optionalAuthorisation, require( './core/comments/CommentPost' ) )
  // r.put( '/comments/:commentId', mandatoryAuthorisation, require( './core/comments/CommentPut' ) )
  // r.delete( '/comments/:commentId', mandatoryAuthorisation, require( './core/comments/CommentPut' ) )

  app.use( '/api', r )
}