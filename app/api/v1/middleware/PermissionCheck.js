'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )

const ProtectedFields = require( './ProtectedFields' )
/*
Takes in user, operatin scope, resource and optionally modifier keys
Resolves successfully, returning the resource back and the scope for finer grained checkups
Rejects with an error, specifying the reason
 */
module.exports = ( user, operation, resource, mod ) => {
  return new Promise( ( resolve, reject ) => {

    if ( !resource ) return reject( new Error( 'Resource not found.' ) )
    if ( user == null ) user = { role: 'guest', _id: '' }

    winston.debug( chalk.bgRed( 'checking perms' ), resource.private, '|', user.role, '|', user._id.toString( ) )

    // admin or owner: anything goes
    if ( user.role === 'admin' || user._id.toString( ) === resource.owner.toString( ) ) {
      winston.debug( chalk.bgGreen( 'checking perms' ), 'user is admin or owner' )
      return resolve( resource, 'full' )
    }

    if ( mod && mod instanceof Array ) {
      for ( let key of mod )
        if ( ProtectedFields.indexOf( key ) != -1 )
          return reject( new Error( `Protected field, you are not authorised to edit ${key}.` ) )
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
          return resolve( resource, 'normal' )
        }
        winston.debug( chalk.bgRed( 'checking perms' ), `user has NO ${operation} access` )
        return reject( new Error( `You are not authorised to ${operation}.` ) )

      case 'read':
        if ( resource.private === false ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `${operation} ok, resource is public` )
          return resolve( resource, 'normal' )
        }
        if ( canWrite.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has write & ${operation} access` )
          return resolve( resource, 'normal' )
        }
        if ( canRead.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has ${operation} access` )
          return resolve( resource, 'normal' )
        }
        winston.debug( chalk.bgRed( 'checking perms' ), `user has NO ${operation} access` )
        return reject( new Error( `You are not authorised to ${operation}.` ) )

      case 'comment':
        if ( resource.private === false && resource.anonymousComments === true ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `${operation} ok` )
          return resolve( resource, 'normal' )
        }
        if ( user.role === 'guest' && resource.anonymousComments === false )
          return reject( new Error( `You are not authorised to ${operation}.` ) )

        if ( canWrite.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has write & ${operation} access` )
          return resolve( resource, 'normal' )
        }
        if ( canRead.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has ${operation} access` )
          return resolve( resource, 'normal' )
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