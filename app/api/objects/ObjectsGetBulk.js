'use strict'
const winston = require( '../../../config/logger' )

const SpeckleObject = require( '../../../models/SpeckleObject' )
const PermissionCheck = require( '../middleware/PermissionCheck' )
const PrepareQuery = require( '../middleware/PrepareQuery' )

module.exports = ( req, res ) => {
  if ( !req.body ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No object ids provided.' } )
  }

  let query = PrepareQuery( req.query )
  query.criteria[ '_id' ] = { $in: req.body }

  SpeckleObject.find( query.criteria, query.options.fields, { sort: query.options.sort } ).lean()
    .then( objects => Promise.all( objects.map( o => PermissionCheck( req.user, 'read', o ) ).map( prom => prom.catch( e => e ) ) ) )
    .then( objects => {
      // populates objects that the user can't view with strings saying you can't view
      let list = req.body.reduce( ( arr, o ) => [ ...arr,
        ( () => {
          let obj = objects.find( oo => {
            if ( oo.hasOwnProperty( '_id' ) ) { return oo._id.toString() === o.toString() }
          } )
          return obj || { _id: o.toString(), type: 'String', value: 'You do not have permissions to view this object' }
        } )()
      ], [ ] )
      res.send( { success: true, resources: list } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
