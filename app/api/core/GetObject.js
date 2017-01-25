'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const DataObject        = require('../../../models/DataObject')

module.exports = ( req, res ) => {
  let excludeString = ''
  if( req.query.excludeNative === '1' ) {
    excludeString += '-encodedValue '
  }
  if( req.query.excludeValue === '1') {
    excludeString += '-value '
  }

  winston.debug( chalk.bgGreen( 'Getting object from store.' ), req.query.hash, 'exclude string:', excludeString )
  
  DataObject.findOne( { hash: req.query.hash }, excludeString )
    .then( obj => {
      if( !obj ) {
        winston.debug( 'Failed to find object in db. Objecthash: ' + req.query.hash )
        return res.send( { success: false, message: 'Failed to find object.', objectHash: req.query.hash } ) 
      }
      return res.send( { success: true, obj: obj })
    })
    .catch( err => {
      return res.send( { success: false, message: 'Failed to find object.', objectHash: req.query.hash } )
    })
}