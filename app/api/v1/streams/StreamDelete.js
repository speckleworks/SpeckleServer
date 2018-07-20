'use strict'
const winston = require('winston')

const DataStream = require('../../../../models/DataStream')
const PermissionCheck = require('../middleware/PermissionCheck')

module.exports = (req, res) => {
  if (!req.params.streamId) {
    res.status(400)
    return res.send({ success: false, message: 'No stream id provided.' })
  }

  DataStream.findOne({ streamId: req.params.streamId })
    .then(stream => PermissionCheck(req.user, 'delete', stream))
    .then(stream => {
      return stream.remove()
    })
    .then(() => {
      return res.send({ success: true, message: 'Stream was deleted! Bye bye data.' })
    })
    .catch(err => {
      winston.error(err)
      res.status(err.message === 'Unauthorized. Please log in.' ? 401 : 404)
      res.send({ success: false, message: err.toString() })
    })
}
