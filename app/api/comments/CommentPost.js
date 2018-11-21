const winston = require( '../../../config/logger' )

const Comment = require( '../../../models/Comment' )

const PermissionCheck = require( '../middleware/PermissionCheck' )
const GetResource = require( '../middleware/GetResourceByType' )

module.exports = function ( req, res ) {
  if ( !req.params.resourceType || !req.params.resourceId || !req.body ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No resource type, resourceId, or comment provided.' } )
  }

  GetResource( req.params.resourceType, req.params.resourceId, '' )
    .then( resource => PermissionCheck( req.user, 'comment', resource ) )
    .then( resource => {
      let comment = new Comment( req.body )
      comment.owner = req.user ? req.user._id : null
      comment.resource.resourceType = req.params.resourceType
      comment.resource.resourceId = req.params.resourceId
      resource.comments.push( comment._id )
      resource.markModified( 'comments' )

      return Promise.all( [ resource.save(), comment.save() ] )
    } )
    .then( result => {
      res.send( { success: true, message: 'Stop talking and chatting and do some work.', resource: result[ 1 ] } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
