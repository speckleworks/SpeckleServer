'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const _ = require( 'lodash' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )

// (1) Update all the objects that have an _id (replaces them completely)
// (2) Check in the db for existing objects by hash & map their _id to the obj list
// (3) Insert all the new objects
module.exports = ( req, res ) => {
  if ( !req.body.objects ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  Promise.all( req.body.objects.reduce( ( arr, o ) => ( o._id !== undefined && o.type !== 'Placeholder' ) ? [ SpeckleObject.update( { _id: o._id }, o ), ...arr ] : arr, [ ] ) )
    .then( ( ) => SpeckleObject.find( { hash: { $in: req.body.objects.reduce( ( arr, o ) => o._id === undefined ? [ o.hash, ...arr ] : arr, [ ] ) } }, '_id hash' ) )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      return SpeckleObject.insertMany( req.body.objects.filter( so => so._id === undefined ) )
    } )
    .then( results => {
      results.forEach( o => req.body.objects.filter( oo => oo.hash == o.hash ).forEach( oo => oo._id = o._id.toString( ) ) )
      res.send( { success: true, message: 'Saved objects to database.', objectIds: req.body.objects.map( o => o._id ) } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}