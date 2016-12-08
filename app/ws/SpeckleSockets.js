'use strict'
const winston     = require('winston')
const chalk       = require('chalk')

const clientStore = require('./ClientStore')
const radioTower = require('./RadioTower')
const events      = require('./SpeckleEvents')

module.exports = function( wss ) {

  wss.on( 'headers', headers => {
  })

  wss.on ( 'connection', ws => {
    ws.events = events( ws );
    clientStore.add( ws )
    
    ws.on( 'message', message => {
      parseMessage(message)
      .then( ( parsedMessage ) =>  {
        ws.events[parsedMessage.eventName]( parsedMessage.args ) 
      } )
      .catch( ( error ) => {
        winston.error( 'Parse message error.', error )
      })
    })

    ws.on( 'close', () => {
      clientStore.remove( ws )
      radioTower.purge( ws )
    })
  })

  var parseMessage = function( message ) {
    let eventName, args = {}
    return new Promise( (resolve, reject) => {
      if( !message ) return reject('No message provided.')
      if( message === 'alive' ) return resolve( { eventName:'alive', args: null } )
      
      let parsedMessage = JSON.parse( message )
      if( !parsedMessage.eventName) return reject('Malformed message: no eventName.')
      return resolve( parsedMessage )
    })
  }
}