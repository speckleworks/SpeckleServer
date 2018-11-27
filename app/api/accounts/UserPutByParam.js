'use strict'
const winston = require( '../../../config/logger' )

const User = require( '../../../models/User' )

// Used only to grant other users admin role
module.exports = function( req, res ) {
  if ( req.params.userId === req.user._id.toString() ) {
    return res.status( 400 ).send( { success: false, message: 'Why would you want to change your own role? Sneaky.' } )
  }
  User.findOne( { _id: req.params.userId }, '-password' )
    .then( user => {
      if ( !user ) throw new Error( 'no user found.' )
      // if the user requesting this change is admin
      if ( req.user.role === 'admin' )
        if ( req.body.role ) {
          // he can modify the other user's role too.
          user.role = req.body.role
          user.markModified( 'role' )
          return user.save( )
        }
      throw new Error( 'Only users can change their own details, via the non-parametrised request to /accounts, or admins can change user roles.' )
    } )
    .then( ( ) => {
      res.send( { success: true, message: 'User profile updated.' } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
