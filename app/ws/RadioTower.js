'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const redis = require( 'redis' )

const CONFIG = require( '../../config' )
var ClientStore = require( './ClientStore' )

module.exports = {
  subscriber: null,

  initRedis( ) {
    winston.debug( chalk.magenta( 'Initialising redis in radio tower.' ) )
    this.subscriber = redis.createClient( CONFIG.redis.url )
    this.subscriber.subscribe( 'speckle-message' )

    this.subscriber.on( 'message', ( channel, message ) => {
      this.parseMessage( message )
        .then( parsedMessage => {
          if( this.events.hasOwnProperty( parsedMessage.eventName ) ) 
            this.events[ parsedMessage.eventName ]( parsedMessage, message )
        } )
        .catch( err => {
          winston.debug( err )
        } )
    } )
  },

  parseMessage( message ) {
    return new Promise( ( resolve, reject ) => {
      let parsedMessage
      try {
        parsedMessage = JSON.parse( message )
      } catch ( err ) {
        return reject( 'Failed to parse message: ' + err )
      }

      if ( !parsedMessage.eventName )
        return reject( 'Malformed message: no eventName.' )

      return resolve( parsedMessage )
    } )
  },

  // sends a message object to all clients currently connected here
  announce( message ) {
    winston.debug( chalk.bgRed( 'Server sending message to all clients' ) )
    for ( let ws of ClientStore.clients ) {
      ws.send( JSON.stringify( message ) )
    }
  },

  events: {
    // sends a message to a ws with a specific session id 
    message( message, raw ) {
      winston.debug( `✉️ message to ${message.recipientId}, ${message.args}` )
      if ( !wsSessionId )
        return winston.error( 'No wsSessionId provided [RadioTower.send]' )

      let recipient = ClientStore.clients.find( client => client.clientId === wsSessionId )
      if ( !recipient ) {
        if ( !stopRedisPropagation ) this.publisher.publish( 'ws-message', JSON.stringify( { sessionId: wsSessionId, message: message } ) )
        return winston.error( 'No ws with that session id found [RadioTower.send]', wsSessionId )
      }

      recipient.send( JSON.stringify( message ) )
    },

    // broadcasts a message to a streamId 'chat room'
    broadcast( message, raw ) {
      winston.debug( `📣 broadcast in ${message.streamId}, ${message.args}` )

      for ( let ws of ClientStore.clients ) {
        if ( ws.clientId != message.senderId && ws.streamId === message.streamId )
          ws.send( raw )
      }
    },

    // join a streamId "chat room"
    join( message ) {
      // NEEDS AUTHENTICATION CHECK!
      // Flow: 
      // Get streamId
      // if ws.userId == null check if stream is public
      // or just the user permission checker
      winston.debug( 'RadioTower streamId', streamId, 'joined by', ws.clientId )
      ws.streamId = streamId
    },

    // leaves a streamId "chat room"
    leave( message ) {
      // TODO
    }
  }
}