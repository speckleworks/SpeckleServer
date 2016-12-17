var mongoose = require('mongoose')

var dataObjectSchema = mongoose.Schema({
  type: { type: String },
  hash: { type: String, index: true, required: true, unique: true, dropDups: true },
  properties: { type: Object, default: {} }, // should it just be an array? 
  value: {type: Object, default: {} },
  encodedValue: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model( 'DataObject', dataObjectSchema)