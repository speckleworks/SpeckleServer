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
    if ( delta.revision_A.id != stream.streamId ) {
      throw new Error("Mismatched revision/streamId.")
    } else {
  
      // objects do be added to the stream
      let objsToAdd = delta.delta.created
      for (i = 0; i < objsToAdd.length; i++) {      
        let objToAdd = objsToAdd[i]
        // adds object to the stream's objects field
        if (stream.objects.indexOf(objToAdd._id) === -1) { // check if object does NOT exist in the stream
          console.log("This object needs to be created.")
          stream.objects.push(objToAdd)
          await stream.save()
        } else {
          // BAD DELTA CHECK
          console.log("Bad delta")
          throw new Error("Bad delta. Some delta.created objects are existing in the original stream")
        }
      }

      // objects to be deleted from the stream
      let objsToDelete = delta.delta.deleted
      for (i = 0; i < objsToDelete.length; i++) {
        let objToDelete = objsToDelete[i]
        // removes object from the stream's objects field
        if (stream.objects.indexOf(objToDelete._id) !== -1) { // check if object exists in the stream
          console.log("This object needs to be removed.")
          removeAllElements(stream.objects, objToDelete._id)
          await stream.save()
        } else {
          // BAD DELTA CHECK
          console.log("Bad delta")
          throw new Error("Bad delta. Some delta.deleted objects are not exsiting in the original stream.")
        }
      }

      //console.log( stream )
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