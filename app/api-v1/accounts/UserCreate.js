'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const uuid              = require('uuid/v4')
const User              = require('../../../models/User')
const jwt               = require('jsonwebtoken')

const sessionSecret     = require('../../../config').sessionSecret

module.exports = function ( req, res ) {
  winston.debug( 'register new user route' )
  if( !req.body.email ) { res.status(400); return res.send( { success: false, message:'Do not fuck with us. Give us your email.'} ) }
  if( !req.body.password ) { res.status(400); return res.send( { success: false, message:'Passwords are a necessary evil, fam.'} ) }

  let myUser = new User({
    email: req.body.email,
    password: req.body.password,
    company: req.body.company,
    name: req.body.name ? req.body.name : 'Anonymous',
    suranme: req.body.surname ? req.body.surname : '',
    apitoken: uuid().replace(/-/g, '')
  })

  User.findOne( { email:req.body.email } )
  .then( user => {
    console.log( user )
    if( user ) {
      winston.debug( 'Email taken ' + req.body.email )
      // return res.send( {success: false, message: 'Email taken. Please login.'})
      throw 'Email taken. Please login. Thanks!'
    }
    return myUser.save()
  } )
  .then( savedUser => {
    let profile = {
      _id: savedUser._id,
      name: savedUser.name
    }
    let token = 'JWT ' + jwt.sign( profile, sessionSecret, { expiresIn: '24h' } )
    return res.send( { success: true, message: 'User saved. Redirect to login.', apitoken: savedUser.apitoken, token: token })
  })
  .catch( err => {
    winston.debug( err )
    winston.debug( 'Db error' )
    return res.send( {success: false, message: err } )
  })
}
