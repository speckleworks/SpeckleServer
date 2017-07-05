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
  r.post( '/streams', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamCreate' ) )
  
  // get all streams for a specific user token
  r.get( '/streams', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamGetAll' ) )
  
  // get stream
  r.get( '/streams/:streamId', passport.authenticate( [ 'jwt-strict', 'anonymous'], { session: false } ),  require( './core/StreamGet' ) )
  r.get( '/streams/meta/:streamId', passport.authenticate( [ 'jwt-strict', 'anonymous'], { session: false } ),  require( './core/StreamGetMeta' ) )
  // update a stream
  r.put( '/streams/:streamId', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamPut' ) )
  //r.delete( '/streams/:streamId', TODO )

  //
  // OBJECTS //
  // 
  r.post( '/objects', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/ObjectsPost' ) ) 
  r.put( '/objects', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/ObjectsPut' ) ) 
  r.get( '/objects/:objectId', require( './core/ObjectGet' ) )
  r.post( '/objects/bulk', require( './core/ObjectsGetBulk' ) )
  //r.delete( '/object/:objectId', require( 'TODO' ) )

  // 
  // GEOMETRY //
  // 
  r.get( '/geometry/:hash', require( './core/GeometryGet' ) )
  // r.put( '/geometry/:hash', require( './core/GeometryGet' ) )
  // r.delete( '/geometry/:hash', require( './core/GeometryGet' ) )
  

  // // create / save stream cosmestics
  // r.post( '/streams/:streamId/visuals', passport.authenticate( 'jwt-strict', { session: false } ), require( './core/StreamCosmeticUpdate' ) )
  // r.get( '/streams/:streamId/cosmetics', require( './core/StreamGetCosmetics' ) ) // untested
  // // UPDATES
  // // update stream history instance; defaults to live if not provided (broadcasts)
  // r.put( '/streams/:streamId/data/:historyId?', tokenCheck, require( './core/StreamLiveUpdate' ) )
  // // update stream live instance metadata; defaults to live if not provided (broadcasts)
  // r.put( '/streams/:streamId/meta/:historyId?', tokenCheck, require( './core/StreamLiveMetaUpdate' ) )

  // // QUERYING
  // // r.get( '/streams/:streamId/data/objects/:format/:historyId?', require( './query/QueryStreamObjects' ) )

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
