'use strict'
const exphbs = require( 'express-handlebars' )
const passport = require( 'passport' )
const Auth0Strategy = require( 'passport-auth0' )

module.exports = function ( app, express ) {

  app.engine( '.hbs', exphbs( { extname: '.hbs' } ) )
  app.set( 'view engine', '.hbs' )

  // delegate user identity verification to auth0
  if ( process.env.USE_AUTH0 === "true" ) {

    addAuth0Strategy( )

    // all routes should go to the auth0 lock screen
    app.get( '/register', ( req, res ) => res.render( 'auth0', { layout: false, title: 'Speckle: Login/Register to your account', clientId: process.env.AUTH0_CLIENT_ID, domain: process.env.AUTH0_DOMAIN } ) )

    app.get( '/login', ( req, res ) => res.render( 'auth0', { layout: false, title: 'Speckle: Login/Register to your account', clientId: process.env.AUTH0_CLIENT_ID, domain: process.env.AUTH0_DOMAIN } ) )

    app.get( '/registration-callback', passport.authenticate('auth0'), handlePassportRegistration )

  } else {

    // not delegating user identity

    if ( process.env.PUBLIC_REGISTRATION === "true" )
      app.get( '/register', ( req, res ) => res.render( 'register', {
        title: 'Register a new speckle account',
        server: process.env.SERVER_NAME,
        url: process.env.CANONICAL_URL
      } ) )

    app.get( '/login', ( req, res ) => res.render( 'login', {
      title: 'Login to your speckle account',
      server: process.env.SERVER_NAME,
      url: process.env.CANONICAL_URL
    } ) )
  }
}

function handlePassportRegistration( req, res ) => {
  res.send( req.user )
}

function addAuth0Strategy( ) {

  let strategy = new Auth0Strategy( {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    state: false,
    callbackURL: '/registration-callback'
  }, ( accessToken, refreshToken, extraParams, profile, done ) => done( null, profile ) )

  passport.use( strategy )
  passport.serializeUser( ( user, done ) => done( null, user ) )
  passport.deserializeUser( ( user, done ) => done( null, user ) )

}
