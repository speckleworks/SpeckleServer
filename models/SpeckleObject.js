'use strict'
var mongoose = require( 'mongoose' )

var speckleObjectSchema = mongoose.Schema({
  type: { 
    type: String,
    enum: [ 'Null', 'Boolean', 'Number', 'String', 'Interval', 'Interval2d', 'Point', 'Vector', 'Plane', 'Line', 'Rectangle', 'Circle', 'Box', 'Polyline', 'Curve', 'Mesh', 'Brep' ],
    default: 'Null'
  },
  hash: { type: String, default: null },
  properties: { type: Object, default: null }
}, { timestamps: false, strict: false } )

speckleObjectSchema.pre( 'save', next => {
  next()
})

var SpeckleObject = mongoose.model( 'SpeckleObject', speckleObjectSchema) 

module.exports = SpeckleObject