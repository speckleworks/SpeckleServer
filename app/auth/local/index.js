'use strict'

const passport = require( 'passport' )
const LocalStrategy = require( 'passport-local' )

const User = require( '../../../models/User' )

module.exports = {
  init( app, express, sessionMiddleware, redirectCheck ) {

    if ( process.env.USE_LOCAL !== "true" )
      return null

    let strategy = new LocalStrategy( {
      usernameField: 'email',
      passwordField: 'password'
    }, ( username, password, done ) => {
      User.findOne( { email: username } )
        .then( user => {
          if ( !user ) return done( null, false )
          user.validatePassword( password, user.password, match => {
            if ( match === false ) return done( null, false )
            let userObj = user.toObject( )
            delete userObj.password
            delete userObj.logins
            return done( null, userObj )
          } )
        } )
        .catch( err => done( err ) )
    } )

    passport.use( strategy )

    // Local signin
    app.get( '/signin/local/login', redirectCheck, sessionMiddleware, ( req, res ) => {
      req.session.redirectUrl = req.query.redirectUrl
      res.render( 'login', {
        title: 'Speckle Login',
        server: process.env.SERVER_NAME,
        url: process.env.CANONICAL_URL,
        error: req.query.err === 'true',
        redirectUrl: req.session.redirectUrl
      } )
    } )

    // Local callback
    app.post( '/signin/local/login',
      redirectCheck,
      sessionMiddleware,
      ( req, res, next ) => {
        passport.authenticate( 'local', { failureRedirect: `/signin/local/login?err=true&redirectUrl=${req.session.redirectUrl}` } )( req, res, next )
      },
      ( req, res ) => {
        res.send( { user: req.user, redirectUrl: req.session.redirectUrl } )
      } )

    // Registration
    app.get( '/signin/local/register', redirectCheck, sessionMiddleware, ( req, res ) => {
      req.session.redirectUrl = req.query.redirectUrl
      res.render( 'register', {
        title: 'Speckle Register',
        server: process.env.SERVER_NAME,
        url: process.env.CANONICAL_URL,
        error: req.query.err === 'true',
        redirectUrl: req.session.redirectUrl
      } )
    } )

    app.post( '/signin/local/register', redirectCheck, sessionMiddleware, ( req, res ) => {

      if ( !req.body.email || !req.body.password )
        return res.redirect(`/signin/local/register?err=true&redirectUrl=${req.session.redirectUrl}`)


      res.send( 'todo' )
    } )

    return {
      strategyName: 'Default',
      signinRoute: '/signin/local/local/login',
      useForm: false
    }
  }
}
