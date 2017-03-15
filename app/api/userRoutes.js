'use strict'

const winston             = require('winston')
const passport            = require('passport')

module.exports = function( app, express ) {

  var routes = new express.Router()
  
  // registers a new user
  routes.post( '/accounts/register', require('./users/CreateUser') )

  // returns a jwt token
  routes.post( '/accounts/login', require('./users/Login'))

  // note the auth middleware
  routes.put( '/accounts/update', passport.authenticate( 'jwt', { session: false } ), require('./users/UpdateUser'))

  app.use( '/user', routes)
}