const winston = require( '../../../config/logger' )
const jwt = require( 'jsonwebtoken' )

const User = require( '../../../models/User' )

module.exports = function ( req, res ) {
  winston.debug( 'TODO: verify email route' )
  if ( !req.body.email ) { res.status( 400 ); return res.send( { success: false, message: 'Do not fuck with us. Give us your email.' } ) }
  if ( !req.body.password ) { res.status( 400 ); return res.send( { success: false, message: 'Passwords are a necessary evil, fam.' } ) }

  return res.status(404).send('not implemented yet')
}
