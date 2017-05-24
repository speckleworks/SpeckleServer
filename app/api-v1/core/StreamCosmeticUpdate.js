'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const DataStream        = require('../../../models/DataStream')

module.exports = ( req, res ) => {
  winston.debug( chalk.red( 'Updating stream cosmetics.' ) )

  let streamId = req.params.streamId
  let layerMaterials = req.body.layerMaterials

  if( ! streamId ) {
    res.status( 400 )
    return res.send( {success: false, message: 'Wat, no puddle found with dis id.' } )
  }
  DataStream.findOne( { streamId: streamId } )
  .then( stream => {
    stream.layerMaterials = layerMaterials
    return stream.save() 
  })
  .then( ( ) => {
    res.status( 200 )
    return res.send( { success: true } )
  } )
  .catch( err => {
    res.status( 400 )
    return res.send( {success: false} )
  })
}