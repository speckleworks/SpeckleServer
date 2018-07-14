const cluster = require( 'cluster' )
const express = require( 'express' )
const cors = require( 'cors' )
const bodyParser = require( 'body-parser' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )
const winston = require( 'winston' )
const expressWinston = require( 'express-winston' )
const mongoose = require( 'mongoose' ).set( 'debug', false )

winston.level = 'debug'

if ( cluster.isMaster ) {

  const configResult = require( 'dotenv' ).config( { path: './.env' } )
  if ( configResult.error ) {
    winston.debug( chalk.bgRed( 'There is an error in the .env configuration file. Will use the default provided ones (if any).' ) )
  }

  let osCpus = require( 'os' ).cpus( ).length
  let envCpus = process.env.MAX_PROC
  let numWorkers = envCpus ? ( envCpus > osCpus ? osCpus : envCpus ) : osCpus
  winston.debug( `Setting up ${numWorkers} workers.` )


  for ( let i = 0; i < numWorkers; i++ )
    cluster.fork( )

  cluster.on( 'online', worker => {
    winston.debug( `Speckle worker ${worker.process.pid} is now online.` )
  } )

  cluster.on( 'exit', ( worker, code, signal ) => {
    winston.debug( `Speckle worker ${worker.process.pid} just died with code ${code} and signal ${signal}.` )
    winston.debug( `Starting a new one...` )
    cluster.fork( )
  } )
} else {
  ////////////////////////////////////////////////////////////////////////
  /// Mongo handlers                                                /////.
  ////////////////////////////////////////////////////////////////////////
  mongoose.Promise = global.Promise

  mongoose.connect( process.env.MONGODB_URI, { auto_reconnect: true, reconnectTries: 5, keepAlive: 10 }, ( err ) => {
    if ( err ) throw err
    else winston.debug( 'connected to mongoose at ' + process.env.MONGODB_URI )
  } )

  mongoose.connection.on( 'error', err => {
    winston.debug( 'Failed to connect to DB ' + process.env.MONGODB_URI + ' on startup ', err )
  } );

  // When the connection is disconnected
  mongoose.connection.on( 'disconnected', ( ) => {
    winston.debug( 'Mongoose default was disconnected' )
  } );

  mongoose.connection.on( 'connected', ref => {
    winston.debug( chalk.red( 'Connected to mongo.' ) )
  } )

  ////////////////////////////////////////////////////////////////////////
  /// Various Express inits                                         /////.
  ////////////////////////////////////////////////////////////////////////
  var app = express( )
  app.use( cors( ) ) // allow cors

  app.use( expressWinston.logger( {
    transports: [ new winston.transports.Console( { json: false, colorize: true, timestamp: true } ) ],
    meta: false,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} '
  } ) )

  // throws a 413 if over REQ_SIZE
  app.use( bodyParser.json( { limit: process.env.REQ_SIZE } ) )
  app.use( bodyParser.urlencoded( { extended: true } ) )

  app.use( passport.initialize( ) )

  if ( process.env.INDENT_RESPONSES === 'true' )
    app.set( 'json spaces', 2 )

  if ( process.env.EXPOSE_EMAILS === 'true' )
    app.enable( 'expose emails' )

  require( './config/passport' )( passport )

  // Admin app
  app.use( '/admin', express.static( __dirname + '/node_modules/@speckle/speckle-admin' ) )
  // Viewer app
  app.use( '/view', express.static( __dirname + '/node_modules/@speckle/speckle-viewer' ) )
  // Prop until we get to proper plugin system
  app.use( '/', express.static( __dirname + '/node_modules/@speckle/speckle-admin' ) )
  
  ////////////////////////////////////////////////////////////////////////
  /// Websockets & HTTP Servers                                     /////.
  ////////////////////////////////////////////////////////////////////////
  var http = require( 'http' )
  var server = http.createServer( app )
  var WebSocketServer = require( 'ws' ).Server

  var wss = new WebSocketServer( {
    server: server
  } )

  require( './app/ws/SpeckleSockets' )( wss )

  ////////////////////////////////////////////////////////////////////////
  /// Routes                                                        /////.
  ////////////////////////////////////////////////////////////////////////

  // handle api versions gracefully
  app.use( '/api/v0', ( req, res ) => res.status( 410 ).json( { error: 'The v0 API has been removed' } ) )
  require( './app/api/v1/index' )( app, express, '/api/v1' )

  ////////////////////////////////////////////////////////////////////////
  /// LAUNCH                                                         /////.
  ////////////////////////////////////////////////////////////////////////

  var port = process.env.PORT || 3000
  server.listen( port, ( ) => {
    winston.debug( chalk.yellow( `Speckle worker process ${process.pid} now running on port ${port}.` ) )
  } )
}