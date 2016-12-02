var express             = require('express')
var compression         = require('compression')
var cors                = require('cors')
var cookieParser        = require('cookie-parser')
var bodyParser          = require('body-parser')
var passport            = require('passport')
var path                = require('path')
var chalk               = require('chalk')
var winston             = require('winston')
var expressWinston      = require('express-winston')
var url                 = require('url')

var mongoose            = require('mongoose')
var bluebird            = require('bluebird')

var deets               = require('./.secrets/database')

var messageParser       = require('./app/ws/MessageParser')
var clientStore         = require('./app/ws/ClientStore')

winston.level = 'debug'

mongoose.Promise = bluebird
mongoose.connect( deets.url , ( err ) => {
  if( err ) throw err
  else winston.info('connected to mongoose at ' + deets.url )
})

var app = express() 
app.use( cors() )
app.use( compression() )

app.use( expressWinston.logger( {
  transports: [ new winston.transports.Console( { json: false, colorize: true } ) ],
  meta: false,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}'
} ))

app.use( cookieParser() )
app.use( bodyParser.json( { limit: '50mb' } ) )

app.use( '/admin', express.static( './frontend/admin' ) )

var http = require('http')
var server = http.createServer( app )
var WebSocketServer = require('ws').Server

var wss = new WebSocketServer( { 
  server: server, 
  verifyClient: function (info, cb) { 
    // TODO: cb ( flase, 200, 'error' )
    var location = url.parse(info.req.url, true);
    winston.info( chalk.red.underline( 'WS: Access token: ' + location.query.access_token ) ) 
    var status = true, code = 400, msg = ''    
    cb( status, code, msg )
  }, 
} )

var clients = []

wss.on( 'headers', ( headers ) => {
})

wss.on( 'connection', ( ws ) => {  
  clientStore.add( ws )

  ws.on( 'message', message => {
    messageParser( message, ws )
  } )

  ws.on( 'close', () => {
    clientStore.remove( ws )
  })
})

app.get('/', function(req, res) {
  res.send('Hello there. Move along now.')
})

require( './app/api/updateRoutes' ) ( app, express /*, clients, rooms */ )

var PORT = 8080
server.listen( PORT, () => {
  winston.info( chalk.red.underline( 'Starting up @ ' + PORT ) )
})