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

  DataStream.findOneAndUpdate( { streamId: req.params.streamId }, { $pullAll: { objects: [ req.params.objectId ] } } )
    .then( stream => {
      if ( !stream ) throw new Error( 'No stream found.' )
      if ( !req.user || !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { req.user._id.equals( id ) } ) ) )
        throw new Error( 'Unauthorized.' )

      SpeckleObject.updateMany( { '_id': { $in: stream.objects } }, { $pullAll: { partOf: [ req.params.streamId ] } } ).exec( )
      res.send( { success: true, message: 'Deleted objects list.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}