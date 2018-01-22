const winston = require( 'winston' )
const mongoose = require( 'mongoose' )
const shortId = require( 'shortid' )

const DataStream = require( '../../../../models/DataStream' )

module.exports = ( req, res ) => {
  if ( !req.params.streamId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No stream id provided.' } )
  }

  let clone = {}
  let parent = {}

  DataStream.findOne( { streamId: req.params.streamId } )
    .then( stream => {
      if ( !stream ) throw new Error( 'Database fail.' )
      clone = new DataStream( stream )
      clone._id = mongoose.Types.ObjectId( )
      clone.streamId = shortId.generate( )
      clone.parent = stream.streamId
      clone.children = [ ]
      clone.isNew = true
      stream.children.push( clone.streamId )
      return stream.save( )
    } )
    .then( result => {
      parent = result
      return clone.save( )
    } )
    .then( result => {
      res.send( { success: true, clone: { _id: result._id, streamId: clone.streamId }, parent: { _id: parent._id, streamId: parent.streamId, children: parent.children } } )
    } )
    .catch( err => {
      winston.debug( err )
      res.status( 400 )
      res.send( { success: false, message: err, streamId: req.streamId } )
    } )

}