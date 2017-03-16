'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const json2csv          = require('json2csv')

const DataStream        = require('../../../models/DataStream')
const HistoryInstance   = require('../../../models/HistoryInstance')

module.exports = ( req, res ) => {
  winston.debug( chalk.bgGreen( 'CSV Query', req.get('speckle-stream-id') ) )
  // if history id is not 'live', then i somehow need to populate 
  DataStream.findOne( { streamId: req.params.streamId }, '-owner -sharedWith' )
    .then( stream => {
      if( !stream ) throw new Error( 'No stream found' )
      if( req.params.historyId && stream.history.indexOf( req.params.historyId ) === -1 ) throw new Error( 'Requested history not part of this stream')
      return HistoryInstance.findOne( { _id: req.params.historyId ? req.params.historyId : stream.liveInstance } )
    })
    .then( historyInstance => {
      if( !historyInstance ) throw new Error( 'History instance not found.')
      
      for(let i = 0; i < historyInstance.objectProperties.length; i++ )
        historyInstance.objects[ historyInstance.objectProperties[i].objectIndex ].properties = historyInstance.objectProperties[i].properties

      for(let layer of historyInstance.layers) {
        for(let i = layer.startIndex; i < layer.objectCount; i++ )
          historyInstance.objects[ i ].layer = layer.name
      } 

      if( req.params.format === 'csv' )
        json2csv( { data: historyInstance.objects, flatten: true }, ( err, str ) => {
          if( err ) throw new Error('CSV conversion failed.')
          return res.send( str )
        } ) 
      else if( req.params.format === 'json' )
        return res.send( historyInstance.objects )
      else 
        throw new Error('Invalid format specified.')
    })
    .catch( errs => {
      res.status(404)
      res.send( { success: false, message: errs.toString(), streamId: req.streamId } )
    })  
}