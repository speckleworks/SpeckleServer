'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const User              = require('../../../../models/User')

module.exports = function ( req, res ) {
  winston.debug('update user route')
  console.log( req.body )
  User.findOne( { _id : req.user._id } )
  .then( myUser => {
    if( req.body.name )
      myUser.name = req.body.name
    if( req.body.company )
      myUser.company = req.body.company
    if( req.body.password )
      myUser.password = req.body.password
    myUser.save()
    .then( () => {
      let profile = {
      _id: myUser._id,
      name: myUser.name, 
      company: myUser.company,
      apitoken: myUser.apitoken,
      lastLogin: myUser.logins.length >= 2 ? myUser.logins[ myUser.logins.length - 2 ] : Date.now(),
    }
    res.send( { success: true, user: profile } )
    })
    
    
  })
  .catch( err => {
    res.send( { success: false, message: err } )
  })
}