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