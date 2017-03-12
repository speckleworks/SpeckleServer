'use strict'
const express             = require('express')
const compression         = require('compression')
const cors                = require('cors')
const cookieParser        = require('cookie-parser')
const bodyParser          = require('body-parser')
const passport            = require('passport')
const path                = require('path')
const chalk               = require('chalk')
const winston             = require('winston')
const expressWinston      = require('express-winston')


const mongoose            = require('mongoose')
const bluebird            = require('bluebird')

const deets               = require('./.secrets/database')

winston.level = 'debug'

mongoose.Promise = bluebird
mongoose.connect( deets.url , ( err ) => {
  if( err ) throw err
  else winston.info('connected to mongoose at ' + deets.url )
})

////////////////////////////////////////////////////////////////////////
/// Various Express inits                                         /////.
////////////////////////////////////////////////////////////////////////
var app = express()  
app.use( cors() ) // allow cors
app.use( compression() ) // allow compression

app.use( expressWinston.logger( {
  transports: [ new winston.transports.Console( { json: false, colorize: true } ) ],
  meta: false,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}'
} ))

app.use( cookieParser() )
app.use( bodyParser.json( { limit: '50mb' } ) )
app.use( passport.initialize() )
require('./.config/passport' ) ( passport )

////////////////////////////////////////////////////////////////////////
/// Websockets & HTTP Servers                                     /////.
////////////////////////////////////////////////////////////////////////
var http = require('http')
var server = http.createServer( app )
var WebSocketServer = require('ws').Server

var wss = new WebSocketServer( { 
  server: server, 
  verifyClient: require('./app/ws/middleware/VerifyClient')
  //   function (info, cb) { 
  //   // TODO: cb ( flase, 200, 'error' )
  //   var location = url.parse(info.req.url, true);
  //   winston.info( chalk.red.underline( 'WS: Access token: ' + location.query.access_token ) ) 
  //   var status = true, code = 400, msg = ''    
  //   cb( status, code, msg )
  // } 
} )

require('./app/ws/SpeckleSockets') ( wss )

app.get('/', function(req, res) {
  res.send('Hello there. Move along now.')
})

////////////////////////////////////////////////////////////////////////
/// Temp Routes(debug)                                            /////.
////////////////////////////////////////////////////////////////////////

const RT = require('./app/ws/RadioTower')
const CS = require('./app/ws/ClientStore')

app.get('/stats', ( req, res ) => {
  res.json( { numclients: CS.clients.length, rooms: RT.getRooms() } )
} )

////////////////////////////////////////////////////////////////////////
/// Routes                                                        /////.
////////////////////////////////////////////////////////////////////////

require( './app/api-v1/root' ) ( app, express )
require( './app/api/updateRoutes' ) ( app, express /*, clients, rooms */ )
require( './app/api/userRoutes' ) ( app, express )

////////////////////////////////////////////////////////////////////////
/// LAUNCH                                                         /////.
////////////////////////////////////////////////////////////////////////

var PORT = 8080
server.listen( PORT, () => {
  winston.info( chalk.bgBlue( '>>>>>>>> Starting up @ ' + PORT + ' <<<<<<<<<<<') )
})