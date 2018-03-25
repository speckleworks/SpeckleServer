const Comment = require( '../../../models/Comment' )
const DataStream = require( '../../../models/DataStream' )
const SpeckleObject = require( '../../../models/SpeckleObject' )
const Project = require( '../../../models/Project' )

module.exports = ( type, id ) => {
  switch ( type ) {
    case 'stream':
    case 'streams':
      return DataStream.findOne( { streamId: id } )
    case 'object':
    case 'objects':
      return SpeckleObject.findOne( { _id: id } )
    case 'project':
    case 'projects':
      return Project.findOne( { _id: id } )
    case 'comment':
    case 'comments':
      return Project.findOne( { _id: id } )
    default:
      break
  }
}