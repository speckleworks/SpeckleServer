/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const chaiSubset = require( 'chai-subset' );
const testUtils = require( '../testUtils' );

const Client = require( '../../models/UserAppClient' );
const Stream = require( '../../models/DataStream' );

const app = testUtils.newAPIServer( '/api', null )
const should = chai.should();
const expect = chai.expect;

chai.use( chaiSubset );
chai.use( chaiHttp );

describe( 'clients', () => {

  const testStreamId = 'TEST_ID'
  const routeBase = '/api/clients'

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

  before( async () => {
    //   const resp = await testUtils.setUpMongoose()

    //   mongoServer = resp.mongoServer;
    //   mongoose = resp.mongoose;
    testUser = await testUtils.createTestUser( 'test@test.com', 'not-admin' )

    clientPayload.owner = testUser._id
  } )

  after( async () => {
    await testUser.remove()
    // await mongoose.disconnect()
    // await mongoServer.stop()
  } )

  beforeEach( async () => {
    testStream = new Stream( {
      streamId: testStreamId,
      owner: testUser._id,
    } )

    await testStream.save()

    client1 = new Client( clientPayload )
    client2 = new Client( clientPayload )

    await client1.save()
    await client2.save()

  } )

  afterEach( async () => {
    await Stream.collection.drop();
    await Client.collection.drop();
  } )


  describe( '/GET /clients', () => {
    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should GET all the clients', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources.should.have.lengthOf( '2' )
          res.body.resources.should.deep.equal( JSON.parse( JSON.stringify( [ client1.toObject(), client2.toObject() ] ) ) )
          done();
        } );
    } );
  } );

  describe( '/POST /clients', () => {

    let postPayload = {
      role: 'Sender',
      documentName: 'Test Client',
      documentGuid: 'some-long-id',
      documentType: 'Test',
      documentLocation: 'nowhere',
      streamId: testStreamId
    }

    it( 'should not require authentication', ( done ) => {
      chai.request( app )
        .post( routeBase )
        .send( postPayload )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          done()
        } )
    } )

    it( 'should add "temp-" before the create resource ID if unauthenticated', ( done ) => {
      chai.request( app )
        .post( routeBase )
        .send( postPayload )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resource' )
          res.body.resource._id.should.match( /temp-.*/ )
          done()
        } )
    } )

    it( 'should create a mongodb object matching the input payload', ( done ) => {
      chai.request( app )
        .post( routeBase )
        .set( 'Authorization', testUser.apitoken )
        .send( postPayload )
        .end( ( err, res ) => {
          const _id = res.body.resource._id;
          Client.findOne( { _id } ).then( client => {
            client.should.containSubset( postPayload )
            done()
          } ).catch( err => done( err ) )
        } )
    } )
  } )

  describe( '/PUT /clients/{id}', () => {

    let unauthorizedUser
    let updatePayload = {
      role: 'New Role',
      documentName: 'New Name'
    }

    before( async () => {
      unauthorizedUser = await testUtils.createTestUser( 'unauthorized@test.com', 'not-admin' )
    } )

    after( () => {
      unauthorizedUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${client1._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should only accept request from users with write access', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${client1._id}` )
        .set( 'Authorization', unauthorizedUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 400 )
          done()
        } )
    } )

    it( 'should modify a resource', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${client1._id}` )
        .set( 'Authorization', testUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          Client.findOne( { _id: client1._id } ).then( client => {
            client.should.containSubset( updatePayload )
            done()
          } ).catch( err => done( err ) )
        } )
    } )
  } )

  describe( '/GET /clients/{id}', () => {
    let unauthorizedUser


    before( async () => {
      unauthorizedUser = await testUtils.createTestUser( 'unauthorized@test.com', 'not-admin' )
    } )

    after( () => {
      unauthorizedUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${client1._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should return a resource and populate the owner field', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${client1._id}` )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Client.findOne( { _id: client1._id } ).populate( 'owner', 'name surname email company' )
            .then( result => {
              res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
              done()
            } ).catch( err => done( err ) )
          } )
        } )
    } )

  describe( '/DELETE /clients/{id}', () => {
    let unauthorizedUser
    let resourceToDelete

    before( async () => {
      unauthorizedUser = await testUtils.createTestUser( 'unauthorized@test.com', 'not-admin' )
    } )

    beforeEach( async () => {
      resourceToDelete = new Client( clientPayload )
      await resourceToDelete.save()
    } )

    afterEach( async () => {
      try {
        await resourceToDelete.remove()
      } catch ( err ) {
        // If it can't remove it then it's probably been deleted right? ;)
        return
      }
    } )

    after( () => {
      unauthorizedUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${resourceToDelete._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should only accept request from users with write access', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${resourceToDelete._id}` )
        .set( 'Authorization', unauthorizedUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 404 )
          done()
        } )
    } )

    it( 'should delete a resource', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${resourceToDelete._id}` )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Client.findOne( { _id: resourceToDelete._id } )
            .then( result => {
              expect( result ).to.be.a( 'null' )
              done()
            } ).catch( err => done( err ) )
        } )
    } )
  } )

} );