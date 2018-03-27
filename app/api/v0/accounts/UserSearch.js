'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const User              = require('../../../../models/User')

module.exports = function ( req, res ) {
  if(  !req.body.email ) {
    res.status(400)
    return res.send( { success: false, message: "Malformed request." } )
  }
  if( req.body.email.length < 2 ) {
    res.status(400)
    return res.send( { success: false, message: "Please provide more than two letters." } )
  }
  User.find( { email : { "$regex": req.body.email, "$options": "i" } }, '_id name surname email company' ).limit( 5 )
  .then( myUsers => {
    if( !myUsers ) throw new Error( 'no users found.' )
    res.send( { success: true, users: myUsers } )
  })
  .catch( err => {
    res.status( 400 )
    res.send( { success: false, message: err.toString() } )
  })
}