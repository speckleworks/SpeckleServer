const winston = require( '../../../config/logger' )

const Project = require( '../../../models/Project' )

module.exports = ( req, res ) => {
  Project.find( { owner: req.user._id } )
    .then( resources => {
      res.send( { success: true, resources: resources } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}
