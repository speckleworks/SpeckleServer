const SpeckleObject     = require( '../../../../models/SpeckleObject' )
const GeometryObject    = require( '../../../../models/GeometryObject' )

const AssembleObjects   = require( '../../helpers/AssembleObjects')

module.exports = ( req, res ) => {
  if( !req.params.objectId ) { 
    res.status(400) 
    return res.send( { success: false, message: 'No object id provided.' } )
  }

  console.log( req.query )
  
  let fieldsToPopulate = ''
  if( req.query.values ) {
    req.query.values.split(',').forEach( str => {
      fieldsToPopulate += str + ' '
    })
  }
  console.log( fieldsToPopulate )
  let myObject = {}

  SpeckleObject.findOne( { _id: req.params.objectId }, fieldsToPopulate ).lean()
  .then( object => {
    if( !object ) throw new Error( 'Database fail.' )
    myObject = object
    return AssembleObjects( [ myObject ] )
  })
  .then( result => {
    if( !result ) throw new Error( 'Database fail.' )
    result[ 0 ].properties = myObject.properties
    res.send( { success: true, speckleObject: result[ 0 ] } )
  })
  .catch( err => {
    console.log( err )
    res.status( 400 )
    res.send( { success: false, message: err } )
  })
}