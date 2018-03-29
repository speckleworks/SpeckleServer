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
    .populate( { path: 'canRead', select: userSelect } )
    .populate( { path: 'canWrite', select: userSelect } )
    .then( streams => {
      userOwnedStreams = streams
      return DataStream.find( { '$or': [ { 'canWrite': mongoose.Types.ObjectId( req.user._id ) }, { 'canRead': mongoose.Types.ObjectId( req.user._id ) } ] }, '-layers -objects' )
        .populate( { path: 'owner', select: userSelect } )
    } )
    .then( sharedWithStreams => {
      let resources = [ ...userOwnedStreams, ...sharedWithStreams ]
      if ( !req.query.populatePermissions ) {
        resources.forEach( stream => {
          stream.owner = stream.owner._id
          stream.canRead = stream.canRead.map( u => u._id )
          stream.canWrite = stream.canWrite.map( u => u._id )
        } )
      }
      res.send( { success: true, message: 'Stream list for user ' + req.user._id, resources: resources } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: 'Something failed.' } )
    } )
}