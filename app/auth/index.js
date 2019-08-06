'use strict'
const exphbs = require( 'express-handlebars' )
const passport = require( 'passport' )
const redis = require( 'redis' )
const ExpressSession = require( 'express-session' )
const RedisStore = require( 'connect-redis' )( ExpressSession )


module.exports = function ( app ) {

  app.engine( '.hbs', exphbs( { extname: '.hbs' } ) )
  app.set( 'view engine', '.hbs' )

  passport.serializeUser( ( user, done ) => done( null, user ) )
  passport.deserializeUser( ( user, done ) => done( null, user ) )

  let redirectUrls = process.env.REDIRECT_URLS.split( ',' ).filter( r => r !== '' ).map( u => new URL( u ) )
  redirectUrls.push( new URL( process.env.CANONICAL_URL ) )

  //
  // Common middleware routes for authentication
  //
  let sessionMiddleware = ExpressSession( {
    store: new RedisStore( { client: redis.createClient( process.env.REDIS_URL ) } ),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60000 * 3
    },
    expires: new Date( Date.now( ) + 60000 * 3 ) // three minute expiration (not needed)
  } )

  let redirectCheck = ( req, res, next ) => {
    // TODO: whitelist all localhost ports
    // There's no guarantee from .net clients that we'll be always on the same localhost port
    if ( req.query.redirectUrl ) {
      let url = null
      try {
        url = new URL( req.query.redirectUrl )
      } catch ( err ) {
        req.session.errorMessage = `Invalid redirect url: <b>${req.query.redirectUrl}</b>`
        return res.redirect( '/signin/error' )
      }

      let ind = redirectUrls.findIndex( u => u.host === url.host )

      if ( ind === -1 ) {
        req.session.errorMessage = `The redirect url (<code>${req.query.redirectUrl}</code>) is not whitelisted on this server (${process.env.SERVER_NAME}). <hr> <small>Please contact your server administrator.</small>`
        return res.redirect( '/signin/error' )
      }

      if ( url.protocol === 'http:' && process.env.ALLOW_INSECURE_REDIRECTS === 'false' ) {
        req.session.errorMessage = `Insecure urls (non-http<b>s</b>) are not allowed as redirects. <hr> <small>Please contact your server administrator.</small>`
        return res.redirect( '/signin/error' )
      }

      req.session.redirectUrl = req.query.redirectUrl
    } else {
      //delete req.session.redirectUrl
    }
    next( )
  }

  let handleLogin = ( req, res ) => {
    // TODO: also check for potential errors
    // TODO: redirect if redirect is present, or display a simple page otherwise
    // NOTE: By this point in time, the req.user var should be the speckle user.

    let token = req.user.token //Buffer.from( req.user.token ).toString( 'base64' )
    let server = process.env.CANONICAL_URL //Buffer.from( process.env.CANONICAL_URL ).toString( 'base64' )
    let fullConnectionString = encodeURIComponent( `${token}:::${server}` )

    res.render( 'postLogin', {
      user: req.user,
      connectionString: fullConnectionString,
      redirectUrl: req.session.redirectUrl
    } )

    delete req.session.redirectUrl
  }

  // TODO: automate these reading from disk
  // Where we collect the strategies in one place, and send them to the frontend
  let strategies = [
    require( './local' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
    require( './auth0' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
    require( './azure-ad' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
    require( './github' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
  ].filter( s => s !== null )

  // Main authentication entry page
  app.get( '/signin',
    sessionMiddleware,
    redirectCheck,
    ( req, res ) => {
      req.session.redirectUrl = req.session.redirectUrl || req.query.redirectUrl
      res.render( 'signin', {
        strategies: strategies,
        redirectUrl: req.session.redirectUrl,
        error: req.query.err,
        serverName: process.env.SERVER_NAME
      } )
    } )

  app.get( '/signin/error', sessionMiddleware, ( req, res ) => {

    res.render( 'error', {
      errorMessage: req.session.errorMessage || "Oups. Something went wrong."
    } )

    req.session.errorMessage = ''
  } )
}
