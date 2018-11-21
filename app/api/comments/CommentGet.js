const winston = require( '../../../config/logger' )

const Comment = require( '../../../models/Comment' )

const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = function ( req, res ) {
  if ( !req.params.commentId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No resource type, resourceId, or comment provided.' } )
  }

  Comment.findOne( { _id: req.params.commentId } )
    .then( resource => PermissionCheck( req.user, 'read', resource ) )
    .then( resource => {
      res.send( { success: true, resource: resource } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message } )
    } )
}
