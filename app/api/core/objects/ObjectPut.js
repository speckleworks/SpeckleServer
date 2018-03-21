'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const mongoose = require( 'mongoose' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if ( !req.params.objectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  SpeckleObject.findOne( { _id: req.params.objectId } )
    .then( result => PermissionCheck( req.user, 'read', result, Object.keys( req.body.object ) ) )
    .then( result => result.set( req.body.object ).save( ) )
    .then( res => {
      res.send( { success: true, message: 'Object updated.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      return res.send( { success: false, message: err.toString( ) } )
    } )

}