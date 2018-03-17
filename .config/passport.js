'use strict'

var JwtStrategy = require( 'passport-jwt' ).Strategy
var AnonymousStrategy = require( 'passport-anonymous' )
var ExtractJwt = require( 'passport-jwt' ).ExtractJwt

var sessionSecret = require( '../config' ).sessionSecret
var User = require( '../models/User' )

module.exports = function( passport ) {
  let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader( ),
    secretOrKey: sessionSecret
  }

  // returns 401 Unautorized, protects sensitive routes
  passport.use( 'jwt-strict', new JwtStrategy( opts, ( jwt_payload, done ) => {
    User.findOne( { _id: jwt_payload._id }, ( err, user ) => {
      if ( err ) return done( err, false ) // not ok
      if ( !user ) return done( null, false ) // not ok
      return done( null, user ) // is ok
    } )
  } ) )

  // returns always ok, but protection needs to be handled in route
  passport.use( new AnonymousStrategy( ) )
}