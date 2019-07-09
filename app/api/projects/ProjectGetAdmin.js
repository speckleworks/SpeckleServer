const winston = require( '../../../config/logger' )
const mongoose = require( 'mongoose' )
const q2m = require( 'query-to-mongo' )
const Project = require( '../../../models/Project' )

module.exports = ( req, res ) => {
  let query = q2m( req.query )
  Project.find( { sort: query.options.sort, offset: query.options.offset, limit: query.options.limit } )
    .then( resources => {
      res.send( { success: true, resources: resources } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
