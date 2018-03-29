const winston = require( 'winston' )
const chalk = require( 'chalk' )
const shortId = require( 'shortid' )

const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
const BulkObjectSave = require( '../middleware/BulkObjectSave' )

module.exports = ( req, res ) => {

  if ( !req.body.objects ) req.body.objects = [ ]

  BulkObjectSave( req.body.objects, req.user )
    .then( objects => {
      let stream = new DataStream( req.body )
      stream.owner = req.user._id
      stream.streamId = shortId( )
      stream.objects = objects.map( obj => obj._id )
      return stream.save( )
    } )
    .then( stream => {
      stream = stream.toObject()
      stream.objects = stream.objects.map( id => { return { type: 'Placeholder', _id: id } } )
      res.send( { success: true, resource: stream, message: 'Created stream' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      return res.send( { success: false, message: err.toString( ) } )
    } )
}