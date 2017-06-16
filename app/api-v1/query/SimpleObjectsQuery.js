const winston           = require('winston')
const chalk             = require('chalk')

const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => { 
  console.log( req.params.index )
  HistoryInstance.findOne( { _id: req.params.historyId } )
  .then( history => {
    if( !history )
      throw 'Failed to find history instance'

    history.objectProperties.forEach( prop => history.objects[ prop.objectIndex ].properties = prop )

    if( ! req.params.index )
      return res.send( history.objects )
    
    if( req.params.index === 'all' )
      return res.send( history.objects )
    
    if( history.objects.length - 1 > parseInt( req.params.index ) )
      return res.send( history.objects[ parseInt( req.params.index ) ] )

    throw 'Out of bounds'
  })
  .catch( err => {
    res.status( 400 )
    res.send( { success: false, error: err } )
  }) 
}
