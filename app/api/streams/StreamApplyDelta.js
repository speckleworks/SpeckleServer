const _ = require( 'lodash' )
const DataStream = require( '../../../models/DataStream' )
const shortId = require( 'shortid' )
const mongoose = require( 'mongoose' )

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
      console.log("Cannot apply delta to stream. abort mission")
    } else {
      console.log("All good, delta will be applied to the stream.")
      
      // objects do be added to the stream
      let objsToAdd = delta.delta.created

      for (i = 0; i < objsToAdd.length; i++) {      
        let objToAdd = objsToAdd[i]
        // adds object to the stream's objects field
        if (stream.objects.indexOf(objToAdd) < 0) { // check if object does NOT exist in the stream
          console.log("This object needs to be created.")
          stream.objects.push(objToAdd)
          await stream.save()
        }
      }

      // objects to be deleted from the stream
      let objsToDelete = delta.delta.deleted
      
      for (i = 0; i < objsToDelete.length; i++) {
        
        let objToDelete = objsToDelete[i]

        // remove object from db
        // SpeckleObject.findOne( { _id: objToDelete } )
        // .then( obj => PermissionCheck( req.user, 'delete', obj ) )
        // .then( obj => obj.remove() )
        // .then( () => {
        //   console.log('Object was deleted. Bye bye data.')
        //   return res.send( { success: true, message: 'Object was deleted. Bye bye data.' } )
        // } )
        // .catch( err => {
        //   winston.error( JSON.stringify( err ) )
        //   res.status( err.message === 'Unauthorized. Please log in.' ? 401 : 404 )
        //   res.send( { success: false, message: err.toString() } )
        // } )
        
        // removes object from the stream's objects field
        if (stream.objects.indexOf(objToDelete) >= 0) { // check if object exists in the stream
          console.log("This object needs to be removed.")
          removeAllElements(stream.objects, objToDelete)
          await stream.save()
        }
      }

      // common objects - leave it as it is
      let commonObjs = delta.delta.common
    }
  
  res.send( { success: true, clone: result, parent: parent } )
  res.send( { success: true } )

  } catch (err) {
    
    res.status( 400 )
    res.send( { success: false, message: JSON.stringify(err) } )
  }
}