'use strict'
const winston     = require('winston')
const chalk       = require('chalk')

var ClientStore   = require('./ClientStore')

module.exports = {
  rooms: {},
  
  send( ws, message ) {
    // send message directly to ws? dis is stoopid yo dawgs, uai not use ws.send directly? as proper?
  },
  
  broadcast( room, message, senderSessionId ) {
    winston.debug( 'RadioTower broadcast to', room, 'from', senderSessionId, 'event:', message.eventName )
    for( let ws of ClientStore.clients ) {
      if( ws.sessionId != senderSessionId && ws.room === room ) 
        ws.send( JSON.stringify( message ) , error => {
          if( !error ) return
          winston.error( 'Something bad happened: ')
          winston.error( error )
        } )
    }
  },
  
  join( room, ws ) {
    winston.debug( 'RadioTower room', room, 'joined by', ws.sessionId )
    ws.room = room
  },

  getRooms() {
    let r = {}
    for(let ws of ClientStore.clients ) {
      if( r.hasOwnProperty( ws.room ) ) { 
        r[ws.room].num++
        r[ws.room].clients.push( { sessionId: ws.sessionId, role: ws.role } )
      }
      else {
        r[ws.room] = {
          num: 1, 
          clients: [ { sessionId: ws.sessionId, role: ws.role } ]
        }
      }
    }
    return r
  }
}