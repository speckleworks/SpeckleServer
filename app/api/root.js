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
  // USERS // 
  // 
  r.get( '/profile', passport.authenticate( 'jwt-strict', { session: false } ), require( './accounts/UserGet' ) )

  // 
  // STREAMS //
  // 
  // create a new stream
  r.post( '/streams', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamPost' ) )
 
  // get all streams for a specific user token
  r.get( '/streams', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamGetAll' ) )
  
  // get stream
  r.get( '/streams/:streamId', passport.authenticate( [ 'jwt-strict', 'anonymous'], { session: false } ),  require( './core/StreamGet' ) )
  r.get( '/streams/meta/:streamId', passport.authenticate( [ 'jwt-strict', 'anonymous'], { session: false } ),  require( './core/StreamGetMeta' ) )
  // update a stream
  r.put( '/streams/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamPut' ) )
  // delete a stream
  r.delete( '/streams/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), ( req, res ) => res.send('TODO') )
  // duplicate a stream
  r.post( '/streams/duplicate/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamDuplicate' ) )
  
  //
  // OBJECTS //
  // 
  r.post( '/objects', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/ObjectsPost' ) ) 
  r.put( '/objects', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/ObjectsPut' ) ) 
  r.get( '/objects/:objectId', require( './core/ObjectGet' ) )
  r.post( '/objects/bulk', require( './core/ObjectsGetBulk' ) )
  // consider not allowing direct object deletion (to prevent abuse) - so only stream deletion can trigger object deletion.
  r.delete( '/object/:objectId', passport.authenticate( 'jwt-strict', { session: false } ), (req, res) => res.send('TODO') )

  // 
  // GEOMETRY //
  // 
  r.get( '/geometry/:hash', require( './core/GeometryGet' ) )
  // r.put( '/geometry/:hash', require( './core/GeometryGet' ) )
  // r.delete( '/geometry/:hash', require( './core/GeometryGet' ) )
  

  // // create / save stream cosmestics
  r.post( '/streams/visuals/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamCosmeticUpdate' ) )
  r.get( '/streams/visuals/:streamId', require( './core/StreamGetCosmetics' ) ) // untested

  // r.get( '/objects/:historyId/:index?', require( './query/SimpleObjectsQuery') )
  // // r.get( '/objects/:historyId/layer/:index?', require( './query/SimpleObjectsQuery') )

  // // COMMENTS
  // r.get( '/comments/:streamId', require( './core/CommentsGet' ) )
  // r.post( '/comments', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/CommentPost' ) )

  app.use( '/api', r )

  // ACCOUNTS
  var a = new express.Router()
  // create a new account
  a.post( '/register', require('./accounts/UserCreate') )
  // returns a jwt-strict token
  a.post( '/login', require('./accounts/UserLogin'))

  app.use( '/auth', a )
}
