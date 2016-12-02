var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
var uuid = require('node-uuid')
var winston = require('winston')

var userSchema = mongoose.Schema({
  username: String,
  email: { type: String, lowercase: true, unique: true, required: true },
  password: String,
  company: String,
  apitoken: String,
  logins: { type: Array, default: [] }
}, { timestamps: true } )

userSchema.pre( 'save', function( next ) {
  winston.debug('pre save user hook')
  var user = this
  if( this.isModified( 'password' ) || this.isNew ) {
    winston.debug('pass is new or modified')
    bcrypt.genSalt( 10, function (err, salt) {
      if( err ) return next(err)
      bcrypt.hash( user.password, salt, null, function ( err, hash ) {
        if( err ) return next( err )
        winston.debug('hashed password')
        user.password = hash
        user.apitoken = uuid.v4()
        next()
      })
    } )
  } 
})

module.exports = mongoose.model('User', userSchema)