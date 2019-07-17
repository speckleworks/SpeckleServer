const winston = require( '../../../config/logger' )
const jwt = require( 'jsonwebtoken' )

const User = require( '../../../models/User' )

module.exports = function ( req, res ) {
  winston.debug( 'TODO: verify email route' )

  return res.status( 404 ).send( `not implemented yet (token: ${req.params.token})` )
}
