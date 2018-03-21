'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const User = require( '../../../../models/User' )

module.exports = function( req, res ) {
  User.findOne( { _id: req.user._id }, '-password' )
    .then( user => {
      if ( !user ) throw new Error( 'no user found.' )
      user.name = req.body.name ? req.body.name : user.name
      user.surname = req.body.surname ? req.body.surname : user.surname
      user.company = req.body.company ? req.body.company : user.company
      user.email = req.body.email ? req.body.email : user.email

      user.markModified( 'name' )
      user.markModified( 'surname' )
      user.markModified( 'company' )
      user.markModified( 'email' )
      return user.save( )
    } )
    .then( result => {
      res.send( { success: true, message: 'User profile updated.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}