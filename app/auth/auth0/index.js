'use strict'

const passport = require( 'passport' )
const Auth0Strategy = require( 'passport-auth0' )

module.exports = {
  init( app, sessionMiddleware, redirectCheck ) {

    if ( process.env.USE_AUTH0 !== "true" )
      return null

    // define and set strategy
    let strategy = new Auth0Strategy( {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      state: false,
      callbackURL: '/signin/auth0/callback'
    }, ( accessToken, refreshToken, extraParams, profile, done ) => done( null, profile ) )

    passport.use( strategy )

    // create signin route
    app.get( '/signin/auth0',
      sessionMiddleware,
      redirectCheck,
      ( req, res ) => {
        req.session.redirectUrl = req.query.redirectUrl // TODO: validate against whitelist
        res.render( 'auth0', {
          layout: false,
          title: 'Speckle Login/Register using Auth0',
          clientId: process.env.AUTH0_CLIENT_ID,
          domain: process.env.AUTH0_DOMAIN,
          allowRegistration: process.env.PUBLIC_REGISTRATION === 'true',
          serverRedirectUrl: new URL( '/signin/auth0/callback', process.env.CANONICAL_URL )
        } )
      } )

    // create signin callback (this url needs to be whitelisted in your auth0 settings)
    app.get( '/signin/auth0/callback',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'auth0' ), ( req, res ) => {
        console.log( 'Auth0 signin callback' )

        if ( !req.user )
          res.render( 'error' )

        res.send( { user: req.user, redirectUrl: req.session.redirectUrl } )
      } )

    return {
      strategyName: 'Auth0',
      signinRoute: '/signin/auth0',
      useForm: false
    }
  }
}
