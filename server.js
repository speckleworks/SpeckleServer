const path = require( 'path' )
const cluster = require( 'cluster' )
const express = require( 'express' )
const cors = require( 'cors' )
const bodyParser = require( 'body-parser' )
const passport = require( 'passport' )
const chalk = require( 'chalk' )
const mongoose = require( 'mongoose' ).set( 'debug', false )
const expressWinston = require( 'express-winston' )
const redis = require( 'redis' )
const logger = require( './config/logger' )

// load up .env
const configResult = require( 'dotenv' ).config( { path: './.env' } )
if ( configResult.error ) {
  logger.debug( chalk.bgRed( 'There is an error in the .env configuration file. Will use the default provided ones (if any).' ) )
}

// front-end plugins discovery registration
const plugins = require( './plugins' )( )

/////////////////////////////////////////////////////////////////////////
/// MASTER process                                                 /////.
/////////////////////////////////////////////////////////////////////////
if ( cluster.isMaster ) {
  logger.info( chalk.blue( `


    █▀▀ █▀▀█ █▀▀ █▀▀▀ █ █ █   █▀▀
    ▀▀█ █  █ █▀▀ █    █▀▄ █   █▀▀
    ▀▀▀ █▀▀▀ ▀▀▀ ▀▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀


` ) + `
    █
    █  https://speckle.works
    █  The Open Source Data Platform for AEC.
    █
` +
chalk.red( `
    █  Server running at: ${process.env.CANONICAL_URL}
  ` )
 )

  logger.level = 'debug'

  let osCpus = require( 'os' ).cpus( ).length
  let envCpus = process.env.MAX_PROC
  let numWorkers = envCpus ? ( envCpus > osCpus ? osCpus : envCpus ) : osCpus
  logger.debug( `Setting up ${numWorkers} workers.\n` )

  for ( let i = 0; i < numWorkers; i++ ) { cluster.fork( ) }

  cluster.on( 'online', worker => {
    logger.debug( `Speckle worker ${worker.process.pid} is now online.\n` )
  } )

  cluster.on( 'exit', ( worker, code, signal ) => {
    logger.debug( `Speckle worker ${worker.process.pid} just died with code ${code} and signal ${signal}.` )
    logger.debug( `Starting a new one...` )
    cluster.fork( )
  } )

  // flush redis
  let redisClient = redis.createClient( process.env.REDIS_URL )
  redisClient.on( 'connect', ( ) => {
    logger.debug( `Flushing redis database.` )
    redisClient.flushdb( )
  } )

  /////////////////////////////////////////////////////////////////////////
  /// CHILD processes                                                /////.
  /////////////////////////////////////////////////////////////////////////
} else {

  // Express inits
  var app = express( )
  app.use( cors( ) ) // allow cors

  app.use( expressWinston.logger( {
    winstonInstance: logger,
    colorize: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms'
  } ) )

  // Mongo handlers
  mongoose.Promise = global.Promise

  mongoose.connect( process.env.MONGODB_URI, { useNewUrlParser: true, autoReconnect: true, reconnectTries: 5, keepAlive: 10 }, ( err ) => {
    if ( err ) throw err
    else logger.debug( 'connected to mongoose at ' + process.env.MONGODB_URI )
  } )

  mongoose.connection.on( 'error', err => {
    logger.debug( 'Failed to connect to DB ' + process.env.MONGODB_URI + ' on startup ', err )
  } )

  // When the connection is disconnected
  mongoose.connection.on( 'disconnected', ( ) => {
    logger.debug( 'Mongoose default was disconnected' )
  } )

  mongoose.connection.on( 'connected', ( ) => {
    logger.debug( 'Connected to mongo.' )
  } )


  // throws a 413 if over REQ_SIZE
  app.use( bodyParser.json( { limit: process.env.REQ_SIZE } ) )
  app.use( bodyParser.urlencoded( { extended: true } ) )

  app.use( passport.initialize( ) )

  if ( process.env.INDENT_RESPONSES === 'true' ) { app.set( 'json spaces', 2 ) }
  if ( process.env.EXPOSE_EMAILS === 'true' ) { app.enable( 'expose emails' ) }

  require( './config/passport' )( passport )

  // register plugins with express
  plugins.forEach( plugin => {
    app.use( plugin.serveFrom, express.static( path.join( plugin.serveSource ? plugin.serveSource : plugin.sourceDir ) ) )
  } )

  // expose an api
  app.use( '/api/plugins', ( req, res ) => res.json( plugins ) )

  // Websockets & HTTP Servers
  var http = require( 'http' )
  var server = http.createServer( app )
  var WebSocketServer = require( 'ws' ).Server

  var wss = new WebSocketServer( {
    server: server
  } )

  require( './app/ws/SpeckleSockets' )( wss )

  // Routes
  // handle api versions gracefully
  app.use( '/api/v0', ( req, res ) => res.status( 410 ).json( { error: 'The v0 API has been removed.' } ) )
  require( './app/api/index' )( app, express, '/api', plugins )
  require( './app/api/index' )( app, express, '/api/v1', plugins )


  // init email transport
  require( './app/email/index' )

  // init default register/login routes
  require( './app/auth/index' )( app )

  /// /////////////////////////////////////////////////////////////////////
  /// LAUNCH                                                         /////.
  /// /////////////////////////////////////////////////////////////////////

  var port = process.env.PORT || 3000
  var ip = process.env.IP || null
  server.listen( port, ip, ( ) => {
    logger.debug( `Speckle worker process ${process.pid} now running on port ${port}.` )
  } )
}
