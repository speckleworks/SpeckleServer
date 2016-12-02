
var winston = require('winston')
var chalk =  require('chalk')
// essentially this can be 

module.exports = {
  rooms: {},
  
  send( ws, message ) {
    
  },
  
  broadcast( room, message, senderSessionId ) {
    console.log( message )
    console.log( senderSessionId )
  },
  
  join( room, ws ) {
    if( this.rooms.hasOwnProperty( room ) )
      this.rooms.room.push( ws )
    else 
      this.rooms.room = [ ws ]
    winston.debug( chalk.cyan.underline('Added ws ' + ws.sessionId + ' to room ' + room + '. There are now ' + this.rooms.room.length + ' clients there.') )
  },
  
  leave( room, ws ) {

  }
}