const winston = require( '../../../config/logger' )

const Comment = require( '../../../models/Comment' )

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
