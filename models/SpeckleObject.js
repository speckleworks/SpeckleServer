'use strict'
var mongoose = require( 'mongoose' )

var speckleObjectSchema = mongoose.Schema({
  
  // object type
  type: { 
    type: String,
    enum: [ 'Null', 'Boolean', 'Number', 'String', 'Interval', 'Interval2d', 'Point', 'Vector', 'Plane', 'Line', 'Rectangle', 'Circle', 'Box', 'Polyline', 'Curve', 'Mesh', 'Brep', 'TextDot' ],
    default: 'Null'
  },
  
  // Geometry hash (points to a geometry object)
  geometryHash: { type: String, default: null },
  
  // Object hash (unique) 
  hash: { type: String, default: null },
  
  // Application's object id, whatever form it takes
  applicationId: { type: String, default: null },
  
  // All the extra properties 
  properties: { type: Object, default: null },

  // Flag for deletion
  deleted: { type: Boolean, default: false }

  // strict: false as we store some random extras in here
}, { timestamps: true, strict: false } )

speckleObjectSchema.pre( 'save', next => {
  next()
})

var SpeckleObject = mongoose.model( 'SpeckleObject', speckleObjectSchema) 

module.exports = SpeckleObject