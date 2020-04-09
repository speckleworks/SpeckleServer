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

    let streamsToPullWriteFrom = [ ],
      streamsToPullReadFrom = [ ],
      streamsToPullBothFrom = [ ]

    let allOtherProjects = await Project.find( { 'streams': { $in: project.streams }, _id: { $ne: project._id } } )
    let allStreams = await DataStream.find( { streamId: { $in: project.streams } }, 'canWrite canRead streamId owner name' )

    for ( let streamId of project.streams ) {
      let otherProjects = allOtherProjects.filter( project => project.streams.indexOf( streamId ) > -1 )
      let stream = allStreams.find( s => s.streamId === streamId )

      let otherCW = Array.prototype.concat( ...otherProjects.map( p => p.permissions.canWrite.map( id => id.toString( ) ) ) ) // to string here as we're doing ops with string ids, not ObjectIds
      let otherCR = Array.prototype.concat( ...otherProjects.map( p => p.permissions.canRead.map( id => id.toString( ) ) ) ) // same as above

      let pullWrite = otherCW.indexOf( req.params.userId ) === -1 && stream.canWrite.indexOf( req.params.userId ) > -1,
        pullRead = otherCR.indexOf( req.params.userId ) === -1 && stream.canRead.indexOf( req.params.userId ) > -1
      if ( pullWrite && pullRead )
        streamsToPullBothFrom.push( streamId )
      else if ( pullWrite )
        streamsToPullWriteFrom.push( stream.streamId )
      else if ( pullRead )
        streamsToPullReadFrom.push( stream.streamId )
    }

    if ( streamsToPullBothFrom.length > 0 )
      operations.push( DataStream.updateMany( { streamId: { $in: streamsToPullBothFrom } }, { $pull: { canWrite: req.params.userId, canRead: req.params.userId } } ) )
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
    return res.send( { success: true, project: project, streamsToPullBothFrom: streamsToPullBothFrom, streamsToPullWriteFrom: streamsToPullWriteFrom, streamsToPullReadFrom: streamsToPullReadFrom } )
  } catch ( err ) {
    winston.error( JSON.stringify( err ) )
    res.status( err.message.indexOf( 'authorised' ) >= 0 ? 401 : 404 ).send( { success: false, message: err.message } )
  }
}
