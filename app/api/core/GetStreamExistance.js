'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

const DataStream        = require('../../../models/DataStream')

module.exports = ( req, res ) => {
  let streamId = req.streamId
  winston.debug( chalk.white.underline( 'Checking if stream exists', streamId ) )
  DataStream.count( { streamId: streamId } )
    .then( count => {
      res.send( {found: count > 0 } )
    } )
    .catch( err => {
      res.send( { found: false } )
    })
}