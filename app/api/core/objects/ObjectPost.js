'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  SpeckleObject.findOne( { hash: req.body.object.hash }, '_id' )
    .then( result => {
      if ( result )
        res.send( { success: true, objectId: result._id, message: 'Object was already there.' } )
      else {
        req.body.object.owner = req.user._id
        return SpeckleObject.create( req.body.object )
      }
    } )
    .then( object => {
      res.send( { success: true, objectId: object._id, message: 'Created new object. ' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}