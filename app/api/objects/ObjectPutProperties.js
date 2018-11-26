const winston = require( '../../../config/logger' )
const _ = require( 'lodash' )

const SpeckleObject = require( '../../../models/SpeckleObject' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.objectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  SpeckleObject.findOne( { _id: req.params.objectId } )
    .then( result => PermissionCheck( req.user, 'write', result ) )
    .then( result => {
      _.assign( result.properties, req.body )
      result.markModified( 'properties' )
      result.save()
    } )
    .then( () => {
      res.send( { success: true, message: 'Object properties updated.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      return res.send( { success: false, message: err.toString() } )
    } )
}
