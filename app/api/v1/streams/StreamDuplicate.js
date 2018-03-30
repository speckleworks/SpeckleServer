const winston = require( 'winston' )
const mongoose = require( 'mongoose' )
const shortId = require( 'shortid' )

const DataStream = require( '../../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let clone = {}
  let parent = {}

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => PermissionCheck( req.user, 'read', stream ) )
    .then( stream => {
      if ( !stream ) throw new Error( 'Database fail.' )
      clone = new DataStream( stream )
      clone._id = mongoose.Types.ObjectId( )
      clone.streamId = shortId.generate( )
      clone.parent = stream.streamId
      clone.children = [ ]
      clone.name += ' Clone'
      clone.createdAt = new Date
      clone.updatedAt = new Date
      clone.private = stream.private

      if ( req.user._id.toString( ) != stream.owner.toString( ) ) {
        // new ownership
        clone.owner = req.user._id
        //  grant original owner read access
        clone.canRead = [ stream.owner ]
        // make it private
        clone.canWrite = [ ]
      }

      stream.children.push( clone.streamId )
      clone.isNew = true
      return stream.save( )
    } )
    .then( result => {
      parent = result
      return clone.save( )
    } )
    .then( result => {
      result = result.toObject( )
      parent = parent.toObject( )
      delete result[ 'objects' ]
      delete result[ 'layers' ]
      delete parent[ 'objects' ]
      delete parent[ 'layers' ]
      res.send( { success: true, clone: result, parent: parent } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err, streamId: req.streamId } )
    } )

}