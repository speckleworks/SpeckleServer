const Comment = require( '../../../../models/Comment' )
const DataStream = require( '../../../../models/DataStream' )
const SpeckleObject = require( '../../../../models/SpeckleObject' )
const Project = require( '../../../../models/Project' )

module.exports = ( type, id, populateFields ) => {
  switch ( type ) {
    case 'stream':
    case 'streams':
      return DataStream.findOne( { streamId: id } ).populate( populateFields )
    case 'object':
    case 'objects':
      return SpeckleObject.findOne( { _id: id } ).populate( populateFields )
    case 'project':
    case 'projects':    
      return Project.findOne( { _id: id } ).populate( populateFields )
    case 'comment':
    case 'comments':
      return Comment.findOne( { _id: id } ).populate( populateFields )
    default:
      break
  }
}