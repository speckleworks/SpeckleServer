'use strict'
const mongoose = require( 'mongoose' )

var speckleObjectSchema = mongoose.Schema( {
  // ownership & permissions
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  private: { type: Boolean, default: false },
  canRead: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  canWrite: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  anonymousComments: { type: Boolean, default: false },
  // comments
  comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],

  // Object Type
  type: {
    type: String,
    enum: [ 'Null', 'Boolean', 'Number', 'String', 'Interval', 'Interval2d', 'Point', 'Vector', 'Plane', 'Line', 'Rectangle', 'Circle', 'Arc', 'Ellipse', 'Polycurve', 'Box', 'Polyline', 'Curve', 'Mesh', 'Brep', 'Annotation', 'Extrusion', 'Abstract' ],
    required: true
  },

  // Object name
  name: { type: String, default: 'Object Doe' }, 

  // Geometry hash
  geometryHash: { type: String, default: null, index: true },

  // Object hash (= GeometryHash + Properties) 
  hash: { type: String, default: null, required: true, index: true, required: true },

  // Application's object id, whatever form it takes
  applicationId: { type: String, default: null },

  // All the extra properties 
  properties: { type: Object, default: null },

  // Flag for deletion
  deleted: { type: Boolean, default: false },

  // Streams this object is part of
  partOf: { type: Array, default: [ ], select: false },

  // versioning
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'SpeckleObject', default: null },
  children: [ { type: mongoose.Schema.Types.ObjectId, ref: 'SpeckleObject' } ],
  ancestors: [ { type: mongoose.Schema.Types.ObjectId, ref: 'SpeckleObject' } ]

  // strict: false as we store some random extras in here
}, { timestamps: true, strict: false } )

speckleObjectSchema.pre( 'save', next => {
  next( )
} )

var SpeckleObject = mongoose.model( 'SpeckleObject', speckleObjectSchema )

module.exports = SpeckleObject