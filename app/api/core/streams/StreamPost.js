'use strict'
const winston           = require('winston')
const chalk             = require('chalk')
const shortId           = require('shortid')

const DataStream        = require('../../../../models/DataStream')

module.exports = ( req, res ) => {
  let stream = new DataStream( { owner: req.user._id, streamId: shortId.generate() } )
  stream.save()
  .then( stream => {
    winston.debug( 'Created stream', stream.streamId )
    return res.send( { success: true, message: 'Created stream.', stream: stream } )
  })
  .catch( err => {
    res.status( 400 )
    return res.send( { success: false, message: 'Failed to create stream.'} )
  })
}
