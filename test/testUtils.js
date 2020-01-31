/* eslint-disable no-unused-vars */
//During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const passport = require( 'passport' );
const jwt = require( 'jsonwebtoken' );
const ws = require( 'ws' );

const User = require( '../models/User' )
const loadAPI = require( '../app/api' );
const loadPassport = require( '../config/passport' )
const loadEnv = require( '../config/loadEnv' );

const sinon = require( 'sinon' );
const redis = require( 'redis' )
const mockRedis = require( "redis-mock" );

// Setup redis mock before importing specklesockets
const mock = sinon.createSandbox();
const mockRedisClient = mockRedis.createClient()
// mock.stub( redis, 'createClient' ).returns( mockRedisClient )
mock.stub( redis, 'createClient' ).callsFake( mockRedis.createClient );

const SpeckleSockets = require( '../app/ws/SpeckleSockets' )

loadEnv()

const REQ_SIZE = process.env.REQ_SIZE
const SESSION_SECRET = process.env.SESSION_SECRET
const PORT = process.env.PORT

const newAPIServer = ( urlRoot, plugins ) => {
  const app = express()
  app.use( bodyParser.json( { limit: REQ_SIZE } ) )
  app.use( bodyParser.urlencoded( { extended: true } ) )

  app.use( passport.initialize() )

  loadPassport( passport )

  loadAPI( app, express, urlRoot, plugins )

  return app
}

const newWebsocketServer = ( ) => {

  var wss = new ws.Server( { port: PORT } )

  SpeckleSockets( wss )

  return wss
}

const createTestUser = async ( email, role ) => {
  const testUser = new User( {
    email: email,
    password: 'super-secret-password',
    company: 'acme',
    name: 'test',
    surname: 'test',
    role
  } );

  testUser.apitoken = 'JWT ' + jwt.sign( { _id: testUser._id, name: testUser.name }, SESSION_SECRET, { expiresIn: '24h' } )

  return testUser.save()
}

const asyncWs = async ( connectionString ) => {
  const client = new ws( connectionString );

  return new Promise( ( resolve, reject ) => {

    setTimeout( () => {
      return resolve( client )
    }, 300 )

  } )
}

module.exports = {
  newAPIServer,
  createTestUser,
  newWebsocketServer,
  mockRedisClient,
  asyncWs
}