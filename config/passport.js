'use strict'
var JwtStrategy = require( 'passport-jwt' ).Strategy
var AnonymousStrategy = require( 'passport-anonymous' )
var ExtractJwt = require( 'passport-jwt' ).ExtractJwt

var User = require( '../models/User' )

module.exports = function( passport ) {
  let strictOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme( 'JWT' ),
    secretOrKey: process.env.SESSION_SECRET
  }

  // returns 401 Unautorized, protects sensitive routes
  passport.use( 'jwt-strict', new JwtStrategy( strictOptions, ( jwtPayload, done ) => {
    User.findOne( { _id: jwtPayload._id } )
      .then( user => {
        if ( !user ) {
          done( new Error( 'No user with these credentials found.' ), false )
        } else
        if ( user.archived )
          done( new Error( 'This user has been archived.' ), null )
        else
        done( null, user )
      } )
      .catch( err => {
        done( err, false ) // not ok
      } )
  } ) )

  passport.use( new AnonymousStrategy( ) )
}
