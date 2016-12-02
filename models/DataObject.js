var mongoose = require('mongoose')

var dataObjectSchema = mongoose.Schema({
// TODO  
}, { timestamps: true })

module.exports = mongoose.model( 'DataObject', DataObjectSchema)