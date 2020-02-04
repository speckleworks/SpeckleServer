/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const ws = require( 'ws' );
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const chaiSubset = require( 'chai-subset' );
const sinon = require( 'sinon' );

const testUtils = require( '../testUtils' );

const Client = require( '../../models/UserAppClient' );
const Stream = require( '../../models/DataStream' );

const HOST = 'localhost';
const PORT = process.env.PORT

const should = chai.should();
const expect = chai.expect;

const redisClient = testUtils.mockRedisClient;

// const { clients } = require( '../../app/ws/ClientStore' );

chai.use( chaiSubset );
chai.use( chaiHttp );

describe( 'clients', () => {

  const testStreamId = 'TEST_ID'
  const routeBase = '/api/clients'
  let app;

  let clientPayload = {
    role: 'Sender',
    documentName: 'Test Client',
    documentGuid: 'some-long-id',
    documentType: 'Test',
    documentLocation: 'nowhere',
    streamId: testStreamId
  }

  let testUser;
  let testStream;
  let client1;
  let client2;
  let client3;


  before( async () => {

    testUser = await testUtils.createTestUser( 'test@test.com', 'not-admin' )

    clientPayload.owner = testUser._id
  } )

  after( async () => {
    await testUser.remove()
  } )

  beforeEach( async () => {

    // app.listen( PORT, HOST )
    app = testUtils.newWebsocketServer()

    testStream = new Stream( {
      streamId: testStreamId,
      owner: testUser._id,
    } )

    await testStream.save()

    client1 = new Client( clientPayload )
    client2 = new Client( clientPayload )
    client3 = new Client( clientPayload )

    await client1.save()
    await client2.save()
    await client3.save()
  } )

  afterEach( async () => {

    app.close()

    await Stream.collection.drop();
    await Client.collection.drop();
    await redisClient.flushall();
  } )


  describe( '/WS Connection tests', () => {

    it( 'should require a client_id', ( done ) => {

      const client = new ws(
        `ws://${HOST}:${PORT}`
      );

      client.on( 'message', function incoming( data ) {
        data.should.equal( 'You must provide a client_id. You can generate an anonymous temporary one by sending an anonymous request to POST /clients (see https://speckleworks.github.io/SpeckleSpecs/#clientcreate).' )
        done()
      } );
    } )

    it( 'should connect to the websocket server with not stream or access token', ( done ) => {

      const client = new ws(
        `ws://${HOST}:${PORT}?client_id=${client1._id}`
      );

      setTimeout( () => {
        redisClient.get( `${client1._id}`, ( err, reply ) => {
          let {
            clients
          } = require( '../../app/ws/ClientStore' );
          clients.should.have.lengthOf( 1 )

          const serverWsClient = clients[0];
          serverWsClient.authorised.should.be.false
          serverWsClient.clientId.should.equal( `${client1._id}` )
          serverWsClient.rooms.should.deep.equal( [] )

          reply.should.equal( `${client1._id}` )

          done()
        } )
      }, 300 );

    } )

    it( 'should connect to the websocket server with no access token', ( done ) => {

      const client = new ws(
        `ws://${HOST}:${PORT}?client_id=${client1._id}&stream_id=${testStream.streamId}`
      );

      setTimeout( () => {
        redisClient.get( `${client1._id}`, ( err, reply ) => {
          let {
            clients
          } = require( '../../app/ws/ClientStore' );
          clients.should.have.lengthOf( 1 )

          const serverWsClient = clients[0];
          serverWsClient.authorised.should.be.false
          serverWsClient.clientId.should.equal( `${client1._id}` )
          serverWsClient.rooms.should.deep.equal( [ `stream-${testStream.streamId}` ] )

          reply.should.equal( `${client1._id}` )

          done()
        } )
      }, 300 );

    } )

    it( 'should connect to the websocket server with access token', ( done ) => {

      const client = new ws(
        `ws://${HOST}:${PORT}?client_id=${client1._id}&stream_id=${testStream.streamId}&access_token=${testUser.apitoken}`
      );

      setTimeout( () => {
        redisClient.get( `${client1._id}`, ( err, reply ) => {
          let {
            clients
          } = require( '../../app/ws/ClientStore' );
          clients.should.have.lengthOf( 1 )

          const serverWsClient = clients[0];
          serverWsClient.authorised.should.be.true
          serverWsClient.clientId.should.equal( `${client1._id}` )
          serverWsClient.rooms.should.deep.equal( [ `stream-${testStream.streamId}` ] )

          reply.should.equal( `${client1._id}` )

          done()
        } )
      }, 300 );

    } )

  } )


  describe( '/WS message event tests', () => {

    let messagePayload;

    let wsClient1;
    let wsClient2;
    let wsClient3;


    beforeEach( async () => {

      messagePayload = {
        eventName: 'message',
        recipientId: `${client2._id}`,
        payload: 'some data'
      }

      wsClient1 = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client1._id}` )
      wsClient2 = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client2._id}` )
      wsClient3 = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client3._id}` )
    } )

    afterEach( async () => {
      await wsClient1.close()
      await wsClient2.close()
      await wsClient3.close()
    } )


    it( 'should send a message directly to a specific client', ( done ) => {

      let messages = [];

      wsClient2.on( 'message', ( data ) => {
        const {
          payload
        } = JSON.parse( data );
        payload.should.equal( 'some data' );
        messages.push( payload )
        // return done()
      } )

      wsClient3.on( 'message', ( data ) => {
        return done( new Error( 'Client 3 should not receive message' ) )
      } )

      wsClient1.send( JSON.stringify( messagePayload ) );

      setTimeout( () => {
        messages.should.have.length( 1 );
        return done()
      }, 300 )

    } )


  } )

  describe( '/WS broadcast event tests', () => {

    let messagePayload;

    let wsClient1;
    let wsClient2;
    let wsClient3;


    beforeEach( async () => {

      messagePayload = {
        eventName: 'broadcast',
        streamId: `${testStream.streamId}`,
        payload: 'some data'
      }

      wsClient1 = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client1._id}&stream_id=${testStream.streamId}` )
      wsClient2 = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client2._id}&stream_id=${testStream.streamId}` )
      wsClient3 = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client3._id}` )
    } )

    afterEach( async () => {
      await wsClient1.close()
      await wsClient2.close()
      await wsClient3.close()
    } )


    it( 'should send a message to clients connected to room', ( done ) => {

      let messages = [];

      wsClient2.on( 'message', ( data ) => {
        const {
          payload
        } = JSON.parse( data );
        payload.should.equal( 'some data' );
        messages.push( payload )
        // return done()
      } )

      wsClient3.on( 'message', ( data ) => {
        return done( new Error( 'Client 3 should not receive message' ) )
      } )

      wsClient1.send( JSON.stringify( messagePayload ) );

      setTimeout( () => {
        messages.should.have.length( 1 );
        return done()
      }, 300 )

    } )

  } )


  describe( '/WS join event tests', () => {
    let streamPayload;
    let resourcePayload;
    let wsClient;


    beforeEach( async () => {

      streamPayload = {
        eventName: 'broadcast',
        streamId: `${testStream.streamId}`,
      }

      resourcePayload = {
        eventName: 'broadcast',
        resourceId: `${testStream.streamId}`,
        resourceType: 'stream'
      }

      wsClient = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client1._id}` )
    } )

    afterEach( async () => {
      // await wsClient.close()
    } )

    it( 'should connect to a new stream socket', () => {

      wsClient.send( JSON.stringify( streamPayload ) );

      setTimeout( () => {
        redisClient.get( `${client1._id}`, ( err, reply ) => {
          let {
            clients
          } = require( '../../app/ws/ClientStore' );
          clients.should.have.lengthOf( 1 )

          const serverWsClient = clients[0];
          serverWsClient.authorised.should.be.true
          serverWsClient.clientId.should.equal( `${client1._id}` )
          serverWsClient.rooms.should.deep.equal( [ `stream-${testStream.streamId}` ] )

          reply.should.equal( `${client1._id}` )

          done()
        } )
      }, 300 );
    } )


    // it( 'should connect to a new resource socket', () => {

    //   wsClient.send( JSON.stringify( resourcePayload ) );

    //   setTimeout( () => {
    //     redisClient.get( `${client1._id}`, ( err, reply ) => {
    //       let {
    //         clients
    //       } = require( '../../app/ws/ClientStore' );
    //       clients.should.have.lengthOf( 1 )

    //       const serverWsClient = clients[0];
    //       serverWsClient.authorised.should.be.true
    //       serverWsClient.clientId.should.equal( `${client1._id}` )
    //       serverWsClient.rooms.should.deep.equal( [ `stream-${testStream.streamId}` ] )

    //       reply.should.equal( `${client1._id}` )

    //       done()
    //     } )
    //   }, 300 );
    // } )

  } )

  describe( '/WS leave event tests', () => {

    let streamPayload;
    let resourcePayload;
    let wsClient;


    beforeEach( async () => {

      streamPayload = {
        eventName: 'leave',
        streamId: `${testStream.streamId}`,
      }

      resourcePayload = {
        eventName: 'broadcast',
        resourceId: `${testStream.streamId}`,
        resourceType: 'stream'
      }

      wsClient = await testUtils.asyncWs( `ws://${HOST}:${PORT}?client_id=${client1._id}&stream_id=${testStream.streamId}` )
    } )

    afterEach( async () => {
      await wsClient.close()
    } )

    // it( 'should leave a stream socket', () => {

    //   wsClient.send( JSON.stringify( streamPayload ) );

    //   setTimeout( () => {
    //     redisClient.get( `${client1._id}`, ( err, reply ) => {
    //       let {
    //         clients
    //       } = require( '../../app/ws/ClientStore' );
    //       clients.should.have.lengthOf( 1 )

    //       const serverWsClient = clients[0];
    //       serverWsClient.authorised.should.be.true
    //       serverWsClient.clientId.should.equal( `${client1._id}` )
    //       serverWsClient.rooms.should.deep.equal( [  ] )

    //       reply.should.equal( `${client1._id}` )

    //       done()
    //     } )
    //   }, 300 );
    // } )

  } )

} );