'use strict'

const passport = require( 'passport' )
const LocalStrategy = require( 'passport-local' )
const cryptoRandomString = require( 'crypto-random-string' )
const jwt = require( 'jsonwebtoken' )

const winston = require( '../../../config/logger' )
const User = require( '../../../models/User' )
const ActionToken = require( '../../../models/ActionToken' )

const SendEmailVerification = require( '../../../app/email/index' ).SendEmailVerification

module.exports = {
  init( app, sessionMiddleware, redirectCheck, handleLogin ) {

    if ( process.env.USE_LOCAL !== "true" )
      return null

    // Define the strategy
    let strategy = new LocalStrategy( {
      usernameField: 'email',
      passwordField: 'password',
      // passReqToCallback: true
    }, ( username, password, done ) => {
      User.findOne( { email: username } )
        .then( user => {
          if ( !user ) return done( null, false )
          user.validatePassword( password, user.password, match => {
            if ( match === false ) return done( null, false )
            let userObj = user.toObject( )
            delete userObj.password
            delete userObj.logins
            delete userObj.apitoken
            return done( null, userObj )
          } )
        } )
        .catch( err => done( err ) )
    } )

    passport.use( strategy )

    //
    // Login
    //
    app.get( '/signin/local/login',
      sessionMiddleware,
      redirectCheck,
      ( req, res ) => {
        res.render( 'login', {
          title: 'Speckle Login',
          server: process.env.SERVER_NAME,
          url: process.env.CANONICAL_URL,
          errorMessage: req.session.errorMessage,
          err: req.query.err,
          redirectUrl: req.session.redirectUrl
        } )
        req.session.errorMessage = ''
      } )

    app.post( '/signin/local/login',
      sessionMiddleware,
      redirectCheck,
      ( req, res, next ) => {
        passport.authenticate( 'local', { failureRedirect: `/signin/local/login?err=true` } )( req, res, next )
      },
      ( req, res, next ) => {
        req.user.token = 'JWT ' + jwt.sign( { _id: req.user._id, name: req.user.name, email: req.user.email }, process.env.SESSION_SECRET, { expiresIn: '24h' } )
        next( )
      },
      handleLogin )

    //
    // Registration
    //

    let inviteCheck = ( req, res, next ) => {
      // TODO: check for req.query.inviteToken
      next( )
    }

    app.get( '/signin/local/register',
      sessionMiddleware,
      redirectCheck,
      inviteCheck,
      ( req, res ) => {
        if ( process.env.PUBLIC_REGISTRATION !== "true" ) {
          req.session.errorMessage = `
          Public registration is closed for this server.
          `
          return res.redirect( '/signin/error' )
        }
        return res.render( 'register', {
          title: 'Speckle Register',
          server: process.env.SERVER_NAME,
          url: process.env.CANONICAL_URL,
          error: req.query.errorMessage,
          errorMessage: req.query.errorMessage,
          redirectUrl: req.session.redirectUrl
        } )
      } )

    app.post( '/signin/local/register',
      sessionMiddleware,
      redirectCheck,
      inviteCheck,
      async ( req, res, next ) => {

          if ( !req.body.email || !req.body.password ) {
            req.session.errorMessage = `
            Please provide an email and a password.
            `
            return res.redirect( `/signin/error` )
          }

          let myUser = new User( {
            email: req.body.email,
            password: req.body.password,
            company: req.body.company,
            name: req.body.name ? req.body.name : 'Anonymous',
            surname: req.body.surname ? req.body.surname : 'User',
            apitoken: null
          } )

          let validationToken = new ActionToken( {
            owner: myUser._id,
            token: cryptoRandomString( { length: 20, type: 'url-safe' } ),
            action: "email-confirmation"
          } )

          try {
            let userCount = await User.count( {} )
            let user = await User.findOne( { email: req.body.email } )

            if ( user ) {
              req.session.errorMessage = "Email is already registered. Please log in."
              return res.redirect( `/signin/local/login` )
            }

            myUser.apitoken = 'JWT ' + jwt.sign( { _id: myUser._id }, process.env.SESSION_SECRET, { expiresIn: '2y' } )

            if ( userCount === 0 && process.env.FIRST_USER_ADMIN === 'true' )
              myUser.role = 'admin'

            let savedUser = await myUser.save( )
            await validationToken.save( )

            SendEmailVerification( { name: savedUser.name, email: savedUser.email, token: validationToken.token } )

            let savedUserObj = {
              name: savedUser.name,
              surname: savedUser.surname,
              email: savedUser.email,
              role: savedUser.role,
              verified: savedUser.verified,
            }

            savedUserObj.token = 'JWT ' + jwt.sign( { _id: myUser._id, name: myUser.name, email: myUser.email }, process.env.SESSION_SECRET, { expiresIn: '24h' } )
            req.user = savedUserObj

            return next( )
          } catch ( err ) {
            winston.error( err )
            req.session.errorMessage = err.message
            return res.redirect( `/signin/local/login` )
          }
        },
        handleLogin )

    //
    // Verify email
    //
    app.get( '/signin/local/verify/:token', sessionMiddleware, async ( req, res ) => {
      try {

        if ( !req.params.token ) throw new Error( 'No verification token present.' )

        let token = await ActionToken.findOne( { token: req.params.token } ).populate( 'owner' )
        if ( !token || token.action !== 'email-confirmation' ) throw new Error( 'Wrong or expired verification token.' )

        token.owner.verified = true
        token.owner.markModified( 'verified' )

        await Promise.all( [ token.owner.save( ), token.delete( ) ] )

        return res.render( 'verify', {
          success: true
        } )
      } catch ( err ) {
        req.session.errorMessage = err.message
        return res.redirect( `/signin/error` )
      }
    } )

    //
    // Verify email
    //

    return {
      strategyName: 'Default Authentication',
      signinRoute: '/signin/local/login',
      useForm: false
    }
  }
}
