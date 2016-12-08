const winston   = require('winston')
const chalk     = require('chalk')

const crypto    = require('crypto')
// essentially this can be ???

module.exports = {
  clients: [],
  
  add( ws ) {
    // setup vars 
    ws.authorized = true
    ws.alive = true
    ws.missedPingsCount = 0
    ws.sessionId = crypto.randomBytes( 10 ).toString( 'hex' )
    ws.send( JSON.stringify( { eventName: 'ws-session-id', sessionId: ws.sessionId } ) )

    // setup pinging system
    ws.pinger = setInterval( ws => { 
      if( ! ws.alive ) {
        ws.missedPingsCount ++ 
        winston.error( chalk.bgBlue( 'socket missed pings: ' + ws.missedPingsCount ), ws.sessionId )
        if( ws.missedPingsCount > 10 ) 
          winston.error( chalk.bgRed( 'TODO: kicking socket, missed too many pings: ' + ws.missedPingsCount ), ws.sessionId )
      } 
      ws.alive = false
      ws.ping()
    }, 1000 * 30, ws )

    // push to my amazing datastore
    this.clients.push( ws )
    winston.debug( chalk.blue.underline( 'WS CONN: Online clients: ' + this.clients.length ) )
  },
  
  remove( ws ) {
    // stop pinging this guy
    clearInterval( ws.pinger )

    // cut him out
    this.clients.splice( this.clients.indexOf(ws), 1 )

    // announce to the world
    winston.debug( chalk.blue.underline('WS CLOSE: Client ' + ws.sessionId + ' was disconnected' ) )
    winston.debug( chalk.blue.underline( 'Online clients: ' + this.clients.length ) )
  }
}