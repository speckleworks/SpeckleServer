const winston = require( 'winston' )
const chalk = require( 'chalk' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.objectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Malformed request.' } )
  }
  SpeckleObject.findOne( { _id: req.params.objectId } )
    .then( result => PermissionCheck( req.user, 'write', result, Object.keys( req.body ) ) )
    .then( result => result.set( req.body ).save( ) )
    .then( result => {
      res.send( { success: true, message: 'Object updated.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( 400 )
      return res.send( { success: false, message: err.toString( ) } )
    } )

}