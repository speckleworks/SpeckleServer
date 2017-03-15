'use strict'
var mongoose = require('mongoose')

var dataObjectSchema = mongoose.Schema({
  type: { type: String },
  hash: { 
    type: String, 
    index: true, 
    required: true, 
    unique: true
  },
  properties: { type: Object, default: {} }, // should it just be an array? 
  value: {type: Object, default: {} },
  encodedValue: { type: String, default: '' }
}, { timestamps: true })

var DataObject = mongoose.model( 'DataObject', dataObjectSchema) 

module.exports = DataObject