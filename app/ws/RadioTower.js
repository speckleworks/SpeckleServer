'use strict'
const winston     = require('winston')
const chalk       = require('chalk')

// essentially this can be an uncompleted comment

module.exports = {
  rooms: {},
  
  send( ws, message ) {
    // send message directly to ws? dis is stoopid yo dawgs, uai not use ws.send directly? as proper?
  },
  
  broadcast( room, message, senderSessionId ) {
    winston.debug( 'RadioTower broadcast to', room, 'from', senderSessionId, 'event:', message.eventName )
    if( ! this.rooms.hasOwnProperty( room ) ) return winston.error('Room not found: ', room)
    winston.debug( 'There are ', this.rooms[room].length, 'clients in this room  ')
    for( let myWs of this.rooms[room] ) {
      if( myWs.sessionId != senderSessionId ) 
        myWs.send( JSON.stringify( message ), error => {
          winston.error(error)
          console.log(message)
          winston.error('Error sending message to socket', myWs.sessionId )
        })
    }
  },
  
  join( room, ws ) {
    winston.debug( 'RadioTower room', room, 'joined by', ws.sessionId )
    if( ws.room ) 
      this.eject( ws.room, ws )
    if( this.rooms.hasOwnProperty( room ) ) 
      this.rooms[room].push( ws )
    else 
      this.rooms[room] = [ ws ]
    ws.room = room
    winston.debug( chalk.cyan.underline('Added ws ' + ws.sessionId + ' to room ' + room + '. There are now ' + this.rooms[room].length + ' clients there.') )
  },
  
  eject( room, ws ) {
    this.rooms[room].splice( this.rooms[room].indexOf( ws ), 1 )
    if( this.rooms[room].length === 0 )
      delete this.rooms[room]
  },
  purge( ws ) {
    for( let room in this.rooms )
      if( this.rooms.hasOwnProperty( room ) )
        this.rooms[room].splice( room.indexOf( ws ), 1)
  }
}