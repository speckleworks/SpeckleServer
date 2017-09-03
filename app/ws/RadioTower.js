'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

var ClientStore = require( './ClientStore' )

module.exports = {
  streamIds: {},
  announce( message ) {
    winston.debug( chalk.bgRed( 'Server sending message to all clients' ) )
    for ( let ws of ClientStore.clients ) {
      ws.send( JSON.stringify( message ) )
    }
  },

  send( wsSessionId, message ) {
    winston.debug( chalk.green('recipient: ', wsSessionId ) ) 
    if ( !wsSessionId )
      return winston.error( 'No wsSessionId provided [RadioTower.send]' )
    let recipient = ClientStore.clients.find( client => client.clientId === wsSessionId )
    if ( !recipient )
      return winston.error( 'No ws with that session id found [RadioTower.send]', wsSessionId )

    recipient.send( JSON.stringify( message ) )
  },

  broadcast( streamId, message, senderSessionId ) {
    winston.debug( 'RadioTower broadcast to', streamId, 'from', senderSessionId, 'event:', message.eventName )

    for ( let ws of ClientStore.clients ) {
      if ( ws.clientId != senderSessionId && ws.streamId === streamId )
        ws.send( JSON.stringify( message ), error => {
          if ( !error ) return
          winston.error( error )
        } )
    }
  },

  join( streamId, ws ) {
    winston.debug( 'RadioTower streamId', streamId, 'joined by', ws.clientId )
    ws.streamId = streamId
  },

  getstreamIds( ) {
    let r = {}
    for ( let ws of ClientStore.clients ) {
      if ( r.hasOwnProperty( ws.streamId ) ) {
        r[ ws.streamId ].num++
          r[ ws.streamId ].clients.push( { clientId: ws.clientId, role: ws.role } )
      } else {
        r[ ws.streamId ] = {
          num: 1,
          clients: [ { clientId: ws.clientId, role: ws.role } ]
        }
      }
    }
    return r
  }
}