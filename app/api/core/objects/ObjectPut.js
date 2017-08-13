'use strict'
const winston           = require( 'winston' )
const chalk             = require( 'chalk' )
const mongoose          = require( 'mongoose' )

const SplitObjects      = require( '../../helpers/SplitObjects' )
const SpeckleObject     = require( '../../../../models/SpeckleObject' )
const GeometryObject    = require( '../../../../models/GeometryObject' )
      
module.exports = ( req, res ) => { 
  let geometries = []
  let parsedObj = [] 

  let objectToUpdate = {}

  SplitObjects( req.body.object )
  .then( result => {
    geometries = result.geometries
    return SpeckleObject.findOneAndUpdate( { _id: req.params.objectId }, { $set: result.parsedObj[0] }, { upsert: true } )   
  })
  .then( result => {
    if( geometries.length > 0)
      return GeometryObject.insertMany( geometries )
    else 
      return true
    
  } )
  .then( result => {
    res.status( 200 )
    res.send( { success: true, message: 'Object was updated.', geometries: geometries.map( g => g.geometryHash ) } )
  })
  .catch( err => {
    winston.error( err )
    res.status( 400 )
    res.send( { success: false, error: err.toString() } )
  }) 

  // SpeckleObject.findOne( { '_id': { $in: mongoose.Types.ObjectId( req.params.objectId ) } } ) 
  // .then( result => {
  //   if( !result ) 
  //     throw new Error( 'Failed to find objects.' )
  //   objectToUpdate = result
  //   return SplitObjects( req.body.object )
  // })
  // .then( result => {
  //   geometries = result.geometries
  //   parsedObj = result.parsedObj[ 0 ]

  //   for( let key in parsedObj ) {
  //     objectToUpdate[ key ] = []
  //     objectToUpdate[ key ] = parsedObj[ key ]

  //     console.log( key, ':', objectToUpdate[ key ], '///' , parsedObj[ key ] )
  //   }
  //   objectToUpdate.applicationId = 'lololo'
  //   return objectToUpdate.save()
  // })
  // .then( result => {
  //   res.status( 200 )
  //   res.send( { success: true, message: 'Object was updated.', objectId: result._id, geometries: geometries.map( g => g.geometryHash ) } )
  // })
  // .catch( err => { 
  //   winston.error( err )
  //   res.status( 400 )
  //   res.send( { success: false, error: err.toString() } )
  // })

}