const winston = require( 'winston' )
const chalk = require( 'chalk' )

const Project = require( '../../../../models/Project' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.projectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No projectId provided' } )
  }

  Project.findOne( { _id: req.params.projectId } )
    .populate( { path: 'owner', select: 'name surname email company _id' } )
    .populate( {
      path: 'permissions.canRead',
      select: 'name surname email company _id'
    } )
    .populate( {
      path: 'permissions.canWrite',
      select: 'name surname email company _id'
    } )
    .populate( {
      path: 'streams',
      select: 'name streamId'
    } )
    .then( resource => PermissionCheck( req.user, 'read', resource ) )
    .then( resource => {
      res.send( { success: true, resource: resource } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}