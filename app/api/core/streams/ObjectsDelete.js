const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )
const _ = require( 'lodash' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    res.send( { success: false, message: 'Malformed request.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { req.user._id.equals( id ) } ) ) )
        throw new Error( 'Unauthorized.' )

      if ( !req.body.objects ) {
        winston.debug( 'Deleting all objects from the stream list.' )
        SpeckleObject.updateMany( { '_id': { $in: stream.objects } }, { $pullAll: { partOf: [ req.params.streamId ] } } ).exec( )
        stream.objects = [ ]
        stream.markModified( 'objects' )
        return stream.save( )
      } else {
        winston.debug( 'Deleting some objects from the stream list.' )
        SpeckleObject.updateMany( { '_id': { $in: req.body.objects } }, { $pullAll: { partOf: [ req.params.streamId ] } } ).exec( )
        stream.objects = _.differenceWith( stream.objects, req.body.objects, ( a, b ) => a.toString( ) === b.toString( ) )
        stream.markModified( 'objects' )
        return stream.save( )
      }
    } )
    .then( stream => {
      res.send( { success: true, message: 'Deleted objects list.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}