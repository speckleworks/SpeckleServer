const winston = require( 'winston' )
const chalk = require( 'chalk' )

const Project = require( '../../../../models/Project' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {

  Project.find( { owner: req.user._id } )
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
    .then( resources => {
      res.send( { success: true, resources: resources } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message, streamId: req.streamId } )
    } )
}