'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

module.exports = ( req, res, next ) => {
  let streamId = req.get( 'speckle-stream-id' ) == null ? req.query.streamId : req.get( 'speckle-stream-id' )
  if( !streamId ) {
    winston.debug( chalk.bgRed( 'No streamId provided. This route requires a streamId to work.' ) )
    return res.send( {success: false, message: 'No streamId provided. Did you set up your headers right?' } )
  }
  req.streamId = streamId
  next()
}