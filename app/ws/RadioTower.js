const winston = require('winston')
const chalk = require('chalk')
const redis = require('redis')

const ClientStore = require('./ClientStore')
const PermissionCheck = require('../api/v1/middleware/PermissionCheck')
const DataStream = require('../../models/DataStream')

module.exports = {
  subscriber: null,

  initRedis () {
    winston.debug(chalk.magenta('Initialising redis in radio tower.'))
    this.subscriber = redis.createClient(process.env.REDIS_URL)
    this.subscriber.subscribe('speckle-message')

    this.subscriber.on('message', (channel, message) => {
      message = JSON.parse(message)
      this.parseMessage(message.content)
        .then(parsedMessage => {
          if (this.events.hasOwnProperty(parsedMessage.eventName)) {
            // pass in  parsed message, raw (so we avoid a json stringify)  and the clientId of the publisher
            this.events[ parsedMessage.eventName ](parsedMessage, message.content, message.clientId)
          }
        })
        .catch(err => {
          winston.debug(err)
        })
    })
  },

  // tries to parse gracefully
  parseMessage (message) {
    return new Promise((resolve, reject) => {
      let parsedMessage
      try {
        parsedMessage = JSON.parse(message)
      } catch (err) {
        reject(err)
      }

      if (!parsedMessage.eventName) { reject(new Error('Malformed message: no eventName.')) }

      return resolve(parsedMessage)
    })
  },

  // sends a message object to all clients currently connected here
  announce (message) {
    winston.debug(chalk.bgRed('Server sending message to all clients'))
    for (let ws of ClientStore.clients) {
      ws.send(JSON.stringify(message))
    }
  },

  // holds all current top level ws events that speckle understands
  // the actual message, event type, info & etc. should be in message.args
  // What's what:
  // 1) message: sends direct messages between ws clients
  // 2) broadcast: broadcasts a message to a room (as defined by a streamId)
  // 3) join: client joins a new room (as defined by a streamId) if it has read permissions
  // 4) leave: client leaves a room (as defined by a streamId)
  events: {
    // sends a message to a ws with a specific session id
    message (message, raw, senderClientId) {
      winston.debug(`✉️ message to ${message.recipientId} from ${senderClientId}, ${message.args}`)
      if (!message.recipientId) { return winston.error('No recipientId provided.') }

      let recipient = ClientStore.clients.find(client => client.clientId === message.recipientId)
      if (!recipient) { return winston.error(`No ws with ${message.recipientId} found on pid ${process.pid}`) }

      recipient.send(raw)
    },

    // broadcasts a message to a streamId 'chat room'
    broadcast (message, raw, senderClientId) {
      winston.debug(`📣 broadcast in ${message.streamId} from ${senderClientId}: ${message.args}`)

      for (let ws of ClientStore.clients) {
        if (ws.clientId !== senderClientId && ws.rooms.indexOf(message.streamId) !== -1) { ws.send(raw) }
      }
    },

    // join a streamId "chat room"
    join (message, raw, senderClientId) {
      winston.debug(` ➕ join request for ${message.streamId} from ${senderClientId} in ${process.pid}`)

      let client = ClientStore.clients.find(cl => cl.clientId === senderClientId)
      if (!client) { return winston.debug(`No client with id ${senderClientId} found on this instance.`) }
      if (!message.streamId) { return winston.debug(`No streamId present, will not join anything.`) }

      DataStream.findOne({ streamId: message.streamId }, 'private canRead canWrite owner').lean()
        .then(stream => PermissionCheck({ _id: client.user._id }, 'read', stream))
        .then(() => {
          winston.debug(`Client ws joined ${message.streamId}`)
          if (client.rooms.indexOf(message.streamId) === -1) { client.rooms.push(message.streamId) } else { client.send('You already joined that room.') }
        })
        .catch(err => {
          winston.error('got an error on join')
          return winston.debug(`Error: ${err.toString()})`)
        })
    },

    // leaves a streamId "chat room"
    leave (message, raw, senderClientId) {
      // TODO
      let client = ClientStore.clients.find(cl => cl.clientId === senderClientId)
      if (!client) { return winston.debug(`No client with id ${senderClientId} found on this instance.`) }
      let roomIndex = client.rooms.indexOf(message.streamId)
      if (roomIndex !== -1) {
        client.rooms.splice(roomIndex, 1)
        winston.debug(`Client with id ${senderClientId} left  ${message.streamId}.`)
      }
    }
  }
}
