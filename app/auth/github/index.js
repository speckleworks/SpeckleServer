'use strict'
const passport = require( 'passport' )
const GithubStrategy = require( 'passport-github' )
const cryptoRandomString = require( 'crypto-random-string' )
const jwt = require( 'jsonwebtoken' )

const winston = require( '../../../config/logger' )
const User = require( '../../../models/User' )

module.exports = {
  init( app, sessionMiddleware, redirectCheck, handleLogin ) {

    if ( process.env.USE_GITHUB !== "true" )
      return null

    // define and set strategy
    let strategy = new GithubStrategy( {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK,
      scope: [ 'profile', 'user:email' ],
      // passReqToCallback: true
    }, async ( accessToken, refreshToken, profile, done ) => {
      return done( null, profile )
    } )

    passport.use( strategy )

    // create signin route
    app.get( '/signin/github',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'github', { failureRedirect: '/signin/error' } ),
    )

    // create signin callback (this url needs to be whitelisted in your github application settings)
    app.get( '/signin/github/callback',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'github', { failureRedirect: '/signin/error' } ),
      async ( req, res, next ) => {

          if ( !req.user ) {
            req.session.errorMessage = 'Github authentication failed.'
            res.redirect( '/signin/error' )
          }

          // return res.send( req.user )

          let email = req.user._json.email || req.user.emails[ 0 ].value
          let name = req.user._json.name

          if ( !name || !email ) {
            req.session.errorMessage = 'Failed to retrieve email or name from Github.'
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

              existingUser.providerProfiles[ 'github' ] = req.user
              existingUser.markModified( 'providerProfiles' )

              await existingUser.save( )

              req.user = userObj
              return next( )
            }

            // If user does not exist:

            let userCount = await User.count( )
            let myUser = new User( {
              email: email,
              company: req.user._json.company || null,
              apitoken: null,
              role: 'user',
              verified: true, // If coming from an AD route, we assume the user's email is verified.
              password: cryptoRandomString( { length: 20, type: 'base64' } ), // need a dummy password
            } )

            myUser.providerProfiles[ 'github' ] = req.user._json
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
            return res.redirect( '/signin/error' )
          }
        },
        handleLogin )

    return {
      strategyName: 'Github',
      signinRoute: '/signin/github',
      useForm: false
    }
  }
}
