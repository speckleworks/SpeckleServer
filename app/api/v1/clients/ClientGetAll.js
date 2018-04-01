'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const UserAppClient = require( '../../../../models/UserAppClient' )

module.exports = ( req, res ) => {
  UserAppClient.find( { owner: req.user._id } )
    .then( clients => {
      if ( !clients ) throw new Error( 'Failed to find clients.' )
      res.send( { success: true, message: 'Stream list for user ' + req.user._id, resources: clients } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}