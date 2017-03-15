'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const uuid              = require('uuid/v4')
const User              = require('../../../models/User')

module.exports = function ( req, res ) {
  winston.debug( 'register new user route' )
  if( !req.body.email ) return res.send( { success: false, message:'Do not fuck with us. Give us your email.'} )
  if( !req.body.password ) return res.send( { success: false, message:'Passwords are a necessary evil, fam.'} )
  if( !req.body.name ) return res.send( { success: false, message:'Please let us know how to call you.'} )
  
  let myUser = new User({
    email: req.body.email,
    password: req.body.password,
    company: req.body.company,
    name: req.body.name,
    apitoken: uuid().replace(/-/g, '')
  })
  myUser.save()
    .then( () => {
      return res.send( { success: true, message: 'User saved. Redirect to login.' })
    })
    .catch( err => {
      return res.send( { success: false, message:'Email taken.' } )
    })
}