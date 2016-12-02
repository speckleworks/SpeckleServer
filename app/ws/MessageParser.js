var winston       = require('winston')
var chalk         = require('chalk')

var radioTower    = require('./RadioTower')


module.exports = function( message, ws ) {
  if ( !message ) return winston.error( chalk.bgRed('Parse message was called w/o a message.') )
  
  // respond to pings
  if( message === 'alive') {
    winston.debug('received alive message from socket ', ws.sessionId)
    ws.alive = true
    ws.missedPingsCount = 0
    return
  }

  // parse the message
  var parsedMessage = JSON.parse( message )
  
  // errors
  if( !parsedMessage.eventName) 
    return winston.error( chalk.bgRed('Parse message was called w/o a event name.') )
  
  // distributor
  if( events.hasOwnProperty( parsedMessage.eventName ) )
    events[ parsedMessage.eventName ]( parsedMessage.args, ws )
  else 
    events[ 'default' ]( parsedMessage.eventName )
}

// split to new file
const events = {
  'join-stream' ( args, ws ) {
    // args in this case is just the streamId
    radioTower.join( args, ws)
  },
  'metadata-updated' ( args ) {
    winston.debug('stream-updated')
    
  },
  'stream-history-updated' ( args ) {
      
  },
  'request-compute-instance' ( args ) {

  },
  'request-precompute-instance' ( args ) {

  },
  // here we go, don't know what to doooooo
  default ( eventName ) {
    winston.error( chalk.bgBlue( 'Unkown message type: ' + eventName ) )
  }
}