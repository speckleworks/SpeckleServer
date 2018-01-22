const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )
const _ = require( 'lodash' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId || !req.params.objectId ) {
    res.status( 400 )
    res.send( { success: false, message: 'Malformed request.' } )
  }

  DataStream.findOneAndUpdate( { streamId: req.params.streamId }, { $pullAll: { objects: [ req.params.objectId ] } } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { req.user._id.equals( id ) } ) ) )
        throw new Error( 'Unauthorized.' )

      SpeckleObject.updateMany( { '_id': { $in: stream.objects } }, { $pullAll: { partOf: [ req.params.streamId ] } } ).exec( )
      stream.objects = _.remove( stream.objects, o => o.toString() === req.params.objectId )
      stream.markModified( 'objects' )
      return stream.save( )
    } )
    .then( stream => {
      res.send( { success: true, message: 'Object removed from list.' } )
    })
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}