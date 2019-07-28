const winston = require( '../../../config/logger' )
const jwt = require( 'jsonwebtoken' )

const User = require( '../../../models/User' )
const ActionToken = require( '../../../models/ActionToken' )

module.exports = async function ( req, res ) {
  winston.debug( 'TODO: verify email route' )
  let token = null

  try {
    token = await ActionToken.findOne( { token: req.params.token } ).populate( 'owner' )
  } catch ( err ) {
    winston.error( err )
    return res.status( 400 ).send( { success: false, message: err } )
  }

  if ( !token )
    return res.status( 404 ).send( { success: false, message: "No token with that id exists. Was it used before?" } )

  if ( token.action !== "email-confirmation" )
    return res.status( 400 ).send( { success: false, message: "Invalid action. Are you using the right token?" } )

  token.owner.verified = true
  token.owner.markModified( 'verified' )

  try {
    await Promise.all( [ token.owner.save( ), token.delete( ) ] )
  } catch ( err ) {
    winston.error( err )
    return res.status( 400 ).send( { success: false, message: err } )
  }

  return res.status( 200 ).send( { success: true, message: "Thanks for verifying your email!" } ) // makes no sense!
  // res.redirect( `${process.env.CANONICAL_URL}/#/login?verfied=true` )
}
