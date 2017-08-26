'use strict'
const winston           = require( 'winston' )
const chalk             = require( 'chalk' )

const SplitObjects      = require( '../../helpers/SplitObjects' )
const SpeckleObject     = require( '../../../../models/SpeckleObject' )
const GeometryObject    = require( '../../../../models/GeometryObject' )
      
module.exports = ( req, res ) => {
  let geometries = []
  let parsedObj = [] 

  SplitObjects( [ req.body.object ] )
  .then( result => {
    geometries = result.geometries
    parsedObj = result.parsedObj
    return GeometryObject.insertMany( geometries )
  } )    
  .then( result => {
    return SpeckleObject.insertMany( parsedObj )
  })
  .then( result => {
    return res.send( { success: true, objects: result.map( o => o._id ), geometries: geometries.map( g => g.geometryHash ) } )
  })
  .catch( err => {
    console.log( err )
    res.status( 400 )
    res.send( err ) 
  } )
}