const winston = require( '../../../config/logger' )

const User = require( '../../../models/User' )

module.exports = function ( req, res ) {
  User.find( {}, '-password' )
    .then( myUsers => {
      if ( !myUsers ) throw new Error( 'no user found.' )
      res.send( { success: true, resource: myUsers } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString() } )
    } )
}