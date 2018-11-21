const winston = require( '../../../config/logger' )

const Comment = require( '../../../models/Comment' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = function ( req, res ) {
  if ( !req.params.commentId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No commentId provided.' } )
  }

  Comment.findOne( { _id: req.params.commentId } )
    .then( resource => PermissionCheck( req.user, 'delete', resource ) )
    .then( resource => resource.remove() )
    .then( () => {
      res.send( { success: true, message: 'Comment deleted.' } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message } )
    } )
}
