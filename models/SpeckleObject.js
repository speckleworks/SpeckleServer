'use strict'
const mongoose = require( 'mongoose' )

var speckleObjectSchema = mongoose.Schema( {
  // object type
  type: {
    type: String,
    enum: [ 'Null', 'Boolean', 'Number', 'String', 'Interval', 'Interval2d', 'Point', 'Vector', 'Plane', 'Line', 'Rectangle', 'Circle', 'Arc', 'Ellipse', 'Polycurve', 'Box', 'Polyline', 'Curve', 'Mesh', 'Brep', 'Annotation', 'Extrusion', 'Abstract' ],
    default: 'Null'
  },

  // Geometry hash
  geometryHash: { type: String, default: null },

  // Object hash (= GeometryHash + Properties) 
  hash: { type: String, default: null, required: true },

  // Application's object id, whatever form it takes
  applicationId: { type: String, default: null },

  // All the extra properties 
  properties: { type: Object, default: null },

  // Flag for deletion
  deleted: { type: Boolean, default: false },

  // Streams this object is part of
  partOf: { type: Array, default: [ ], select: false },

  // Ownership rights
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // strict: false as we store some random extras in here
}, { timestamps: true, strict: false } )

speckleObjectSchema.pre( 'save', next => {
  next( )
} )

var SpeckleObject = mongoose.model( 'SpeckleObject', speckleObjectSchema )

module.exports = SpeckleObject