'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const crypto = require( 'crypto' )

// this is where we keep track on each process what clients are connected. 
module.exports = {
  clients: [ ],

  // adds a ws to the local store, and initialises a heartbeat pinger
  add( ws ) {
    // setup vars 
    ws.alive = true
    ws.missedPingsCount = 0

    // setup pinging system
    ws.pinger = setInterval( ws => {
      if ( !ws.alive ) {
        ws.missedPingsCount++
          if ( ws.missedPingsCount > 25 )
            ws.send( 'Warning: you missed 25 pings. 50 missed pings will get you kicked.' )
        if ( ws.missedPingsCount > 50 ) {
          winston.error( chalk.red( 'Removing client socket, missed too many pings.' ) )
          ws.send( 'You missed 50 pings. Bye!' )
          this.remove( ws )
          return
        }
        ws.alive = false
      }
      ws.alive = false
      ws.send( 'ping' )
    }, 10000, ws ) // ping every 10 seconds, after 500 seconds of no pingbacks we kick the socket

    // push to my amazing datastore
    this.clients.push( ws )
    winston.debug( chalk.blue( `There are now ${this.clients.length} ws clients in ${process.pid}: ${this.clients.map( cl => cl.clientId)}` ) )
  },

  remove( ws ) {
    // stop pinging this guy
    clearInterval( ws.pinger )
    // cut him out
    this.clients.splice( this.clients.indexOf( ws ), 1 )
    ws.close( )
    winston.debug( chalk.bgRed( 'Socket removed', ws.clientId ) )
    winston.debug( chalk.blue( `There are now ${this.clients.length} ws clients in ${process.pid}.` ) )
  }
}
