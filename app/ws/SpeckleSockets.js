const winston = require( '../../config/logger' )
const chalk = require( 'chalk' )
const url = require( 'url' )
const redis = require( 'redis' )

const clientStore = require( './ClientStore' )
const radioTower = require( './RadioTower' )

const User = require( '../../models/User' )

// start a redis publisher & subscriber
let redisPublisher = redis.createClient( process.env.REDIS_URL )
redisPublisher.on( 'connect', ( ) => {
  winston.debug( `${process.pid} connected to redis.` )
} )

// start a redis subscriber in the radio tower
radioTower.initRedis( )

module.exports = function( wss ) {

  wss.on( 'connection', function( ws, req ) {
    winston.debug( chalk.blue( `Ws connection request in PID ${process.pid}` ) )

    let location = url.parse( req.url, true )
    if ( !location.query.client_id ) {
      winston.debug( chalk.red( `No client_id present, refusing.` ) )
      ws.send( 'You must provide a client_id. You can generate an anonymous temporary one by sending an anonymous request to POST /clients (see https://speckleworks.github.io/SpeckleSpecs/#clientcreate).' )
      ws.close( )
    }
    let token = location.query.access_token

    ws.authorised = false
    ws.clientId = location.query.client_id
    ws.rooms = [ ]
    if ( location.query.stream_id ) {
      winston.debug( `${ws.clientId} joined room stream-${location.query.stream_id} from connection start.` )
      ws.rooms = [ `stream-${location.query.stream_id}` ]
    }

    // authentication for ws sessions
    User.findOne( { apitoken: token } )
      .then( user => {
        if ( !user ) { throw new Error( 'Ws auth: User not found.' ) }
        ws.authorised = true
        ws.user = user
        clientStore.add( ws )
      } )
      .catch( ( ) => {
        winston.debug( 'Socket connection is not auhtorised, will add him as an anonymous client.' )
        clientStore.add( ws )
      } )

    ws.on( 'message', message => {
      // check if it's a hearbeat
      if ( message === 'alive' ) {
        ws.alive = true
        ws.missedPingsCount = 0
        return
      }
      // pub to redis otherwise
      redisPublisher.publish( 'speckle-message', JSON.stringify( { content: message, clientId: ws.clientId } ) )
    } )

    ws.on( 'error', ( ) => {
      winston.debug( `Ws ${ws.clientId} threw an error :/` )
    } )

    ws.on( 'close', ( ) => {
      clientStore.remove( ws )
    } )
  } )
}
