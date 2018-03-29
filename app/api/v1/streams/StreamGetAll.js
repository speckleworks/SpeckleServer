'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const mongoose = require( 'mongoose' )

const DataStream = require( '../../../../models/DataStream' )

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting *all* streams for user ', req.user._id ) )
  let userSelect = '_id name surname email company'
  let userOwnedStreams = [ ]
  DataStream.find( { owner: req.user._id }, '-layers -objects' )
    .then( streams => {
      userOwnedStreams = streams
      return DataStream.find( { '$or': [ { 'canWrite': mongoose.Types.ObjectId( req.user._id ) }, { 'canRead': mongoose.Types.ObjectId( req.user._id ) } ] } , '-layers -objects' )
    } )
    .then( sharedWithStreams => {
      res.send( { success: true, message: 'Stream list for user ' + req.user._id, resources: [ ...userOwnedStreams, ...sharedWithStreams ] } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: 'Something failed.' } )
    } )
}