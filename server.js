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


var mongoose            = require('mongoose')
var deets               = require('./.secrets/database')
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
var wss = new WebSocketServer( { server: server } )

wss.on('connection', ( ws ) => {
  ws.on( 'message', message => {
    console.log(message)
  } )
})

app.get('/', function(req, res) {
  res.send('Hello there. Move along now.')
})

var PORT = 8080
server.listen( PORT, () => {
  winston.info( chalk.red.underline( 'Starting up @ ' + PORT ) )
})


