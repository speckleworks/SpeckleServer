'use strict'
const winston = require( '../../../config/logger' )

const User = require( '../../../models/User' )

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
const escapeRegExp = ( string ) => string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) // $& means the whole matched string

module.exports = function ( req, res ) {
  let conditions = [ ]
  if ( !req.body.searchString || req.body.searchString === '' || req.body.searchString.length < 3 ) {
    return res.status( 400 ).send( { success: false, message: 'no search criteria present, or too short search string (must be > 2).' } )
  }

  if ( req.body.searchString ) {
    conditions.push( { name: { '$regex': escapeRegExp( req.body.searchString ), '$options': 'i' } } )
    conditions.push( { surname: { '$regex': escapeRegExp( req.body.searchString ), '$options': 'i' } } )
    conditions.push( { email: { '$regex': escapeRegExp( req.body.searchString ), '$options': 'i' } } )
  }

  let projection = '_id name surname company' + ( process.env.EXPOSE_EMAILS ? ' email' : '' )

  User.find( { $or: conditions }, projection ).limit( 10 )
    .then( myUsers => {
      if ( !myUsers ) throw new Error( 'no users found.' )
      res.send( { success: true, resources: myUsers } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
