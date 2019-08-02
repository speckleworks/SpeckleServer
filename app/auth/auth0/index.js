'use strict'

const passport = require( 'passport' )
const Auth0Strategy = require( 'passport-auth0' )
const cryptoRandomString = require( 'crypto-random-string' )
const jwt = require( 'jsonwebtoken' )

const winston = require( '../../../config/logger' )
const User = require( '../../../models/User' )

module.exports = {
  init( app, sessionMiddleware, redirectCheck, handleLogin ) {

    if ( process.env.USE_AUTH0 !== "true" )
      return null

    // define and set strategy
    let strategy = new Auth0Strategy( {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      state: false,
      callbackURL: '/signin/auth0/callback',
      passReqToCallback: true
    }, ( accessToken, refreshToken, extraParams, profile, done ) => done( null, profile ) )

    passport.use( strategy )

    // create signin route
    app.get( '/signin/auth0',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'auth0', {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        redirectUri: `${process.env.CANONICAL_URL}/signin/auth0/callback`,
        responseType: 'code',
        scope: 'openid profile email'
      } )
    )

    // create signin callback (this url needs to be whitelisted in your auth0 settings)
    app.get( '/signin/auth0/callback',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'auth0', { failureRedirect: '/signin/error' } ),
      async ( req, res, next ) => {
          if ( !req.user ) {
            req.session.errorMessage = 'Auth0 authentication failed.'
            res.redirect( '/signin/error' )
          }

          let email = req.user._json.email
          let name = req.user._json.name

          if ( !name || !email ) {
            req.session.errorMessage = 'Failed to retrieve email or name from Auth0.'
            return res.redirect( '/signin/error' )
          }

          try {
            let existingUser = await User.findOne( { email: email } )

            // If user exists:
            if ( existingUser ) {
              let userObj = {
                name: existingUser.name,
                surname: existingUser.surname,
                email: existingUser.email,
                role: existingUser.role,
                token: 'JWT ' + jwt.sign( { _id: existingUser._id, name: existingUser.name, email: existingUser.email }, process.env.SESSION_SECRET, { expiresIn: '24h' } ),
              }
              existingUser.logins.push( { date: Date.now( ) } )
              existingUser.markModified( 'logins' )

              existingUser.providerProfiles[ 'auth0' ] = req.user._json
              existingUser.markModified( 'providerProfiles' )

              await existingUser.save( )

              req.user = userObj
              return next( )
            }

            // If user does not exist:

            let userCount = await User.count( )
            let myUser = new User( {
              email: email,
              apitoken: null,
              role: 'user',
              verified: true, // If coming from an AD route, we assume the user's email is verified.
              password: cryptoRandomString( { length: 20, type: 'base64' } ), // need a dummy password
            } )

            myUser.providerProfiles[ 'auth0' ] = req.user._json
            myUser.apitoken = 'JWT ' + jwt.sign( { _id: myUser._id }, process.env.SESSION_SECRET, { expiresIn: '2y' } )
            let token = 'JWT ' + jwt.sign( { _id: myUser._id, name: myUser.name, email: myUser.email }, process.env.SESSION_SECRET, { expiresIn: '24h' } )

            if ( userCount === 0 && process.env.FIRST_USER_ADMIN === 'true' )
              myUser.role = 'admin'

            let namePieces = name.split( /(?<=^\S+)\s/ )

            if ( namePieces.length === 2 ) {
              myUser.name = namePieces[ 1 ]
              myUser.surname = namePieces[ 0 ]
            } else {
              myUser.name = "Anonymous"
              myUser.surname = name
            }

            await myUser.save( )

            req.user = {
              name: myUser.name,
              surname: myUser.surname,
              email: myUser.email,
              role: myUser.role,
              verified: myUser.verified,
              token: token
            }
            return next( )
          } catch ( err ) {
            winston.error( err )
            req.session.errorMessage = `Something went wrong. Server said: ${err.message}`
            return res.redirect( '/error' )
          }
        },
        handleLogin )

    return {
      strategyName: 'Auth0',
      signinRoute: '/signin/auth0',
      useForm: false
    }
  }
}
