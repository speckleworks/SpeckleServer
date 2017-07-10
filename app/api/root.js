const winston           = require( 'winston' )
const chalk             = require( 'chalk' )
const passport          = require( 'passport' )

var tokenCheck          = require( './middleware/TokenCheck' )
var serverDescription   = require( '../../config' ).serverDescription

module.exports = function( app, express ) {
  var r = new express.Router()

  r.get( '/', ( req, res ) => {
    res.send( serverDescription )
  } )

  //
  // ACCOUNTS
  // 
  // create a new account
  r.post( '/accounts/register', require('./core/accounts/UserCreate') )
  // returns a jwt-strict token
  r.post( '/accounts/login', require('./core/accounts/UserLogin'))
  // get profile
  r.get( '/accounts/profile', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/accounts/UserGet' ) )
  // get all streams for a specific user token
  r.get( '/accounts/streams', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/accounts/UserGetStreams' ) )

  // 
  // STREAMS //
  // 
  // create a new stream
  r.post( '/streams', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/streams/StreamPost' ) )
 
  
  
  // get stream
  r.get( '/streams/:streamId', passport.authenticate( [ 'jwt-strict', 'anonymous'], { session: false } ),  require( './core/streams/StreamGet' ) )
  r.get( '/streams/meta/:streamId', passport.authenticate( [ 'jwt-strict', 'anonymous'], { session: false } ),  require( './core/streams/StreamGetMeta' ) )
  // update a stream
  r.put( '/streams/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/streams/StreamPut' ) )
  // delete a stream
  r.delete( '/streams/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), ( req, res ) => res.send('TODO') )
  // duplicate a stream
  r.post( '/streams/duplicate/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/streams/StreamDuplicate' ) )
  
  //
  // OBJECTS //
  // 
  r.post( '/objects', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/objects/ObjectsPost' ) ) 
  r.put( '/objects', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/objects/ObjectsPut' ) ) 
  r.get( '/objects/:objectId', require( './core/objects/ObjectGet' ) )
  r.post( '/objects/bulk', require( './core/objects/ObjectsGetBulk' ) )
  // consider not allowing direct object deletion (to prevent abuse) - so only stream deletion can trigger object deletion.
  r.delete( '/object/objects/:objectId', passport.authenticate( 'jwt-strict', { session: false } ), (req, res) => res.send('TODO') )

  // 
  // GEOMETRY //
  // 
  r.get( '/geometry/:hash', require( './core/objects/GeometryGet' ) )
  // r.put( '/geometry/:hash', require( './core/GeometryGet' ) )
  // r.delete( '/geometry/:hash', require( './core/GeometryGet' ) )

  // // COMMENTS
  // r.get( '/comments/:streamId', require( './core/CommentsGet' ) )
  // r.post( '/comments', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/CommentPost' ) )

  app.use( '/api', r )
}
