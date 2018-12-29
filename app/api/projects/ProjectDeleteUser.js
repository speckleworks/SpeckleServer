const winston = require( '../../../config/logger' )

const Project = require( '../../../models/Project' )
const DataStream = require( '../../../models/DataStream' )
const PermissionCheck = require( '../middleware/PermissionCheck' )

module.exports = async ( req, res ) => {
  if ( !req.params.projectId || !req.params.userId )
    return res.status( 400 ).send( { success: false, message: 'No projectId or userId provided.' } )

  try {
    let project = await PermissionCheck( req.user, 'write', await Project.findOne( { _id: req.params.projectId } ) )

    let operations = [ ]

    let streamsToPullWriteFrom = [ ]
    let streamsToPullReadFrom = [ ]

    project.streams.forEach( async ( streamId ) => {
      let otherProjects = await Project.find( { 'streams': streamId, _id: { $ne: project._id } } )
      let stream = await DataStream.findOne( { streamId: streamId }, 'canWrite canRead streamId owner' )
      let otherCW = Array.prototype.concat( ...otherProjects.map( p => p.permissions.canWrite ) )
      let otherCR = Array.prototype.concat( ...otherProjects.map( p => p.permissions.canRead ) )

      if ( otherCW.indexOf( req.params.userId ) === -1 && stream.canWrite.indexOf( req.params.userId ) > -1 )
        // stream.canWrite.splice( stream.canWrite.indexOf( req.params.userId ), 1 )
        streamsToPullWriteFrom.push( stream.streamId )
      if ( otherCR.indexOf( req.params.userId ) === -1 && stream.canRead.indexOf( req.params.userId ) > -1 )
        // stream.canRead.splice( stream.canRead.indexOf( req.params.userId ), 1 )
        streamsToPullReadFrom.push( stream.streamId )

      // operations.push( stream.save( ) )
    } )

    if ( streamsToPullWriteFrom.length > 0 )
      operations.push( DataStream.updateMany( { streamId: { $in: streamsToPullWriteFrom } }, { $pull: { canWrite: req.params.userId } } ) )
    if ( streamsToPullReadFrom.length > 0 )
      operations.push( DataStream.updateMany( { streamId: { $in: streamsToPullReadFrom } }, { $pull: { canRead: req.params.userId } } ) )

    project.permissions.canWrite.indexOf( req.params.userId ) > -1 ? project.permissions.canWrite.splice( project.permissions.canWrite.indexOf( req.params.userId ), 1 ) : null
    project.permissions.canRead.indexOf( req.params.userId ) > -1 ? project.permissions.canRead.splice( project.permissions.canRead.indexOf( req.params.userId ), 1 ) : null

    project.canWrite.indexOf( req.params.userId ) > -1 ? project.canWrite.splice( project.canWrite.indexOf( req.params.userId ), 1 ) : null
    project.canRead.indexOf( req.params.userId ) > -1 ? project.canRead.splice( project.canRead.indexOf( req.params.userId ), 1 ) : null

    operations.push( project.save( ) )

    await Promise.all( operations )
    return res.send( { success: true, project: project, streamsToPullWriteFrom: streamsToPullWriteFrom, streamsToPullReadFrom: streamsToPullReadFrom } )
  } catch ( err ) {
    winston.error( JSON.stringify( err ) )
    res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 ).send( { success: false, message: err.message } )
  }
}
