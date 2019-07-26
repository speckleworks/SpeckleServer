const jwt = require( 'jsonwebtoken' )

const winston = require( '../../../config/logger' )
const User = require( '../../../models/User' )

module.exports = function( req, res ) {
  if ( !req.body.email ) return res.status( 401 ).send( { success: false, message: 'Invalid credentials.' } )
  if ( !req.body.password ) return res.status( 401 ).send( { success: false, message: 'Invalid credentials.' } )

  let sessionSecret = process.env.SESSION_SECRET

  User.findOne( { 'email': req.body.email.toLowerCase( ) } )
    .then( myUser => {
      if  ( myUser.archived ){
        winston.error( 'This user is archived' )
        return res.status( 403 ).send ( {success: false, message: 'This user is archived.'} )
      }
      if ( !myUser ) {
        winston.error( 'Invalid credentials.' )
        return res.status( 401 ).send( { success: false, message: 'Invalid credentials.' } )
      }
      myUser.validatePassword( req.body.password, myUser.password, match => {
        if ( match === false ) {
          winston.error( 'Invalid credentials.' )
          return res.status( 401 ).send( { success: false, message: 'Invalid credentials.' } )
        }
        myUser.logins.push( { date: Date.now( ) } )
        myUser.save( )
        let token = 'JWT ' + jwt.sign( { _id: myUser._id, name: myUser.name }, sessionSecret, { expiresIn: '24h' } )
        let userObject = myUser.toObject( )
        userObject.token = token
        delete userObject[ 'password' ]
        res.send( { success: true, message: 'You have logged in.', resource: userObject } )
      } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 401 ).send( { success: false, message: err } )
    } )
}
