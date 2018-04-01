const winston = require( 'winston' )
const chalk = require( 'chalk' )
const passport = require( 'passport' )

var tokenCheck = require( './middleware/TokenCheck' )
var serverDescription = require( '../../../config' ).serverDescription

module.exports = function( app, express, urlRoot ) {
  var r = new express.Router( )

  // strict auth will return a 401 if no authorization header is present. pass means req.user exists
  let mandatoryAuthorisation = passport.authenticate( 'jwt-strict', { session: false } )
  // relaxed auth allows for annonymous access to the endpoint, but permissions should be checked inside. pass doesn't guarantee req.user
  let optionalAuthorisation = passport.authenticate( [ 'jwt-strict', 'anonymous' ], { session: false } )

  //
  // ACCOUNTS 
  // 
  // create a new account
  r.post( '/accounts/register', require( './accounts/UserCreate' ) )
  // returns a jwt-strict token
  r.post( '/accounts/login', require( './accounts/UserLogin' ) )

  // get profile
  r.get( '/accounts/profile', mandatoryAuthorisation, require( './accounts/UserGet' ) )
  // update profile
  r.put( '/accounts/profile', mandatoryAuthorisation, require( './accounts/UserPut' ) )
  // todo: r.patch(profile)
  // get all streams for a specific user token
  r.get( '/accounts/streams', mandatoryAuthorisation, require( './accounts/UserGetStreams' ) )
  // get all clients for a specific user token
  r.get( '/accounts/clients', mandatoryAuthorisation, require( './accounts/UserGetClients' ) )

  // get display profile  
  r.get( '/accounts/:userId', mandatoryAuthorisation, require( './accounts/UserProfile' ) )
  // search profiles by email (restrict to 10)
  r.post( '/accounts/search', mandatoryAuthorisation, require( './accounts/UserSearch' ) )


  // 
  // CLIENTS //
  // 
  r.post( '/clients/', optionalAuthorisation, require( './clients/ClientCreate' ) )
  r.get( '/clients/:clientId', mandatoryAuthorisation, require( './clients/ClientGet' ) )
  r.put( '/clients/:clientId', mandatoryAuthorisation, require( './clients/ClientPut' ) )
  // todo: r.patch(client)

  // 
  // STREAMS v0 //
  // 
  // create a new stream 
  r.post( '/streams', mandatoryAuthorisation, require( './streams/StreamPost' ) )
  // get stream / perm check 'read'
  r.get( '/streams/:streamId', optionalAuthorisation, require( './streams/StreamGet' ) )
  // update a stream / perm check 'write'
  r.put( '/streams/:streamId', mandatoryAuthorisation, require( './streams/StreamPut' ) )
  // patch a stream / perm check 'write'
  r.patch( '/streams/:streamId', mandatoryAuthorisation, require( './streams/StreamPatch' ) )
  // delete a stream / perm check 'delete'
  r.delete( '/streams/:streamId', mandatoryAuthorisation, require( './streams/StreamDelete' ) )
  // duplicate a stream / perm check 'read'
  r.post( '/streams/:streamId/clone', mandatoryAuthorisation, require( './streams/StreamDuplicate' ) )
  // diff a stream against another / perm check 'read' / perm check 'read'
  r.get( '/streams/:streamId/diff/:otherId', optionalAuthorisation, require( './streams/StreamDiff' ) )

  //
  // STREAM OBJECTS //
  // 
  // 1. Collection ops
  // Get stream objects
  r.get( '/streams/:streamId/objects', optionalAuthorisation, require( './streams/ObjectsGet' ) )
  // Add stream objects
  r.post( '/streams/:streamId/objects', mandatoryAuthorisation, require( './streams/ObjectsPost' ) )
  // Replace stream objects
  r.put( '/streams/:streamId/objects', mandatoryAuthorisation, require( './streams/ObjectsPut' ) )
  // Delete stream object list
  r.delete( '/streams/:streamId/objects', mandatoryAuthorisation, require( './streams/ObjectsDelete' ) )

  //
  // OBJECTS //
  // These routes are for creating objects.
  // 
  // Create an object
  r.post( '/objects', mandatoryAuthorisation, require( './objects/ObjectPost' ) )
  // Create many objects
  r.post( '/objects/bulk', mandatoryAuthorisation, require( './objects/ObjectPostBulk' ) )
  // Get an object
  r.get( '/objects/:objectId', optionalAuthorisation, require( './objects/ObjectGet' ) )
  // Get more objects
  r.post( '/objects/getbulk/', optionalAuthorisation, require( './objects/ObjectsGetBulk' ) )
  // update one
  r.put( '/objects/:objectId', mandatoryAuthorisation, require( './objects/ObjectPut' ) )
  // delete one
  r.delete( '/objects/:objectId', mandatoryAuthorisation, require( './objects/ObjectDelete' ) )

  // 
  // DEPRECATED //
  // 
  // get stream name, should be replaced by allowing queries in GET  /stream/:streamId
  r.get( '/streams/:streamId/name', optionalAuthorisation, require( './streams/NameGet' ) )
  // update stream name, replaced by patch
  r.put( '/streams/:streamId/name', mandatoryAuthorisation, require( './streams/NamePut' ) )
  // Replace stream layers, method still used by the gh client
  r.put( '/streams/:streamId/layers', mandatoryAuthorisation, require( './streams/LayersPut' ) )


  // generate routes doc
  let routes = [ ]
  let count = 1
  r.stack.forEach( ( middleware ) => {
    if ( middleware.route )
      routes.push( Object.keys( middleware.route.methods ).map( m => m.toUpperCase( ) ) + ': /api' + middleware.route.path )
  } )

  r.get( '/', ( req, res ) => {
    serverDescription.routes = routes
    serverDescription.version = '0.x.x'
    res.json( serverDescription )
  } )

  // mount all these routes up
  app.use( urlRoot, r )
}