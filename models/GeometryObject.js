'use strict'
var mongoose = require('mongoose')

var geometryObjectSchema = mongoose.Schema({
  type: { type: String },
  hash: { type: String, required: true, unique: true }
}, { timestamps: false, strict: false })

var GeometryObject = mongoose.model( 'GeometryObject', geometryObjectSchema) 

module.exports = GeometryObject