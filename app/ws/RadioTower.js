'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const redis = require( 'redis' )

const CONFIG = require( '../../config' )
var ClientStore = require( './ClientStore' )

module.exports = {
  publisher: null,
  subscriber: null,

  initRedis( ) {
    winston.debug( chalk.magenta( 'Initialising redis in radio tower.' ) )
    this.publisher = redis.createClient( CONFIG.redis.url )
    this.subscriber = redis.createClient( CONFIG.redis.url )

    this.subscriber.subscribe( 'ws-broadcast' )
    this.subscriber.subscribe( 'ws-message' )

    this.subscriber.on( 'message', ( channel, message ) => {
      let parsedMessage = JSON.parse( message )
      switch ( channel ) {
        case 'ws-broadcast':
          this.broadcast( parsedMessage.streamId, parsedMessage.message, parsedMessage.senderSessionId, true )
          break
        case 'ws-message':
          this.send( parsedMessage.wsSessionId, parsedMessage.message, true )
          break
        default:
          winston.debug( 'Unkown event type in redis pub sub received.' )
          break
      }
    } )

    this.publisher.on( 'connect', ( ) => {
      winston.debug( chalk.blue( 'Connected to redis.' ) )
    } )
  },

  announce( message ) {
    winston.debug( chalk.bgRed( 'Server sending message to all clients' ) )
    for ( let ws of ClientStore.clients ) {
      ws.send( JSON.stringify( message ) )
    }
  },

  send( wsSessionId, message, stopPropagation ) {
    if ( !wsSessionId )
      return winston.error( 'No wsSessionId provided [RadioTower.send]' )
    let recipient = ClientStore.clients.find( client => client.clientId === wsSessionId )
    if ( !recipient ) {
      if ( !stopPropagation ) this.publisher.publish( 'ws-message', JSON.stringify( { sessionId: wsSessionId, message: message } ) )
      return winston.error( 'No ws with that session id found [RadioTower.send]', wsSessionId )
    }

    recipient.send( JSON.stringify( message ) )
  },

  broadcast( streamId, message, senderSessionId, stopPropagation ) {
    if ( !stopPropagation )
      this.publisher.publish( 'ws-broadcast', JSON.stringify( { streamId: streamId, message: message, senderSessionId: senderSessionId } ) )

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
  }
}
