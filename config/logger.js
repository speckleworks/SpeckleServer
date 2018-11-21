'use strict'
const fs = require( 'fs' )
const path = require( 'path' )
const { createLogger, format, transports } = require( 'winston' )
const drf = require( 'winston-daily-rotate-file' )


const env = process.env.NODE_ENV || 'dev'
const logDir = 'logs'

if ( !fs.existsSync( logDir ) ) {
  fs.mkdirSync( logDir )
}

const drfTransport = new transports.DailyRotateFile( {
  filename: `${logDir}/%DATE%.log`,
  datePattern: `YYYY-MM-DD`
} )

const logger = createLogger( {
  level: 'debug',
  format: format.combine(
    format.timestamp( { format: 'YYYY-MM-DD HH:mm:ss' } ),
    format.json( )
  ),
  transports: [
    new transports.Console( {
      level: 'debug',
      format: format.combine(
        format.colorize( ),
        format.timestamp( { format: 'YYYY-MM-DD HH:mm:ss' } ),
        format.printf( info => `${info.timestamp} ${info.level}: ${info.message}` ), )
    } ),
    drfTransport
  ]
} )

module.exports = logger
