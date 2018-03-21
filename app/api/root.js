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

  //
  // ACCOUNTS & USERS
  // 
  
  
  // create a new account
  r.post( '/accounts/register', require( './core/accounts/UserCreate' ) )
  
  // login
  r.post( '/accounts/login', require( './core/accounts/UserLogin' ) )
  
  // get profile
  r.get( '/accounts/profile', mandatoryAuthorisation, require( './core/accounts/UserGet' ) )
  
  // update profile 
  r.put( '/accounts/profile', mandatoryAuthorisation, require( './core/accounts/UserPut' ) )
  r.patch( '/accounts/profile', mandatoryAuthorisation, require( './core/accounts/UserPut' ) )
  
  // get all streams for a specific user token
  r.get( '/accounts/streams', mandatoryAuthorisation, require( './core/accounts/UserGetStreams' ) )
  
  // get all clients for a specific user token
  r.get( '/accounts/clients', mandatoryAuthorisation, require( './core/accounts/UserGetClients' ) )
  
  // get display profile  
  r.get( '/accounts/:userId', mandatoryAuthorisation, require( './core/accounts/UserProfile' ) )
  
  // search profiles by email (restrict to 10)
  r.post( '/accounts/search', mandatoryAuthorisation, require( './core/accounts/UserSearch' ) )


  // 
  // CLIENTS
  // 

  
  // create a new client
  r.post( '/clients/', optionalAuthorisation, require( './core/clients/ClientPost' ) )
  
  // get a client
  r.get( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientGet' ) )
  
  // update a client
  r.patch( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientPatch' ) )
  r.put( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientPatch' ) )
  
  // delete a client
  r.delete( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientDelete' ) )
  
  // 
  // STREAMS 
  // 

  // create a new stream 
  r.post( '/streams', mandatoryAuthorisation, require( './core/streams/StreamPost' ) )

  // get stream / perm check 'read'
  r.get( '/streams/:streamId', optionalAuthorisation, require( './core/streams/StreamGet' ) )

  // update a stream / perm check 'write'
  r.put( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamPut' ) )

  // patch a stream / perm check 'write'
  r.patch( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamPatch' ) )

  // delete a stream / perm check 'delete'
  r.delete( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamDelete' ) )

  // duplicate a stream / perm check 'read'
  r.post( '/streams/:streamId/clone', mandatoryAuthorisation, require( './core/streams/StreamDuplicate' ) )

  // diff a stream against another / perm check 'read' / perm check 'read'
  r.get( '/streams/:streamId/diff/:otherId', optionalAuthorisation, require( './core/streams/StreamDiff' ) )

  // Get stream objects / perm check 'read' 
  r.get( '/streams/:streamId/objects', optionalAuthorisation, require( './core/streams/StreamObjectsGet' ) )


  //
  // OBJECTS 
  // 
  
  // Create an object
  r.post( '/objects', mandatoryAuthorisation, require( './core/objects/ObjectPost' ) )
  // Create many objects
  r.post( '/objects/bulk', mandatoryAuthorisation, require( './core/objects/ObjectPostBulk' ) )
  // Get an object / perm check 'read'
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

  // 
  // DEPRECATED 
  // 
  // get stream name, should be replaced by allowing queries in GET  /stream/:streamId
  r.get( '/streams/:streamId/name', optionalAuthorisation, ( req, res, next ) => { req.query = { fields: 'name' }; next( ); }, require( './core/streams/StreamGet' ) )
  // update stream name, replaced by patch
  r.put( '/streams/:streamId/name', mandatoryAuthorisation, require( './core/streams/StreamPatch' ) )
  // Replace stream layers, method still used by the gh client
  r.put( '/streams/:streamId/layers', mandatoryAuthorisation, require( './core/streams/StreamPatch' ) )
  // Get stream layers, replaced with GET /api/streams/:streamId?fields=layers
  r.get( '/streams/:streamId/layers', optionalAuthorisation, require( './core/streams/LayersGet' ) )

  // generate routes
  let routes = [ ]
  r.stack.forEach( ( middleware ) => {
    if ( middleware.route )
      routes.push( Object.keys( middleware.route.methods ).map( m => m.toUpperCase( ) ) + '\t\t /api' + middleware.route.path )
  } )

  r.get( '/', ( req, res ) => {
    res.send( routes )
  } )

  // mount all these routes up
  app.use( '/api', r )
}