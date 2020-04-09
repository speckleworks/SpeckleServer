const winston = require( '../../config/logger' )
const chalk = require( 'chalk' )
const redis = require( 'redis' )
const mongoose = require( 'mongoose' )
// this is where we keep track on each process what clients are connected.
module.exports = {
  clients: [ ],

  redisClient: redis.createClient( process.env.REDIS_URL ),
  // adds a ws to the local store, and initialises a heartbeat pinger
  add( ws ) {
    this.redisClient.get( ws.clientId, ( err, reply ) => {
      if ( reply !== null ) {
        let attemptedId = ws.clientId
        ws.clientId = mongoose.Types.ObjectId( ).toString( )
        ws.send( JSON.stringify( { message: 'Warning: this client is open in another file.', newId: ws.clientId } ) )
        winston.debug( `duplicate client id found (${attemptedId}). Sent him a new one: ${ws.clientId}.` )
      }
      // add his identity to the redis datastore
      this.redisClient.set( ws.clientId, ws.clientId )

      // setup vars
      ws.alive = true
      ws.missedPingsCount = 0

      // setup pinging system
      ws.pinger = setInterval( ws => {
        if ( !ws.alive ) {
          ws.missedPingsCount++
          if ( ws.missedPingsCount > 5 ) {
            ws.send( 'Warning: you missed 5 mins of pings. After 10, you will be kicked!' )
          }
          if ( ws.missedPingsCount > 10 ) {
            winston.error( chalk.red( 'Removing client socket after 10 mins of inactivity.' ) )
            ws.send( 'You missed 10 minutes of pings. Bye!' )
            this.remove( ws )
            return
          }
          ws.alive = false
        }
        ws.alive = false
        ws.send( 'ping' )
        // HIC SVNT DRACONES: when ping was every 60s, socket connections would get dropped
        // on the deploted server. Perhaps due to a TTL in nginx on hestia.
      }, 30000, ws ) // ping every 30s.

      // push to my amazing datastore
      this.clients.push( ws )
      winston.debug( chalk.green( "(add) Clients: " + this.clients.length + "." ) )
      winston.debug( chalk.blue( `There are now ${this.clients.length} ws clients in ${process.pid}.` ) )
    } )
  },

  remove( ws ) {
    // escape the  jaws of destruction
    if ( this.clients.indexOf( ws ) === -1 ) return
    // stop pinging this guy
    clearInterval( ws.pinger )
    // cut him out
    this.clients = this.clients.filter( c => c.clientId !== ws.clientId )
    ws.terminate( )

    this.redisClient.del( ws.clientId, ( ) => {} )

    winston.debug( chalk.bgRed( 'Socket removed', ws.clientId ) )
    winston.debug( chalk.blue( `There are now ${this.clients.length} ws clients in ${process.pid}.\n${this.clients.map( c =>  c.clientId ) }` ) )
  }
}
