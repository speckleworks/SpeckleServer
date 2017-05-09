'use strict'
var mongoose = require('mongoose')

var dataObjectSchema = mongoose.Schema({
  type: { type: String },
  hash: { type: String, index: true, unique: true }
}, { timestamps: false, strict: false })

var DataObject = mongoose.model( 'DataObject', dataObjectSchema) 

module.exports = DataObject