'use strict'
const winston = require( '../../../config/logger' )

const User = require( '../../../models/User' )

// Used only to grant other users admin role
module.exports = function ( req, res ) {
  // if (req.params.userId === req.user._id.toString()) {
  //   return res.status(400).send({ success: false, message: 'Why would you want to change your own role? Sneaky.' })
  // }
  User.findOne( { _id: req.params.userId }, '-password' )
    .then( user => {
      //make sure we have a valid request
      if ( !user ) throw new Error( 'no user found.' )
      if ( req.body.name == null ||
        req.body.surname == null ||
        req.body.company == null ||
        req.body.email == null ||
        req.body.role == null ||
        req.body.archived == null
      ) { throw new Error( 'Request body is missing required field' ) }

      //update fields
      let fields = [ 'name', 'surname', 'company', 'email', 'role', 'archived' ]
      fields.forEach( field => {
        updateField( user, req.body, field )
      } )
      return user.save()
    } )
    .then( () => {
      res.send( { success: true, message: 'User profile updated.' } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString() } )
    } )
}

function updateField( user, body, field ){
  if ( user[field] != body[field] ){
    user[field] = body[field]
    user.markModified( field )
  }
}
