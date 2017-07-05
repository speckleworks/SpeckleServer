'use strict'
var mongoose = require( 'mongoose' )

var speckleObjectSchema = mongoose.Schema({
  type: { 
    type: String,
    enum: [ 'Null', 'Boolean', 'Number', 'String', 'Interval', 'Interval2d', 'Point', 'Vector', 'Plane', 'Line', 'Rectangle', 'Circle', 'Box', 'Polyline', 'Curve', 'Mesh', 'Brep' ],
    default: 'Null'
  },
  // Geometry hash, if any
  hash: { type: String, default: null },
  // Application's object id, whatever form it takes
  applicationId: { type: String, default: null },
  // All the extra properties 
  properties: { type: Object, default: null }
}, { timestamps: true, strict: false } )

speckleObjectSchema.pre( 'save', next => {
  next()
})

var SpeckleObject = mongoose.model( 'SpeckleObject', speckleObjectSchema) 

module.exports = SpeckleObject