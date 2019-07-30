'use strict'
const exphbs = require( 'express-handlebars' )
const passport = require( 'passport' )
const redis = require( 'redis' )
const ExpressSession = require( 'express-session' )
const RedisStore = require( 'connect-redis' )( ExpressSession )


const User = require( '../../models/User' )
const ActionToken = require( '../../models/ActionToken' )
const SendEmailVerification = require( '../../app/email/index' ).SendEmailVerification

let redirectUrls = process.env.REDIRECT_URLS.split( ',' ).filter( r => r !== '' )
redirectUrls.push( process.env.CANONICAL_URL )

module.exports = function ( app, express ) {

  app.engine( '.hbs', exphbs( { extname: '.hbs' } ) )
  app.set( 'view engine', '.hbs' )

  passport.serializeUser( ( user, done ) => done( null, user ) )
  passport.deserializeUser( ( user, done ) => done( null, user ) )


  //
  // Common middleware routes for authentication
  //
  let sessionMiddleware = ExpressSession( {
    store: new RedisStore( { client: redis.createClient( process.env.REDIS_URL ) } ),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    expires: new Date( Date.now( ) + 60000 * 3 ) // three minute expiration (not needed)
  } )

  let redirectCheck = ( req, res, next ) => {
    // TODO: pass through whitelist
    if ( req.query.redirectUrl ) {
      req.session.redirectUrl = req.query.redirectUrl
    }
    next( )
  }

  let handleLogin = ( req, res, next ) => {
    // TODO: also check for potential errors
    // TODO: redirect if redirect is present, or display a simple page otherwise
    // NOTE: By this point in time, the req.user var should be the speckle user.

    let token = Buffer.from( req.user.token ).toString( 'base64' )
    let server = Buffer.from( process.env.CANONICAL_URL ).toString( 'base64' )
    let fullConnectionString = `${token}/${server}`

    if ( req.session.redirectUrl ) {
      return res.redirect( `${req.session.redirectUrl}?token=${token}&serverUrl=${server}` )
    }

    res.render( 'postLogin', {
      user: req.user,
      connectionString: fullConnectionString
    } )
  }

  // TODO: automate these reading from disk
  // Where we collect the strategies in one place, and send them to the frontend
  let strategies = [
    require( './local' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
    require( './auth0' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
    require( './azure-ad' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
    require( './github' ).init( app, sessionMiddleware, redirectCheck, handleLogin ),
  ]


  // Main authentication entry page
  app.get( '/signin',
    sessionMiddleware,
    redirectCheck,
    ( req, res ) => {
      req.session.redirectUrl = req.session.redirectUrl || req.query.redirectUrl
      res.render( 'signin', {
        strategies: strategies,
        redirectUrl: req.session.redirectUrl,
        error: req.query.err
      } )
    } )

  app.get( '/signin/error', sessionMiddleware, ( req, res ) => {

    res.render( 'error', {
      errorMessage: req.session.errorMessage || "Oups. Something went wrong."
    } )

    req.session.errorMessage = ''
  } )
}
