const mongoose          = require( 'mongoose' )
const SpeckleObject     = require( '../../../models/SpeckleObject' )
const GeometryObject    = require( '../../../models/GeometryObject' )

const AssembleObjects   = require( '../helpers/AssembleObjects')

module.exports = ( req, res ) => {
  if( !req.body.objects ) { 
    res.status( 400 ) 
    return res.send( { success: false, message: 'No object id provided.' } )
  }
  if( ! req.body.objects instanceof Array ) {
    res.status( 400 )
    return res.send( { success: false, message: 'Request did not provide an array.' } )
  }

  let myObjects = []

  SpeckleObject.find( { _id: { $in: req.body.objects.map( o => mongoose.Types.ObjectId( o ) ) } }  ).lean()
  .then( objects => {
    if( !objects ) throw new Error( 'Database fail.' )
    myObjects = objects
    return AssembleObjects( myObjects )
  })
  .then( result => {
    if( !result ) throw new Error( 'Database fail.' )
    res.send( { success: true, speckleObjects: myObjects } )
  })
  .catch( err => {
    console.log( err )
    res.status( 400 )
    res.send( { success: false, message: err } )
  })
}