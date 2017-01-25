'use strict'
const winston = require('winston')
const chalk   = require('chalk')
const radioTower = require('./RadioTower')

module.exports = function ( ws ) {
  let parent = ws
  return { 
    'alive'() {
      winston.debug('received alive message from socket', parent.sessionId, Date.now() )
      parent.alive = true
      parent.missedPingsCount = 0
    },
    'join-stream'( args ) {
      // console.log(args)
      parent.role = args.role
      radioTower.join( args.streamid, parent )
    },
    'volatile-message' ( args ) {
      // console.log(args)
      winston.debug('received volatile message from socket', parent.sessionId)
      console.log( args )
      let message = { eventName: 'volatile-message', args: args }
      radioTower.broadcast( ws.room, message, ws.sessionId )
    }
  }
}