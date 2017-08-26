const mongoose            = require( 'mongoose' )
const GeometryObject      = require( '../../../models/GeometryObject' )

module.exports = ( objArray ) => new Promise( ( resolve, reject ) => { 
  let geometriesToRequest = []
  let geometries = []

  // creates a list of geometries to request
  let iterate = obj => {
    if( !obj ) return 
    if( obj.type ) {
      if( obj.type === 'Mesh' || obj.type === 'Brep' || obj.type === 'Curve' || obj.type === 'Polyline' ) {
        geometriesToRequest.push( { geometryHash: obj.geometryHash }  )
      }
      return iterate( obj.properties ) // will hit the null check and return
    }
    for( let key in obj ){
      if( typeof obj[ key ] === 'object' && ! ( obj [ key ] instanceof Array ) )
        iterate( obj[ key ] )
    }
  }

  // populates the objects with the retrieved geometries
  let assemble = obj => {
    if( !obj ) return 
    if( obj.type ) {
      if( obj.type === 'Mesh' || obj.type === 'Brep' || obj.type === 'Curve' || obj.type === 'Polyline' ) {
        var fg = geometries.find( g => g.geometryHash === obj.geometryHash )
        if( !fg ) obj.error = 'Failed to retrieve geometry.'
        for( let key in fg ) 
          if( key !== '_id' ) obj[ key ] = fg [ key ] // monster bug avoided
      }
      return assemble( obj.properties )
    }
    for( let key in obj )
      if( typeof obj[ key ] === 'object' && ! ( obj [ key ] instanceof Array ) )
        assemble( obj[ key ] )
  }

  if( ! objArray ) reject( new Error( 'Assemble object: null args.' ) )
  if( ! ( objArray instanceof Array ) ) reject( new Error( 'Assemble object: args not array.' ) )

  objArray.forEach( o => iterate( o ) )
  
  // because we don't enforce unique hashes anymore, this query has a rather big result. 
  // maaaybe we should do a promise.all(  geoms.map( xx => .findOne( ) ) ), but then how is the result collated?
  GeometryObject.find( { 'geometryHash': { $in: geometriesToRequest.map( xx => xx.geometryHash ) } } ).lean()
  .then( result => {
    geometries = result
    objArray.forEach( o => assemble( o ) )
    resolve( objArray )
  })
  .catch( error => {
    reject( error ) // debug for nested promises
  })  
} )