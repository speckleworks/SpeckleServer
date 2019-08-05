const winston = require( '../../../config/logger' )
const q2m = require( 'query-to-mongo' )
const DataStream = require( '../../../models/DataStream' )

module.exports = ( req, res ) => {
  winston.debug( 'Getting *all* streams.' )
  let query = q2m( req.query )

  let finalCriteria = {}

  // perpare array for $and coming from url params
  // delete populate permission field if present, as it hijacks the actual query criteria
  if ( query.criteria.populatePermissions ) delete query.criteria.populatePermissions
  let andCrit = Object.keys( query.criteria ).map( key => {
    let crit = {}
    crit[key] = query.criteria[key]
    return crit
  } )

  // if we actually have any query params, include them
  if ( andCrit.length !== 0 ) finalCriteria.$and = andCrit

  DataStream.find( finalCriteria, query.options.fields, { sort: query.options.sort, skip: query.options.skip, limit: query.options.limit } )
    .then( myStreams => {
      let resources = myStreams
      let streams = []
      resources.forEach( ( stream, i ) => {
        streams.push( stream.toObject() )
        if ( streams[i].objects ) streams[i].objects = streams[i].objects.map( o => { return { _id: o.toString(), type: 'Placeholder' } } )
      } )

      res.send( { success: true, message: 'Master stream list returned.', resources: streams } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: 'Something failed.' } )
    } )
}
