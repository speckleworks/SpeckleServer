'use strict'
const winston = require( '../config/logger' )
const chalk = require( 'chalk' )

var JwtStrategy = require( 'passport-jwt' ).Strategy
var AnonymousStrategy = require( 'passport-anonymous' )
var ExtractJwt = require( 'passport-jwt' ).ExtractJwt

var User = require( '../models/User' )

module.exports = function ( passport ) {
  let strictOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme( 'JWT' ),
    secretOrKey: process.env.SESSION_SECRET
  }

  // returns 401 Unautorized, protects sensitive routes
  passport.use( 'jwt-strict', new JwtStrategy( strictOptions, ( jwtPayload, done ) => {
    User.findOne( { _id: jwtPayload._id } )
      .then( user => {
        if ( !user ) throw new Error( 'No user found.' )
        // winston.debug( chalk.bgBlue( 'Strict authentication' ), chalk.bgGreen( 'OK' ) )
        done( null, user )
      } )
      .catch( err => {
        // winston.debug( chalk.bgBlue( 'Strict authentication' ), chalk.bgRed( 'FAILED' ) )
        done( err, false ) // not ok
      } )
  } ) )

  passport.use( new AnonymousStrategy() )
}
