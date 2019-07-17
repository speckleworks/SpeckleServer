const mongoose = require( 'mongoose' )

var tokenSchema = mongoose.Schema( {
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, index: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: '24h' }, // expire in 24h
  action: { type: String, required: true } // email verification, password reset, etc.
}, { timestamps: true } )


var ActionToken = mongoose.model( 'ActionToken', tokenSchema )

module.exports = ActionToken
