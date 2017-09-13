'use strict'
const winston           = require( 'winston' )
const chalk             = require( 'chalk' )

const SpeckleObject     = require( '../../../../models/SpeckleObject' )
      
module.exports = ( req, res ) => {
  res.send('todo')
  // let geometries = []
  // let parsedObj = [] 

  // SplitObjects( req.body.objects )
  // .then( result => {
  //   geometries = result.geometries
  //   parsedObj = result.parsedObj
  //   return GeometryObject.insertMany( geometries )
  // } )    
  // .then( result => {
  //   return SpeckleObject.insertMany( parsedObj )
  // })
  // .then( result => {
  //   return res.send( { success: true, objects: result.map( o => o._id ), geometries: geometries.map( g => g.geometryHash ) } )
  // })
  // .catch( err => {
  //   console.log( err )
  //   res.status( 400 )
  //   res.send( err ) 
  // } )
}