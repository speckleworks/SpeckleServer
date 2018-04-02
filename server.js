const cluster = require( 'cluster' )
const express = require( 'express' )
const cors = require( 'cors' )
const serveStatic = require( 'serve-static' )
const cookieParser = require( 'cookie-parser' )
const bodyParser = require( 'body-parser' )
const passport = require( 'passport' )
const path = require( 'path' )
const chalk = require( 'chalk' )
const winston = require( 'winston' )
const expressWinston = require( 'express-winston' )
const mongoose = require( 'mongoose' ).set( 'debug', false )

const CONFIG = require( './config' )
winston.level = 'debug'

if ( cluster.isMaster ) {
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
  mongoose.connect( CONFIG.mongo.url, { auto_reconnect: true, reconnectTries: 5 }, ( err ) => {
    if ( err ) throw err
    else winston.info( 'connected to mongoose at ' + CONFIG.mongo.url )
  } )

  mongoose.connection.on( 'error', err => {
    winston.debug( 'Failed to connect to DB ' + CONFIG.mongo + ' on startup ', err )
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

  app.use( cookieParser( ) )

  // throws a 413 if over 10mb (deflated)
  app.use( bodyParser.json( { limit: CONFIG.serverDescription.maxRequestSize } ) )
  app.use( bodyParser.urlencoded( { extended: true } ) )

  app.use( passport.initialize( ) )

  if ( CONFIG.serverDescription.indentResponses )
    app.set( 'json spaces', 2 )

  require( './config/passport' )( passport )

  // Admin app
  app.use( '/admin', express.static( __dirname + '/node_modules/@speckle/speckle-admin' ) )
  // Viewer app
  app.use( '/view',  express.static( __dirname + '/node_modules/@speckle/speckle-viewer' ) )
  
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

  const RT = require( './app/ws/RadioTower' )
  RT.initRedis( )

  ////////////////////////////////////////////////////////////////////////
  /// Routes                                                        /////.
  ////////////////////////////////////////////////////////////////////////

  // handle api versions gracefully
  require( './app/api/v0/index' )( app, express, '/api/v0' )
  require( './app/api/v1/index' )( app, express, '/api/v1' )

  ////////////////////////////////////////////////////////////////////////
  /// LAUNCH                                                         /////.
  ////////////////////////////////////////////////////////////////////////

  var port = process.env.PORT || 3000
  server.listen( port, ( ) => {
    winston.info( `Speckle worker process now running on port ${port}.` )
  } )
}