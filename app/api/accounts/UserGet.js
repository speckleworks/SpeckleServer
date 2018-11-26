const winston = require( '../../../config/logger' )

const User = require( '../../../models/User' )

module.exports = function ( req, res ) {
  User.findOne( { _id: req.user._id }, '-password' )
    .then( myUser => {
      if ( !myUser ) throw new Error( 'no user found.' )
      res.send( { success: true, resource: myUser } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString() } )
    } )
}
