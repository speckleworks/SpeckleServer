// Gently returns a merged array of stream layers.
// Behaviour: 
// If a layer is not present in the new list, it will be removed from the old list
// If a layer is present in the new list and old list, values will be updated (besides the guid)
// If a layer is present only in the new list, it is added.

module.exports = ( oldLayers, newLayers ) => {
  let layersToRemove = []
  for( let layer of oldLayers ) {
    let matchingLayer = newLayers.find( l => layer.guid === l.guid )
    if( matchingLayer )
      for( let key in matchingLayer )
        layer[ key ] = matchingLayer[ key ]
    else 
      layersToRemove.push( layer )
  }

  for( let layer of newLayers ) {
    let matchingOldLayer = oldLayers.find( l => l.guid === layer.guid )
    if( !matchingOldLayer ) oldLayers.push( layer )
  }

  let result = []
  for( let layer of oldLayers ) {
    let matchingLayer = layersToRemove.find( l => l.guid === layer.guid )
    if( !matchingLayer ) result.push( layer )
  }
  return result;
}