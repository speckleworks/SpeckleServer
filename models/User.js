var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')
var winston = require('winston')

var userSchema = mongoose.Schema({
  name: { type: String, default: 'John' },
  surname: { type: String, default: 'Doe' },
  email: { type: String, lowercase: true, unique: true, required: true, index: true },
  password: String,
  company: String,
  apitoken: String,
  logins: { type: Array, default: [] },
  avatar: String,
  role: { type: String, default: 'user' }
}, { timestamps: true } )


userSchema.pre( 'save', function( next ) {
  var user = this
  if( this.isModified( 'password' ) || this.isNew ) {
    bcrypt.genSalt( 10, function ( err, salt ) {
      if( err ) return next( err )
      bcrypt.hash( user.password, salt, null, function ( err, hash ) {
        if( err ) return next( err )
        user.password = hash
        next()
      })
    })
  } else next() // means pass is not modified, so all is well
})

userSchema.methods.validatePassword = ( pw, upw, cb ) => {
  console.log( this )
  bcrypt.compare( pw, upw, ( err, res ) => {
    console.log( pw, upw )
    if( res === true ) return cb( true )
    else return cb( false )
  } )
}

module.exports = mongoose.model('User', userSchema)