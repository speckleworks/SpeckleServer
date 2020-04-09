var mongoose = require( 'mongoose' )
var bcrypt = require( 'bcrypt-nodejs' )

var userSchema = mongoose.Schema( {
  name: { type: String, default: 'John' },
  surname: { type: String, default: 'Doe' },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    index: true,
    validate: {
      validator( v ) {
        let regEx = /\S+@\S+\.\S+/
        return regEx.test( v )
      },
      message: props => `${props.value} much email wow error`
    }
  },
  password: String,
  company: String,
  apitoken: String,
  logins: { type: Array, default: [ ] },
  avatar: String,
  role: { type: String, default: 'user' },
  private: { type: Boolean, default: true },
  verified: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  providerProfiles: { type: Object, default: {} },
}, { timestamps: true } )


userSchema.pre( 'save', function ( next ) {
  var user = this
  if ( this.isModified( 'password' ) || this.isNew ) {
    if ( user.password.length < 8 )
      return next( new Error( 'Password too short.' ) )
    bcrypt.genSalt( 10, function ( err, salt ) {
      if ( err ) return next( err )
      bcrypt.hash( user.password, salt, null, function ( err, hash ) {
        if ( err ) return next( err )
        user.password = hash
        next( )
      } )
    } )
  } else next( ) // means pass is not modified, so all is well
} )

userSchema.methods.validatePassword = ( pw, upw, cb ) => {
  bcrypt.compare( pw, upw, ( err, res ) => {
    if ( res === true ) return cb( true )
    else return cb( false )
  } )
}

module.exports = mongoose.model( 'User', userSchema )
