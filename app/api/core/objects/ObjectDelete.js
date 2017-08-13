'use strict'
const winston           = require( 'winston' )
const passport          = require( 'passport' )
const chalk             = require( 'chalk' )

const SpeckleObject     = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if( !req.params.objectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No objectId provided.' } )
  }

  SpeckleObject.findOne( { _id: req.params.objectId } )
  .then( obj => {
    if( !obj ) throw new Error( 'No obj found.' )
    obj.deleted = true
    return obj.save() 
  })
  .then( result => {
    return res.send( { success: true, message: 'Object was flagged as deleted.' } )
  })
  .catch( err => {
    res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
    res.send( { success: false, message: err.toString() } )
  })  
}