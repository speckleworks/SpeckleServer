'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const q2m = require( 'query-to-mongo' )

/*
Ensures a query always comes along with the needed fields for permission checks
 */
module.exports = ( q ) => {
  let query = q2m( q )
  if ( query.options.fields )
    query.options.fields.type = query.options.fields.private = query.options.fields.canRead = query.options.fields.canWrite = query.options.fields.owner = 1
  return query
}