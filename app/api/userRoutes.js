'use strict'

const winston             = require('winston')
const passport            = require('passport')

module.exports = function( app, express ) {

  var routes = new express.Router()
  
  routes.post( '/register', require('./users/CreateUser') )

  routes.post( '/login', require('./users/Login'))

  // note the auth middleware
  routes.post( '/update', passport.authenticate( 'jwt', { session: false } ), require('./users/UpdateUser'))

  app.use( '/user', routes)
}