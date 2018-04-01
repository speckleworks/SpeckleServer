const winston = require( 'winston' )
const chalk = require( 'chalk' )

const Comment = require( '../../../../models/Comment' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {

  Comment.find( { assignedTo: req.user._id.toString() } )
    .then( resources => {
      res.send( { success: true, resources: resources } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}