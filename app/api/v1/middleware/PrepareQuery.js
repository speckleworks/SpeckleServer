const q2m = require( 'query-to-mongo' )

/*
Ensures a query always comes along with the needed fields for permission checks
 */

let enforcedFields = [ 'type', 'private', 'canRead', 'canWrite', 'owner' ]

module.exports = ( q ) => {
  let query = q2m( q )
  if ( query.options.fields ) {
    if ( q.omit === undefined ) { // TODO: check this makes sense - should it be query.options.omit?
      enforcedFields.forEach( field => { query.options.fields[ field ] = 1 } )
      return query
    }
    enforcedFields.forEach( field => {
      if ( query.options.fields[ field ] !== undefined ) {
        delete query.options.fields[ field ]
      }
    } )
    return query
  }
  return query
}
