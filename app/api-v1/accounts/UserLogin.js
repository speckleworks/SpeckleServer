'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const jwt               = require('jsonwebtoken')

const User              = require('../../../models/User')
const sessionSecret       = require('../../../config').sessionSecret

module.exports = function( req, res ) {
  if( !req.body.email ) return res.send( { success: false, message:'Do not fuck with us'} )
  if( !req.body.password ) return res.send( { success: false, message:'Do not fuck with us'} )

  User.findOne( { 'email': req.body.email } )
  .then( myUser => {
    if( !myUser ) return res.send( { success: false, message:'Do not fuck with us'} )
    myUser.validatePassword( req.body.password, myUser.password, match => {
      if( match === false ) return res.send( { success: false, message: 'Invalid password.'} )
      myUser.logins.push( { date: Date.now() } )
      myUser.save()
      let profile = {
        _id: myUser._id,
        name: myUser.name,
      }
      let token = 'JWT ' + jwt.sign( profile, sessionSecret, { expiresIn: '24h' } )
      res.send( { success: true, token: token, user: profile } )
    })
  })
  .catch( err => {
    res.send( { success: false, message: err } )
  })
}
