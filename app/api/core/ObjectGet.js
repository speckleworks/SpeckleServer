const SpeckleObject     = require( '../../../models/SpeckleObject' )
const GeometryObject    = require( '../../../models/GeometryObject' )

module.exports = ( req, res ) => {
  if( !req.params.objectId ) { 
    res.status(400) 
    return res.send( { success: false, message: 'No object id provided.' } )
  }

  let myObject = {}

  SpeckleObject.findOne( { _id: req.params.objectId }  )
  .then( object => {
    if( !object ) throw new Error( 'Database fail.' )
    myObject = object
 
    if ( ! ( myObject.type === 'Mesh' || myObject.type ==='Brep' || myObject.type === 'Curve' || myObject.type === 'Polyline' ) )
      res.send( { success: true, speckleObject: myObject } )
    else return GeometryObject.findOne( { hash: myObject.hash } ).lean()
  })
  .then( result => {
    if( !result ) throw new Error( 'Database fail.' )
    result.properties = myObject.properties
    res.send( { success: true, speckleObject: result } )
  })
  .catch( err => {
    console.log( err )
    res.status( 400 )
    res.send( { success: false, message: err } )
  })
}