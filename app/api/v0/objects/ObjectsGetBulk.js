'use strict'
const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )
const q2m = require( 'query-to-mongo' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if ( !req.body.objects ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No object ids provided.' } )
  }

  let query = q2m( req.query )

  query.criteria[ '_id' ] = { $in: req.body.objects }
  SpeckleObject.find( query.criteria, query.options.fields, { sort: query.options.sort } )
    .then( objects => {
      let list = req.body.objects.reduce( ( arr, o ) => [ ...arr, objects.find( oo => oo._id.toString( ) === o.toString( ) ) ], [ ] )
      res.send( { success: true, resources: list } )
    } )
    .catch( err => {
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}