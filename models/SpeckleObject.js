'use strict'
var mongoose = require( 'mongoose' )

var speckleObjectSchema = mongoose.Schema({
  type: { type: String },
  hash: { type: String },
  properties: { type: Object, default: null }
}, { timestamps: false, strict: false } )

var SpeckleObject = mongoose.model( 'SpeckleObject', speckleObjectSchema) 

module.exports = SpeckleObject