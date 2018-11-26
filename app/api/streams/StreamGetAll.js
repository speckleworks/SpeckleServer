const winston = require( '../../../config/logger' )
const chalk = require( 'chalk' )
const mongoose = require( 'mongoose' )
const q2m = require( 'query-to-mongo' )

const DataStream = require( '../../../models/DataStream' )

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'Getting *all* streams for user.' ) )
  let userSelect = '_id name surname email company'

  let query = q2m( req.query )

  DataStream.find( { '$or': [ { owner: req.user._id }, { 'canWrite': mongoose.Types.ObjectId( req.user._id ) }, { 'canRead': mongoose.Types.ObjectId( req.user._id ) } ] }, query.options.fields, { sort: query.options.sort, offset: query.options.offset, limit: query.options.limit } ).lean()
    .populate( { path: 'canRead', select: userSelect } )
    .populate( { path: 'canWrite', select: userSelect } )
    .then( myStreams => {
      let resources = myStreams
      try {
        if ( !req.query.populatePermissions ) {
          resources.forEach( stream => {
            stream.owner = stream.owner._id
            stream.canRead = stream.canRead.map( u => u._id )
            stream.canWrite = stream.canWrite.map( u => u._id )
          } )
        }
      } catch ( e ) {
        winston.debug( e.message )
      }

      if ( resources[ 0 ].objects !== null ) {
        resources.forEach( stream => {
          stream.objects = stream.objects.map( o => { return { _id: o, type: 'Placeholder' } } )
        } )
      }

      res.send( { success: true, message: 'Stream list returned. Contains both owned and shared with streams.', resources: resources } )
    } )
    .catch( err => {
      winston.error( err.message )
      res.status( 400 )
      res.send( { success: false, message: 'Something failed.' } )
    } )
}
