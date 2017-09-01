
const mmh3              = require( 'murmurhash3' ).murmur128HexSync

module.exports = ( objArray ) => new Promise( ( resolve, reject ) => {
  let geometries = []
  let stack = 0
  let iterate = ( obj ) => {
    if( !obj ) return
    if( obj.hasOwnProperty( 'type' ) ) {     
      if( obj.type === 'Mesh' || obj.type === 'Brep' || obj.type === 'Curve' || obj.type === 'Polyline' ) {
        let clone = JSON.parse( JSON.stringify( obj ) )
        delete clone.properties
        geometries.push( clone )
        delete obj.colors
        delete obj.vertices
        delete obj.faces
        delete obj.value
        delete obj.displayValue
        delete obj.provenance
        delete obj.base64
      }
      return iterate( obj.properties )
    }
    for(let key in obj) {
      if( typeof obj[ key ] === 'object' && !( obj[key] instanceof Array ) )
        iterate( obj[ key ] )
    }  
  }
  try {
    if( objArray instanceof Array)
      objArray.forEach( myobj => { 
        iterate( myobj ) 
      } )
    else {
      iterate( objArray )
    }
    let result = { geometries: geometries, parsedObj: objArray instanceof Array ? objArray : [ objArray ] }
    resolve( result )
  } catch ( err ) { 
    reject( err )
  }
} )