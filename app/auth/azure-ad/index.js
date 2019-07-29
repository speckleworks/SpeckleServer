'use strict'

const passport = require( 'passport' )
const OIDCStrategy = require( 'passport-azure-ad' ).OIDCStrategy
const cryptoRandomString = require( 'crypto-random-string' )
const jwt = require( 'jsonwebtoken' )

const winston = require( '../../../config/logger' )
const User = require( '../../../models/User' )

module.exports = {
  init( app, sessionMiddleware, redirectCheck, handleLogin ) {

    if ( process.env.USE_AZUREAD !== 'true' )
      return null

    let strategy = new OIDCStrategy( {
      identityMetadata: process.env.AZUREAD_IDENTITY_METADATA,
      clientID: process.env.AZUREAD_CLIENT_ID,
      responseType: 'code id_token',
      responseMode: 'form_post',
      redirectUrl: new URL( '/signin/azure/callback', process.env.CANONICAL_URL ).toString( ),
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.AZUREAD_CLIENT_SECRET,
      scope: [ 'profile', 'email', 'openid' ]
    }, async ( iss, sub, profile, done ) => {
      done( null, profile )
    } )

    passport.use( strategy )

    app.get( '/signin/azure',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'azuread-openidconnect' )
    )

    app.post( '/signin/azure/callback',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'azuread-openidconnect', { failureRedirect: '/signin/error' } ),
      async ( req, res, next ) => {

          if ( !req.user ) {
            req.session.errorMessage = 'Failed to retrieve user from the Azure AD auth.'
            return res.redirect('/signin/error' )
          }

          let email = req.user._json.email
          let name = req.user._json.name || req.user.displayName

          if ( !name || !email ){
            req.session.errorMessage = 'Failed to retrieve email and name from the Azure AD auth.'
            return res.redirect('/signin/error' )
          }

          try {
            let dbUser = await User.findOne( { email: email } )

            // If user exists:
            if ( dbUser ) {
              let userObj = {
                name: dbUser.name,
                surname: dbUser.surname,
                email: dbUser.email,
                role: dbUser.role,
                verified: dbUser.verified,
                token: 'JWT ' + jwt.sign( { _id: dbUser._id, name: dbUser.name, email: dbUser.email }, process.env.SESSION_SECRET, { expiresIn: '24h' } ),
              }

              dbUser.logins.push( { date: Date.now( ) } )
              dbUser.markModified('logins')
              await dbUser.save()

              req.user = userObj
              return next( )
            }

            // If user does not exist:
            let userCount = await User.count( {} )
            let myUser = new User( {
              email: email,
              company: process.env.AZUREAD_ORG_NAME,
              apitoken: null,
              role: 'user',
              verified: true,
              password: cryptoRandomString( { length: 20, type: 'base64' } ), // need a dummy password
            } )

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
            return res.render( 'error', { errorMessage: `Something went wrong. Server said: ${err.message}` } )
          }
        },
        handleLogin )

    return {
      strategyName: `Azure AD ${process.env.AZUREAD_ORG_NAME}`,
      signinRoute: '/signin/azure',
      useForm: false
    }
  }
}
