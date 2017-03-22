'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const uuid              = require('uuid/v4')
const User              = require('../../../models/User')
const jwt               = require('jsonwebtoken')

const sessionSecret     = require('../../../.secrets/session')

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
      console.log( user )

      let profile = {
        _id: user._id,
        name: user.name 
      }
      let token = 'JWT ' + jwt.sign( profile, sessionSecret, { expiresIn: '24h' } )
      console.log( token )
      return res.send( { success: true, message: 'User saved. Redirect to login.', apitoken: user.apitoken, token: token })
    })
    .catch( err => {
      res.status(400)
      return res.send( { success: false, message:'Email taken.' } )
    })
}