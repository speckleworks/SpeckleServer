'use strict'

var JwtStrategy   = require('passport-jwt').Strategy
var ExtractJwt    = require('passport-jwt').ExtractJwt

var sessionSecret = require('../.secrets/session')
var User          = require('../models/User')

module.exports = function( passport ) {
  let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: sessionSecret
  }

  passport.use( new JwtStrategy( opts, ( jwt_payload, done ) => {
    
    User.findOne( { _id: jwt_payload._id }, ( err, user ) => {
      if( err ) return done( err, false ) // not ok
      if( !user ) return done( null, false ) // not ok
      return done( null, user ) // is ok
    } )
  }))


}