'use strict'

const passport = require( 'passport' )
const OIDCStrategy = require( 'passport-azure-ad' ).OIDCStrategy

module.exports = {
  init( app, express, sessionMiddleware ) {

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

    app.get( '/signin/azure', sessionMiddleware, ( req, res ) => {
      req.session.redirectUrl = req.query.redirectUrl
      passport.authenticate( 'azuread-openidconnect' )( req, res )
    } )

    app.post( '/signin/azure/callback', sessionMiddleware, passport.authenticate( 'azuread-openidconnect' ), ( req, res ) => {

      // req.user._json.name
      // req.user._json.email

      res.send( { user: req.user, redirectUrl: req.session.redirectUrl } )
    } )

    return {
      strategyName: `Microsoft Azure Active Directory ${process.env.AZUREAD_ORG_NAME}`,
      signinRoute: '/signin/azure',
      useForm: false
    }
  }
}
