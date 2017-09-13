'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  let geometries = [ ]
  let parsedObj = [ ]
  res.send( 'todo' )
  // SpeckleObject.findOne( { hash: req.body.object.hash }, '_id' )
  //   .then( result => {
  //     if ( result ) {
  //       res.send( { success: true, objectId: result._id, message: 'Object with same hash was already there.' } )
  //       throw  new Error('Existing object')
  //     } else
  //       return SplitObjects( [ req.body.object ] )
  //   } )
  //   .then( result => {
  //     geometries = result.geometries
  //     parsedObj = result.parsedObj
  //     return GeometryObject.insertMany( geometries )
  //   } )
  //   .then( result => {
  //     return SpeckleObject.insertMany( parsedObj )
  //   } )
  //   .then( result => {
  //     return res.send( { success: true, objectId: result[ 0 ]._id, message: 'Inserted a new object.' } )
  //   } )
  //   .catch( err => {
  //     if( err.message === 'Existing object')
  //       return
  //     res.status( 400 )
  //     res.send( err )
  //   } )
}