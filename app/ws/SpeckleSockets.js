'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const url = require( 'url' )
const clientStore = require( './ClientStore' )
const radioTower = require( './RadioTower' )
const events = require( './SpeckleEvents' )

const User = require( '../../models/User' )

module.exports = function( wss ) {

  wss.on( 'connection', function( ws, req ) {
    let location = url.parse( req.url, true );
    let token = location.query.access_token

    ws.authorised = false
    ws.clientId = location.query.client_id
    ws.streamId = location.query.stream_id
    winston.debug( chalk.bgRed( 'WS connection request.' ) )
    winston.debug( location.query )

    User.findOne( { apitoken: token } )
      .then( user => {
        if ( !user ) throw new Error( 'WS Auth: User not found. ' + token )
        ws.authorised = true
        ws.userId = user
        ws.events = events( ws )
        clientStore.add( ws )
      } )
      .catch( err => {
        winston.debug( 'socket connection is not auhtorised.' )
        ws.events = events( ws )
        clientStore.add( ws )
      } )



    ws.on( 'message', message => {
      parseMessage( message )
        .then( parsedMessage => {
          ws.events[ parsedMessage.eventName ]( parsedMessage )
        } )
        .catch( error => {
          winston.error( 'Parse message error.', error )
        } )
    } )

    ws.on( 'close', ( ) => {
      clientStore.remove( ws )
    } )
  } )

  var parseMessage = function( message ) {
    let eventName, args = {}
    return new Promise( ( resolve, reject ) => {
      if ( !message )
        return reject( 'No message provided.' )
      if ( message === 'alive' )
        return resolve( { eventName: 'alive' } )

      let parsedMessage = JSON.parse( message )

      if ( !parsedMessage.eventName )
        return reject( 'Malformed message: no eventName.' )

      return resolve( parsedMessage )
    } )
  }
}