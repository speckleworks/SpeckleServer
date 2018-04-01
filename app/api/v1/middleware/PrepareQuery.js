const winston = require( 'winston' )
const chalk = require( 'chalk' )
const q2m = require( 'query-to-mongo' )

/*
Ensures a query always comes along with the needed fields for permission checks
 */

let enforcedFields = [ 'type', 'private', 'canRead', 'canWrite', 'owner' ]

module.exports = ( q ) => {
  let query = q2m( q )
  let isHacker = false;
  if ( query.options.fields ) {
    if ( q.omit === undefined ) {
      enforcedFields.forEach( field => query.options.fields[ field ] = 1 )
      return query
    }
    enforcedFields.forEach( field => {
      if ( query.options.fields[ field ] != undefined ) {
        isHacker = true
        delete query.options.fields[ field ]
      }
    } )
    winston.debug( chalk.white.bgMagenta( 'Someone is a hacker' ) )
    return query
  }
  return query
}