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
  r.post( '/clients/', strictAuth, require( './core/clients/ClientCreate' ) )
  r.get( '/clients/:clientId', strictAuth, require( './core/clients/ClientGet' ) )
  r.put( '/clients/:clientId', strictAuth, require( './core/clients/ClientPut' ) )

  // 
  // STREAMS //
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
  r.post( '/streams/:streamId/duplicate', strictAuth, require( './core/streams/StreamDuplicate' ) )

  // get stream layers
  r.get( '/streams/:streamId/layers', relaxedAuth, require( './core/streams/StreamGetLayers' ) )
  // update stream layers ( can be updated anonymously if stream's not private)
  r.put( '/streams/:streamId/layers', relaxedAuth, require( './core/streams/StreamPutLayers' ) )
  // todo: update stream layer
  r.put( '/streams/:streamId/layers/:layerId', relaxedAuth, ( req, res ) => { res.send( 'TODO' ) } )

  // get stream name
  r.get( '/streams/:streamId/name', relaxedAuth, require( './core/streams/StreamGetName' ) )
  // update stream name ( can be updated anonymously if stream's not private)
  r.put( '/streams/:streamId/name', relaxedAuth, require( './core/streams/StreamPutName' ) )

  // get stream object ids,layers and name
  r.get( '/streams/:streamId/meta', relaxedAuth, require( './core/streams/StreamGetMeta' ) )
  // update stream layers and name
  r.put( '/streams/:streamId/meta', relaxedAuth, require( './core/streams/StreamPutMeta' ) )

  //
  // OBJECTS //
  // 

  // create one 
  r.post( '/objects', strictAuth, require( './core/objects/ObjectPost' ) )
  // get one
  r.get( '/objects/:objectId', require( './core/objects/ObjectGet' ) )
  // update one
  r.put( '/objects/:objectId', require( './core/objects/ObjectPut' ) )
  // delete one
  r.delete( '/objects/:objectId', require( './core/objects/ObjectDelete' ) )
  // create many
  r.post( '/witharray/objects', strictAuth, require( './core/objects/ObjectsPostMany' ) )
  // get many
  r.put( '/witharray/objects', require( './core/objects/ObjectsGetMany' ) )

  // 
  // GEOMETRY //
  // 
  r.get( '/geometry/:hash', require( './core/objects/GeometryGet' ) )

  // // COMMENTS
  // r.get( '/comments/:streamId', require( './core/CommentsGet' ) )
  // r.post( '/comments', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/CommentPost' ) )

  app.use( '/api', r )
}