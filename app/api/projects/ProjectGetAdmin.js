const winston = require( '../../../config/logger' )
const q2m = require( 'query-to-mongo' )
const Project = require( '../../../models/Project' )

module.exports = ( req, res ) => {
  let query = q2m( req.query )
  let finalCriteria = {}

  let andCrit = Object.keys( query.criteria ).map( key => {
    let crit = {}
    crit[key] = query.criteria[key]
    return crit
    } )

  if ( andCrit.length !== 0 ) finalCriteria.$and = andCrit

  Project.find( finalCriteria, query.options.fields, { sort: query.options.sort, skip: query.options.skip, limit: query.options.limit } )
    .then( resources => {
      res.send( { success: true, resources: resources } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
