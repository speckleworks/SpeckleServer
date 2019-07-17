const winston = require( '../../../config/logger' )
const jwt = require( 'jsonwebtoken' )

const User = require( '../../../models/User' )
const ActionToken = require( '../../../models/ActionToken' )

module.exports = async function ( req, res ) {
  winston.debug( 'TODO: verify email route' )

  let token = await ActionToken.findOne( { token: req.params.token } ).populate( 'owner' )

  if ( !token )
    return res.status( 404 ).send( { success: false, message: "No token with that id exists. Was it used before?" } )

  if ( token.action !== "email-confirmation" )
    return res.status( 400 ).send( { success: false, message: "Invalid action. Are you using the right token?" } )

  token.owner.verified = true
  token.owner.markModified( 'verified' )

  await token.owner.save( )
  await token.delete( )

  return res.status( 200 ).send( { success: true, message: "User successfully verfied!" } )
}
