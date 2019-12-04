const winston = require( '../../../config/logger' )

const Project = require( '../../../models/Project' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = ( req, res ) => {
  if ( !req.params.projectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No projectId provided' } )
  }

  Project.findOne( { _id: req.params.projectId } )
    .then( resource => PermissionCheck( req.user, 'write', resource ) )
    .then( resource => {
      resource.canRead = resource.canRead.filter( x => !!x )
      resource.canWrite = resource.canWrite.filter( x => !!x )
      return resource.set( req.body ).save( )
    } )
    .then( ( ) => {
      res.send( { success: true, message: `Patched ${Object.keys( req.body )} for ${req.params.projectId}.` } )
    } )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 )
      res.send( { success: false, message: err.message } )
    } )
}
