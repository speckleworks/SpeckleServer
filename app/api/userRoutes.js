'use strict'

const winston = require('winston')

module.exports = function( app, express ) {

  var routes = new express.Router()
  // ONE BIG TODO
  app.use( '/user', routes)
}