'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const uuid              = require('uuid/v4')
const User              = require('../../../models/User')

module.exports = function ( req, res ) {
  winston.debug( 'register new user route' )
  if( !req.body.email ) { res.status(400); return res.send( { success: false, message:'Do not fuck with us. Give us your email.'} ) }
  if( !req.body.password ) { res.status(400); return res.send( { success: false, message:'Passwords are a necessary evil, fam.'} ) }
  
  let myUser = new User({
    email: req.body.email,
    password: req.body.password,
    company: req.body.company,
    name: req.body.name ? req.body.name : 'Anonymous.',
    apitoken: uuid().replace(/-/g, '')
  })
  myUser.save()
    .then( ( user ) => {
      return res.send( { success: true, message: 'User saved. Redirect to login.', apitoken: user.apitoken })
    })
    .catch( err => {
      res.status(400)
      return res.send( { success: false, message:'Email taken.' } )
    })
}