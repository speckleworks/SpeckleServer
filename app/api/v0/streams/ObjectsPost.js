const winston = require( 'winston' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId || !req.body.objects ) {
    res.status( 400 )
    res.send( { success: false, message: 'Malformed request.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { req.user._id.equals( id ) } ) ) )
        throw new Error( 'Unauthorized.' )

      SpeckleObject.updateMany( { '_id': { $in: req.body.objects } }, { $addToSet: { partOf: req.params.streamId } } ).exec( )
      stream.objects.push( ...req.body.objects )
      stream.markModified( 'objects' )
      return stream.save( )
    } )
    .then( stream => {
      res.send( { success: true, message: 'Appended objects to stream.', objects: stream.objects } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}