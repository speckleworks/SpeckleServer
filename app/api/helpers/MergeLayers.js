module.exports = ( oldLayers, newLayers ) => {
  
  let layersToKeep = [], layersToRemove = [], layersToAdd = []
  let layersModified = []

  for( let layer of oldLayers ) {
    let matchingLayer = newLayers.find( l => layer.guid === l.guid )
    if( matchingLayer ) {
      layersModified.push( layer )
      for( let key in matchingLayer )
        layer[ key ] = matchingLayer[ key ]
    }
    else // means we are not in the new array of layers, so we need to be removed
      layersToRemove.push( layer )
  }

  for( let layer of newLayers ) {
    let matchingOldLayer = oldLayers.find( l => l.guid === layer.guid )
    if( !matchingOldLayer ) 
      oldLayers.push( layer )
  }

  let result = []
  for( let layer of oldLayers ) {
    let matchingLayer = layersToRemove.find( l => l.guid === layer.guid )
    if( !matchingLayer ) result.push( layer )
  }
  console.log( result.map( l => l.name ) )
  return result;
}