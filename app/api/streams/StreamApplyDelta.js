const _ = require( 'lodash' )
const shortId = require( 'shortid' )
const mongoose = require( 'mongoose' )

const BulkObjectSave = require( '../middleware/BulkObjectSave' )
const DataStream = require( '../../../models/DataStream' )



function removeAllElements(array, elem) {
  var index = array.indexOf(elem);
  while (index > -1) {
      array.splice(index, 1);
      index = array.indexOf(elem);
  }
}

module.exports = async ( req, res ) => {
  
  try {
    // Create a clone
    let stream = await DataStream.findOne({ streamId: req.params.streamId } )
    
    let clone = new DataStream( stream )
    
    clone._id = mongoose.Types.ObjectId()
    clone.streamId = shortId.generate()
    clone.parent = stream.streamId
    clone.children = [ ]
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
      clone.canWrite = [ ]
    }

    stream.children.push( clone.streamId )
    clone.isNew = true
    
    await stream.save()
    await clone.save()

    // APPLY DELTA on the original stream

    let delta = req.body
    console.log(delta.revision_A)

    //checks if delta can be applied. We have to make sure that the streamId of original stream should be the same as revision_A id.
    if ( delta.revision_A != stream.streamId ) {
      console.log("Meeep - mismatched versions")
      throw new Error("Mismatched revision/streamId.")
    } else {
  
      if( delta.created ) {

        let common = stream.objects.filter( obj => delta.created.indexOf(obj._id.toString()) !== -1 )

        if(common.length != 0)
        {
          // TODO: Finish BAD DELTA check
         // Check objects in stream. If there exist objects that have the same id of the `delta.created`, the delta is bad.

          console.log("Bad delta")
          throw new Error("Bad delta")
        }

        console.log( delta.created )
        let objs = await BulkObjectSave(delta.created, req.user)
        stream.objects = new Set( [...stream.objects, ...objs.map( o => o._id.toString() ) ])
      }

      // objects to be deleted from the stream
      if(delta.deleted){
        // TODO: Finish BAD DELTA check
        // Check objects in stream. If any of the `delta.deleted` objects are not in the stream, the delta is bad.
        let objsToDelete = delta.deleted
        stream.objects = stream.objects.filter( obj => delta.deleted.indexOf(obj._id.toString()) !== -1 )
      }

      console.log( stream )

      await stream.save()

      // common objects - leave it as it is
      // let commonObjs = delta.common
      res.send( { success: true, message:"applied delta" } )

    }


  } catch (err) {
    console.log(err)
    res.status( 400 )
    res.send( { success: false, message: JSON.stringify(err) } )
  }
}