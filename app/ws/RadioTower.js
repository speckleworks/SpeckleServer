const winston = require( '../../config/logger' )
const chalk = require( 'chalk' )
const redis = require( 'redis' )

const ClientStore = require( './ClientStore' )
const PermissionCheck = require( '../api/middleware/PermissionCheck' )
const GetResourceByType = require( '../api/middleware/GetResourceByType' )

const DataStream = require( '../../models/DataStream' )

module.exports = {
  subscriber: null,

  initRedis( ) {
    winston.debug( chalk.magenta( 'Initialising redis in radio tower.' ) )
    this.subscriber = redis.createClient( process.env.REDIS_URL )
    this.subscriber.subscribe( 'speckle-message' )

    this.subscriber.on( 'message', ( channel, message ) => {
      if ( channel === 'speckle-message' ) {
        message = JSON.parse( message )
        this.parseMessage( message.content )
          .then( parsedMessage => {
            if ( this.events.hasOwnProperty( parsedMessage.eventName ) ) {
              // pass in  parsed message, raw (so we avoid a json stringify)  and the clientId of the publisher
              this.events[ parsedMessage.eventName ]( parsedMessage, message.content, message.clientId )
            }
          } )
          .catch( err => {
            winston.error( JSON.stringify( err ) )
          } )
      }
    } )
  },

  // tries to parse gracefully
  parseMessage( message ) {
    return new Promise( ( resolve, reject ) => {
      let parsedMessage
      try {
        parsedMessage = JSON.parse( message )
      } catch ( err ) {
        return reject( new Error( 'Failed to parse ws message.' ) )
      }
      // console.log(parsedMessage)
      if ( !parsedMessage.eventName ) { return reject( new Error( 'Malformed message: no eventName.' ) ) }

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

  // Holds all current top level ws events that speckle understands.
  // The actual message, client-facing event type, info & etc.
  // should be in **message.args**.
  // NB: A room is defined by a resourceType (can be project, stream, etc.) and
  // a resourceId (its database id, or in the case of streams, its streamId).
  // Thereafter the roomName is constructed as `${resourceType}-${resourceId}.
  // What's what:
  // 1) message: sends direct messages between ws clients, based on their client id.
  // 2) broadcast: broadcasts a message to a room.
  // 3) join: client joins a new room if it has read permissions on that resource.
  // 4) leave: client leaves a room.
  events: {
    // sends a message to a ws with a specific session id
    message( message, raw, senderClientId ) {
      winston.debug( `✉️ message to ${message.recipientId} from ${senderClientId}, ${message.args}` )
      if ( !message.recipientId ) { return winston.error( 'No recipientId provided.' ) }

      let recipient = ClientStore.clients.find( client => client.clientId === message.recipientId )
      if ( !recipient ) { return winston.error( `No ws with ${message.recipientId} found on pid ${process.pid}` ) }

      recipient.send( raw )
    },

    // Broadcasts a message to a 'chat room'. See description above on how a room is defined.
    broadcast( message, raw, senderClientId ) {
      let roomName = ''
      if ( message.streamId && message.streamId.trim( ) !== '' ) {
        roomName = `stream-${message.streamId}`
      } else if ( !( !message.resourceId || !message.resourceType ) ) {
        roomName = `${message.resourceType}-${message.resourceId}`
      }

      if ( roomName === '' ) {
        return winston.debug( `Failed to deliver broadcast from ${senderClientId} (no room name).` )
      }
      winston.debug( `📣 broadcast in ${roomName} from ${senderClientId}` )
      for ( let ws of ClientStore.clients ) {
        if ( ws.clientId !== senderClientId && ws.rooms.indexOf( roomName ) !== -1 ) { ws.send( raw ) }
      }
    },

    // Join a "chat room". See description above on how a room is defined.
    join( message, raw, senderClientId ) {
      winston.debug( ` ➕ join request from ${senderClientId} in ${process.pid}` )

      let client = ClientStore.clients.find( cl => cl.clientId === senderClientId )
      if ( !client ) { return winston.debug( `No client with id ${senderClientId} found in pid ${process.pid} (this is fine, it might be on another pid).` ) }

      // If a streamId argument is present, join that specific streamId room proper
      // This is for backwards compatibility, as the .NET clients implement this as such
      // In the future, all should switch to the "else" part below
      if ( message.streamId && message.streamId.trim( ) !== '' ) {
        let roomName = `stream-${message.streamId}`
        DataStream.findOne( { streamId: message.streamId }, 'private canRead canWrite owner' ).lean( )
          .then( stream => {
            if ( !stream.private ) return true
            if ( !client.user._id || client.user._id === '' ) throw new Error( 'oups' )
            return PermissionCheck( { _id: client.user._id }, 'read', stream )
          } )
          .then( ( ) => {
            winston.debug( `Client ws joined ${roomName}` )
            if ( client.rooms.indexOf( roomName ) === -1 ) { client.rooms.push( roomName ) } else { client.send( 'You already joined that room.' ) }
          } )
          .catch( err => {
            winston.error( 'got an error on join: ' + err.message )
            client.send( `Failed to join room ${roomName}` )
            return winston.debug( `Error: ${err.toString()})` )
          } )
      } else if ( message.resourceId && message.resourceId.trim( ) !== '' && message.resourceType && message.resourceId.trim( ) !== '' ) {
        GetResourceByType( message.resourceType, message.resourceId )
          .then( resource => {
            if ( !resource.private ) return true
            if ( resource.private && client.authorised )
              return PermissionCheck( { _id: client.user._id }, 'read', resource )
            else {
              client.send( 'You are an anonymous client. You cannot access this resource.' )
              throw new Error( 'Anonymous room join for private resource.' )
            }
          } )
          .then( ( ) => {
            if ( client.rooms.indexOf( `${message.resourceType}-${message.resourceId}` ) === -1 ) {
              winston.debug( `${client.clientId} joined room ${message.resourceType}-${message.resourceId}.` )
              client.rooms.push( `${message.resourceType}-${message.resourceId}` )
              client.send( JSON.stringify( { message: 'Room joined.', roomName: `${message.resourceType}-${message.resourceId}` } ) )
            } else {
              client.send( 'You already joined that room.' )
            }
          } )
          .catch( err => {
            client.send( err.message )
            winston.error( `WS join room: ` + err.message )
          } )
      }
    },

    // Leaves a "chat room". See description above on how a room is defined.
    leave( message, raw, senderClientId ) {
      // TODO
      let client = ClientStore.clients.find( cl => cl.clientId === senderClientId )
      if ( !client ) { return winston.debug( `No client with id ${senderClientId} found in pid ${process.pid} (this is fine, it might be on another pid).` ) }

      // again, backwards compatibility
      if ( message.streamId ) message.roomName = `stream-${message.streamId}`
      // just in case, if no room name, assemble it from resourceid and resource type
      if ( !message.roomName && message.resourceId && message.resourceId.trim( ) !== '' && message.resourceType && message.resourceId.trim( ) !== '' )
        message.roomName = `${message.resourceType}-${message.resourceId}`
      // if still no room  name, exit left
      if ( !message.roomName ) return winston.error( `No roomName specified from client ${client.clientId}.` );

      let roomIndex = client.rooms.indexOf( message.roomName )
      if ( roomIndex !== -1 ) {
        client.rooms.splice( roomIndex, 1 )
        winston.debug( `Client with id ${senderClientId} left  ${message.roomName}.` )
      }
    },
  }
}
