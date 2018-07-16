'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const User = require( '../../../../models/User' )

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
const escapeRegExp = ( string ) => string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) // $& means the whole matched string

module.exports = function( req, res ) {
  let conditions = {}
  if ( req.body.name ) conditions.name = { '$regex': escapeRegExp( req.body.name ), '$options': 'i' }
  if ( req.body.surname ) conditions.surname = { '$regex': escapeRegExp( req.body.surname ), '$options': 'i' }
  if ( req.body.company ) conditions.company = { '$regex': escapeRegExp( req.body.company ), '$options': 'i' }

  let projection = '_id name surname company' + ( req.app.get( 'expose emails' ) ? ' email' : '' )

  User.find( conditions, projection ).limit( 5 )
    .then( myUsers => {
      if ( !myUsers ) throw new Error( 'no users found.' )
      res.send( { success: true, resources: myUsers } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
