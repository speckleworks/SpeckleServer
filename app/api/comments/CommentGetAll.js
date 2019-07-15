const winston = require( '../../../config/logger' )
const q2m = require( 'query-to-mongo' )
const mongoose = require( 'mongoose' )
const Comment = require( '../../../models/Comment' )

module.exports = ( req, res ) => {
  // prepare query
  let query = q2m( req.query )
  let finalCriteria = {}

  // perpare array for $and coming from url params
  let andCrit = Object.keys( query.criteria ).map( key => {
    let crit = {}
    crit[ key ] = query.criteria[ key ]
    return crit
  } )

  // if we actually have any query params, include them
  if ( andCrit.length !== 0 ) finalCriteria.$and = andCrit

  // the user query itself that gets both owned and assignedTo comments
  finalCriteria.$or = [
    { owner: req.user._id },
    { 'assignedTo': mongoose.Types.ObjectId( req.user._id ) }
  ]

  Comment.find( finalCriteria, query.options.fields, { sort: query.options.sort, skip: query.options.skip, limit: query.options.limit } )
    .then( resources => {
      res.send( { success: true, resources: resources } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
