const winston = require( '../../../config/logger' )

const SpeckleObject = require( '../../../models/SpeckleObject' )
const PrepareQuery = require( '../middleware/PrepareQuery' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.objectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No object id provided.' } )
  }

  let query = PrepareQuery( req.query )

  SpeckleObject.findOne( { _id: req.params.objectId }, query.options.fields )
    .then( object => PermissionCheck( req.user, 'read', object ) )
    .then( object => {
      res.send( { success: true, resource: object } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      res.send( { success: false, message: err.toString() } )
    } )
}
