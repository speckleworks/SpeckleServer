'use strict'
const exphbs = require( 'express-handlebars' )
const passport = require( 'passport' )
const Auth0Strategy = require( 'passport-auth0' )

const User = require( '../../models/User' )
const ActionToken = require( '../../models/ActionToken' )

const SendEmailVerification = require( '../../app/email/index' ).SendEmailVerification

let redirectUrls = process.env.REDIRECT_URLS.split(',').filter( r => r !== '')
redirectUrls.push( process.env.CANONICAL_URL )

console.log( redirectUrls )
console.log( '-----------')

module.exports = function ( app, express ) {

  app.engine( '.hbs', exphbs( { extname: '.hbs' } ) )
  app.set( 'view engine', '.hbs' )

  // delegate user identity verification to auth0
  if ( process.env.USE_AUTH0 === "true" ) {

    addAuth0Strategy( )

    // all routes should go to the auth0 lock screen
    app.get( '/signin', ( req, res ) => res.render( 'auth0', {
      layout: false,
      title: 'Speckle: Login/Register to your account',
      clientId: process.env.AUTH0_CLIENT_ID,
      domain: process.env.AUTH0_DOMAIN,
      redirectTo: req.query.r // TODO: validate against whitelisted domains in .env?
    }   ) )

    app.get( '/registration-callback', passport.authenticate( 'auth0' ), handlePassportRegistration )

  } else {

    // not delegating user identity
    if ( process.env.PUBLIC_REGISTRATION === "true" )
      app.get( '/signin', ( req, res ) => res.render( 'register', {
        title: 'Register a new speckle account',
        server: process.env.SERVER_NAME,
        url: process.env.CANONICAL_URL,
        redirectTo: req.query.r // TODO: validate against whitelisted domains in .env?
      } ) )

    // app.get( '/login', ( req, res ) => res.render( 'login', {
    //   title: 'Login to your speckle account',
    //   server: process.env.SERVER_NAME,
    //   url: process.env.CANONICAL_URL,
    //   redirectTo: req.query.r //
    // } ) )
  }
}

async function handlePassportRegistration( req, res ) {
  console.log( 'passport handler registration')
  console.log( req.user )
  if ( !req.user )
    res.render( 'error' )

  let myUser = new User( {
    email: req.user._json.email,
    apitoken: null
  } )

  try {
    let count = await User.count( {} )
    let existing = await User.findOne()

  } catch ( err ) {
    console.log( err )
    res.send( err )
  }

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

function processUser() {

}
