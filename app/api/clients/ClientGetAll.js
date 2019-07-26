const winston = require( '../../../config/logger' )
const q2m = require( 'query-to-mongo' )
const UserAppClient = require( '../../../models/UserAppClient' )

module.exports = ( req, res ) => {
  let query = q2m( req.query )

  UserAppClient.find( { owner: req.user._id }, query.options.fields, { sort: query.options.sort, skip: query.options.skip, limit: query.options.limit } )
    .then( clients => {
      if ( !clients ) throw new Error( 'Failed to find clients.' )
      res.send( { success: true, message: 'Client list for user ' + req.user._id, resources: clients } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString() } )
    } )
}
