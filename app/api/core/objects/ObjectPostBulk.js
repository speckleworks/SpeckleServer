'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const _ = require( 'lodash' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if ( !req.body.objects ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }

  // SpeckleObject.find( { hash: { $in: req.body.objects.reduce( ( arr, o ) => { if ( o._id === undefined ) { return [ o.hash, ...arr ] } else return arr }, [ ] ) } }, '_id hash' )
  SpeckleObject.find( { hash: { $in: req.body.objects.reduce( ( arr, o ) => o._id === undefined ? [ o.hash, ...arr ] : arr, [ ] ) } }, '_id hash' )
  // SpeckleObject.find( { hash: { $in: req.body.objects.filter( o => o._id === undefined ).map( o => o.hash ) } }, '_id hash' )
    .then( results => {
      results.forEach( o => {
        let match = req.body.objects.filter( oo => oo.hash == o.hash )
        match.forEach( oo => oo._id = o._id.toString( ) )
      } )
      return SpeckleObject.insertMany( req.body.objects.filter( so => so._id === undefined ) )
    } )
    .then( results => {
      results.forEach( o => {
        let match = req.body.objects.filter( oo => oo.hash == o.hash )
        match.forEach( oo => oo._id = o._id.toString( ) )
      } )
      res.send( { success: true, message: 'Saved objects to database.', objectIds: req.body.objects.map( o => o._id ) } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}