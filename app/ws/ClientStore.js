'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const crypto = require( 'crypto' )

module.exports = {
  clients: [ ],

  add( ws ) {
    // setup vars 
    ws.alive = true
    ws.missedPingsCount = 0

    // setup pinging system
    ws.pinger = setInterval( ws => {
      if ( !ws.alive ) {
        ws.missedPingsCount++
        winston.error( chalk.bgBlue( 'socket missed pings: ' + ws.missedPingsCount ), ws.clientId )
        if ( ws.missedPingsCount > 20 )
          winston.error( chalk.bgRed( 'TODO: Kicking client socket, missed too many pings: ' + ws.missedPingsCount ), ws.clientId )
        ws.alive = false
      }
      ws.alive = false

      ws.send( 'ping' )
    }, 1000 * 10, ws )

    // push to my amazing datastore
    this.clients.push( ws )
    winston.debug( chalk.blue.underline( 'WS CONN: Online clients: ' + this.clients.length ) )
  },

  remove( ws ) {
    // stop pinging this guy
    clearInterval( ws.pinger )

    // cut him out
    this.clients.splice( this.clients.indexOf( ws ), 1 )

    // announce to the world
    winston.debug( chalk.blue.underline( 'WS CLOSE: Client ' + ws.clientId + ' was disconnected' ) )
    winston.debug( chalk.blue.underline( 'Online clients: ' + this.clients.length ) )
  }
}