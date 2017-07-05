'use strict'
const winston           = require( 'winston' )
const chalk             = require( 'chalk' )
const mongoose          = require( 'mongoose' )

const SplitObjects      = require( '../helpers/SplitObjects' )
const SpeckleObject     = require( '../../../models/SpeckleObject' )
const GeometryObject    = require( '../../../models/GeometryObject' )
      
module.exports = ( req, res ) => { 
  let geometries = []
  let parsedObj = [] 

  let objectsToUpdate = []

  SpeckleObject.find( { '_id': { $in: req.body.objects.map( obj => mongoose.Types.ObjectId( obj._id ) ) } } )
  .then( result => {
    objectsToUpdate = result
    return SplitObjects( req.body.objects )
  })
  .then( result => {
    geometries = result.geometries
    parsedObj = result.parsedObj
    parsedObj.forEach( po => { 
      let oldDocument = objectsToUpdate.find( o => o._id.toString() === po._id )
      if( !oldDocument ) throw new Error( 'Update failed, inconsistent document lists.' )
      for( let key in po ) oldDocument[ key ] = po[ key ]
    } )
    return Promise.all( objectsToUpdate.map( o => o.save() ) )
  })
  .then( result => {
    res.status( 200 )
    res.send( { success: true, message: 'Objects were updated.' } )
  })
  .catch( err => { 
    winston.error( err )
    res.status( 400 )
    res.send( { success: false, error: err } )
  })

}