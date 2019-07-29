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
          error: req.query.err === 'true',
          errorMessage: req.query.errorMessage,
          redirectUrl: req.session.redirectUrl
        } )
      } )

    app.post( '/signin/local/login',
      sessionMiddleware,
      redirectCheck,
      passport.authenticate( 'local', { failureRedirect: `/signin/local/login?err=true` } ),
      ( req, res, next ) => {
        req.user.token = 'JWT ' + jwt.sign( { _id: req.user._id, name: req.user.name, email: req.user.email }, process.env.SESSION_SECRET, { expiresIn: '24h' } )
        next( )
      },
      handleLogin )

    //
    // Registration
    //
    app.get( '/signin/local/register',
      sessionMiddleware,
      redirectCheck,
      ( req, res ) => {
        res.render( 'register', {
          title: 'Speckle Register',
          server: process.env.SERVER_NAME,
          url: process.env.CANONICAL_URL,
          error: req.query.err === 'true',
          errorMessage: req.query.errorMessage,
          redirectUrl: req.session.redirectUrl
        } )
      } )

    app.post( '/signin/local/register',
      sessionMiddleware,
      redirectCheck,
      ( req, res, next ) => {

        if ( !req.body.email || !req.body.password )
          return res.redirect( `/signin/local/register?err=true&redirectUrl=${req.session.redirectUrl}` )

        let myUser = new User( {
          email: req.body.email,
          password: req.body.password,
          company: req.body.company,
          name: req.body.name ? req.body.name : 'Anonymous',
          surname: req.body.surname ? req.body.surname : 'User',
          apitoken: null
        } )

        let userCount = 1 // do not default to 0

        let validationToken = new ActionToken( {
          owner: myUser._id,
          token: cryptoRandomString( { length: 20, type: 'base64' } ),
          action: "email-confirmation"
        } )

        let savedUser = {}

        User.count( {} )
          .then( count => {
            userCount = count
            return User.findOne( { 'email': req.body.email } )
          } )
          .then( user => {
            if ( user )
              return res.redirect( `/signin/local/login?err=true&errorMessage=${user.email} is taken, please login below.` )
            myUser.apitoken = 'JWT ' + jwt.sign( { _id: myUser._id }, process.env.SESSION_SECRET, { expiresIn: '2y' } )

            if ( userCount === 0 && process.env.FIRST_USER_ADMIN === 'true' )
              myUser.role = 'admin'

            return myUser.save( )
          } )
          .then( user => {
            savedUser = user
            return validationToken.save( )
          } )
          .then( result => {
            let verfication = SendEmailVerification( { name: savedUser.name, email: savedUser.email, token: validationToken.token } )

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
          } )
          .catch( err => {
            winston.error( JSON.stringify( err ) )
            return res.redirect( `/signin/local/register?err=true&errorMessage=${err.message}&redirectUrl=${req.session.redirectUrl}` )
          } )
      },
      handleLogin )

    return {
      strategyName: 'Default Authentication',
      signinRoute: '/signin/local/login',
      useForm: false
    }
  }
}
