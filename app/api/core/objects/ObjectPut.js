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
  SpeckleObject.findOneAndUpdate( { _id: req.params.objectId }, req.body.object )
    .then( result => {
      res.send( { success: true, message: 'Object updated.' } )
    } )
    .catch( err => {
      res.status( 400 )
      return res.send( { success: false, message: err.toString( ) } )
    } )

}