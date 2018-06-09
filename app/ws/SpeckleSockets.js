const winston = require( 'winston' )
const chalk = require( 'chalk' )
const url = require( 'url' )
const redis = require( 'redis' )

const clientStore = require( './ClientStore' )
const radioTower = require( './RadioTower' )

const User = require( '../../models/User' )
const CONFIG = require( '../../config' )

module.exports = function( wss ) {

  // start a redis subscriber in the radio tower
  radioTower.initRedis()
  
  // start a redis publisher 
  let redisPublisher = redis.createClient( CONFIG.redis.url )

  redisPublisher.on( 'connect', ( ) => {
    winston.debug( `${process.pid} connected to redis.` )
  } )

  wss.on( 'connection', function( ws, req ) {

    let location = url.parse( req.url, true );
    let token = location.query.access_token

    ws.authorised = false
    ws.clientId = location.query.client_id   
    ws.rooms = [ location.query.stream_id ]
    
    winston.debug( chalk.blue( `Ws connection request in PID ${process.pid}` ) )

    // authentication for ws sessions
    User.findOne( { apitoken: token } )
      .then( user => {
        if ( !user )
          throw new Error( 'Ws auth: User not found.' )
        ws.authorised = true
        ws.user = user
        clientStore.add( ws )
      } )
      .catch( err => {
        winston.debug( 'Socket connection is not auhtorised, will add him as an anonymous client.' )
        clientStore.add( ws )
      } )

    ws.on( 'message', message => {
      // winston.debug( `Got a message from ws ${ws.clientId}, in PID ${process.pid}` )
      
      // check if it's a hearbeat
      if ( message === 'alive' ) {
        ws.alive = true
        ws.missedPingsCount = 0
        return
      }

      // pub to redis otherwise
      redisPublisher.publish( 'speckle-message', message )
    } )

    ws.on( 'close', ( ) => {
      clientStore.remove( ws )
    } )
  } )
}