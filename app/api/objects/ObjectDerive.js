const winston = require( 'winston' )
const { merge } = require( 'lodash' )

const SpeckleObject = require( '../../../models/SpeckleObject' )
const BulkObjectSave = require( '../middleware/BulkObjectSave' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

// Derives an object from an existing object
module.exports = ( req, res ) => {
  if ( !req.body || !( req.body instanceof Array ) ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }

  let objects = req.body

  SpeckleObject.find( { _id: { $in: objects.map( obj => obj._id ) } } ).lean()
    .then( objects => Promise.all( objects.map( o => PermissionCheck( req.user, 'read', o ) ).map( prom => prom.catch( e => e ) ) ) )
    .then( existingObjects => {
      let toSave = [ ]

      for ( let original of existingObjects ) {
        if ( original._id ) {
          let found = objects.find( o => o._id === original._id.toString() )
          let mod = {}

          merge( mod, original, found )

          // delete hash to prepare for rehashing in bulk save
          delete mod.hash
          delete mod._id
          delete mod.createdAt
          toSave.push( mod )
        }
      }
      return BulkObjectSave( toSave, req.user );
    } )
    .then( newObjects => {
      res.send( { success: true, message: 'Saved objects to database.', resources: newObjects.map( o => { return { type: 'Placeholder', _id: o._id } } ) } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}
