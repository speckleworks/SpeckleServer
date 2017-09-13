'use strict'
const winston           = require( 'winston' )
const chalk             = require( 'chalk' )
const mongoose          = require( 'mongoose' )

const SpeckleObject     = require( '../../../../models/SpeckleObject' )
      
module.exports = ( req, res ) => { 
  res.send('todo')
  // let geometries = []
  // let parsedObj = [] 

  // let objectToUpdate = {}

  // SplitObjects( req.body.object )
  // .then( result => {
  //   geometries = result.geometries
  //   return SpeckleObject.findOneAndUpdate( { _id: req.params.objectId }, { $set: result.parsedObj[0] }, { upsert: true } )   
  // })
  // .then( result => {
  //   if( geometries.length > 0)
  //     return GeometryObject.insertMany( geometries )
  //   else 
  //     return true
    
  // } )
  // .then( result => {
  //   res.status( 200 )
  //   res.send( { success: true, message: 'Object was updated.', geometries: geometries.map( g => g.geometryHash ) } )
  // })
  // .catch( err => {
  //   winston.error( err )
  //   res.status( 400 )
  //   res.send( { success: false, error: err.toString() } )
  // }) 
}