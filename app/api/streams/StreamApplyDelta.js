const shortId = require( 'shortid' )
const mongoose = require( 'mongoose' )

const BulkObjectSave = require( '../middleware/BulkObjectSave' )
const DataStream = require( '../../../models/DataStream' )

module.exports = async ( req, res ) => {

  try {
    // Create a clone
    let stream = await DataStream.findOne( { streamId: req.params.streamId } )

    let clone = new DataStream( stream )

    clone._id = mongoose.Types.ObjectId()
    clone.streamId = shortId.generate()
    clone.parent = stream.streamId
    clone.children = []
    clone.name = req.body.name ? req.body.name : clone.name + ' (clone)' // consider adding v.xxx, where x is the child's number
    clone.createdAt = new Date()
    clone.updatedAt = new Date()
    clone.private = stream.private

    if ( req.user._id.toString() !== stream.owner.toString() ) {
      // new ownership
      clone.owner = req.user._id
      //  grant original owner read access
      clone.canRead = [ stream.owner ]
      // make it private
      clone.canWrite = []
    }

    stream.children.push( clone.streamId )
    clone.isNew = true

    await stream.save()
    await clone.save()

    // APPLY DELTA on the original stream

    let delta = req.body

    //checks if delta can be applied. We have to make sure that the streamId of original stream should be the same as revision_A id.
    if ( delta.revisionA.id != stream.streamId ) {
      throw new Error( "Mismatched revision/streamId." )
    } else {

      let objsToAdd = delta.created // objects do be added to the stream
      if ( objsToAdd ) {
        let common = stream.objects.filter( obj => objsToAdd.map( e => e._id ).indexOf( obj._id.toString() ) !== -1 )
        if ( common.length != 0 )
        {
          // Check objects in stream. If there exist objects that have the same id of the `delta.created`, the delta is bad.
          throw new Error( "Bad delta. Some `delta.created` objects are existing in the original stream." )
        }
        let objs = await BulkObjectSave( objsToAdd, req.user )
        stream.objects = stream.objects.concat( objs.map( o => o._id ) )
      }

      let objsToDelete = delta.deleted // objects to be deleted from the stream
      if ( objsToDelete ) {
        let common = objsToDelete.filter( obj => stream.objects.map( e => e._id ).indexOf( obj._id.toString() ) !== -1 )
        if ( common.length != objsToDelete.length ) {
          // Check objects in stream. If any of the `delta.deleted` objects are not in the orignal stream, the delta is bad.
          throw new Error( "Bad delta. Some `delta.deleted` objects are not existing in the original stream." )
        }
        stream.objects = stream.objects.filter( obj => objsToDelete.map( e => e._id ).indexOf( obj._id.toString() ) === -1 )
      }
      await stream.save()
      res.send( { success: true, message: "Applied Delta Δ" } )
    }

  } catch ( err ) {
    //console.log( err )
    res.status( 400 )
    res.send( { success: false, message: JSON.stringify( err ) } )
  }
}