'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const radioTower = require( './RadioTower' )

module.exports = function( ws ) {
  let parent = ws
  return {
    'alive' ( ) {
      parent.alive = true
      parent.missedPingsCount = 0
    },

    'broadcast' ( message ) {
      winston.debug( chalk.blue( 'Volatile Broadcast from socket' ), parent.clientId, 'in streamId', parent.streamId )
      // console.log( message.args )
      console.log(message)
      // if ( !parent.authorised )
      //   return winston.error( 'Client ws not authorised to send messages.' )

      radioTower.broadcast( parent.streamId, message, parent.clientId )
    },

    'message' ( message ) {
      winston.debug( chalk.cyan( 'Volatile message from socket' ), parent.clientId, 'in streamId', parent.streamId )
      // if ( !parent.authorised )
      //   return winston.error( 'Client ws not authorised to send messages.' )
      console.log( message )
      radioTower.send( message.recipientId, message )
    }
  }
}