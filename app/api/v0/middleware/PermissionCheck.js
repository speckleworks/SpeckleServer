'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const url = require( 'url' )
const User = require( '../../../../models/User' )

module.exports = ( user, operation, resource ) => {
  return new Promise( ( resolve, reject ) => {

    if ( !resource ) return reject( new Error( 'Resource not found.' ) )
    if ( user == null ) user = { role: 'guest', _id: '' }

    winston.debug( chalk.bgRed( 'checking perms' ), resource.private, '|', user.role, '|', user._id.toString( ), '|', resource.owner.toString( ), 'id:', resource.streamId ? resource.streamId : resource._id.toString( ) )

    // admin or owner: anyhting goes
    if ( user.role === 'admin' || user._id.toString( ) === resource.owner.toString( ) ) {
      winston.debug( chalk.bgGreen( 'checking perms' ), 'user is admin or owner' )
      return resolve( resource )
    }

    if ( operation == null ) {
      winston.debug( chalk.bgRed( 'checking perms' ), 'no operation specified' )
      return reject( new Error( `You are not authorised to ${operation}.` ) )
    }

    // let's get basic
    let canRead = resource.canRead.map( x => x.toString( ) )
    let canWrite = resource.canWrite.map( x => x.toString( ) )

    switch ( operation ) {
      case 'write':
        if ( canWrite.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has ${operation} access` )
          return resolve( resource )
        }
        winston.debug( chalk.bgRed( 'checking perms' ), `user has NO ${operation} access` )
        return reject( new Error( `You are not authorised to ${operation}.` ) )

      case 'read':
        if ( resource.private === false ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `${operation} ok, resource is public` )
          return resolve( resource )
        }
        if ( canWrite.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has write & ${operation} access` )
          return resolve( resource )
        }
        if ( canRead.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has ${operation} access` )
          return resolve( resource )
        }
        winston.debug( chalk.bgRed( 'checking perms' ), `user has NO ${operation} access` )
        return reject( new Error( `You are not authorised to ${operation}.` ) )

      case 'delete':
        // ownership or admin is already checked and resolved above
        return reject( new Error( 'You do not own the stream.' ) )

      default:
        winston.debug( chalk.bgRed( 'checking perms' ), `operation ${operation} not defined` )
        return reject( new Error( `You are not authorised to ${operation}: unknown.` ) )
    }
  } )
}