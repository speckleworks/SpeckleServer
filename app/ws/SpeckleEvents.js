'use strict'
const winston = require('winston')
const chalk   = require('chalk')
const radioTower = require('./RadioTower')

module.exports = function ( ws ) {
  let parent = ws
  return { 
    'alive'() {
      parent.alive = true
      parent.missedPingsCount = 0
    },
    'join-stream'( args ) {
      parent.role = args.role
      radioTower.join( args.streamid, parent )
    },
    'volatile-broadcast' ( args ) {
      winston.debug(chalk.blue('Volatile Broadcast from socket'), parent.sessionId, 'in room', parent.room)
      if( ! parent.authorised ) {
        return winston.error( 'Client ws not authorised to send messages.' )
      }
      let message = { eventName: 'volatile-broadcast', args: args }
      radioTower.broadcast( parent.room, message, parent.sessionId )
    },
    'volatile-message' ( args ) {
      winston.debug(chalk.cyan('Volatile message from socket'), parent.sessionId, 'in room', parent.room)
      if( ! parent.authorised ) {
        return winston.error( 'Client ws not authorised to send messages.' )
      }
      let message = { eventName: 'volatile-message', args: args.message }
      radioTower.send( args.recipient, message )
    }
  }
}