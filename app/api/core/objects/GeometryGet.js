'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const GeometryObject        = require('../../../../models/GeometryObject')

module.exports = ( req, res ) => {
  let excludeString = ''
  if( req.params.type === 'native' ) excludeString = '-displayValue'
  if( req.params.type === 'speckle' ) excludeString = '-base64'
  // excludeString += ' -_id -__v'

  GeometryObject.findOne( { geometryHash: req.params.hash }, excludeString )
  .then( obj => { 
    if( !obj ) throw new Error( 'Invalid object.' )
    res.status( 200 )
    res.setHeader( 'Cache-Control', 'public, max-age=31557600' ) // SUPER CACHE ME ALWAYS
    res.send( {
      success: true,
      speckleGeometry: obj
    } )
  } )
  .catch( err => {
    res.status(404)
    return res.send( { success: false, message: 'Failed to find object.', hash: req.params.hash } )
  })
}