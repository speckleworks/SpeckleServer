const winston = require( 'winston' )
const chalk = require( 'chalk' )

const Comment = require( '../../../../models/Comment' )
const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
const Project = require( '../../../../models/Project' )

const PermissionCheck = require( '../middleware/PermissionCheck' )
const GetResource = require( '../middleware/GetResourceByType' )

module.exports = function( req, res ) {
  if ( !req.params.resourceType || !req.params.resourceId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No resource type, resourceId, or comment provided.' } )
  }

  GetResource( req.params.resourceType, req.params.resourceId, 'comments' )
    .then( resource => PermissionCheck( req.user, 'read', resource ) )
    .then( resource => {
      res.send( { success: true, resources: resource.comments } )
    } )
    .catch( err => {
      winston.error( err )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message } )
    } )
}
