/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const chaiSubset = require( 'chai-subset' );
const testUtils = require( '../testUtils' );

const Client = require( '../../models/UserAppClient' );
const Stream = require( '../../models/DataStream' );
const User = require( '../../models/User' )

const app = testUtils.newAPIServer( '/api', null )
const should = chai.should();
const expect = chai.expect;

const SESSION_SECRET = process.env.SESSION_SECRET

chai.use( chaiSubset );
chai.use( chaiHttp );

describe( 'accounts', () => {

  const testStreamId = 'TEST_ID'
  const routeBase = '/api/accounts'

  let clientPayload = {
    role: 'Sender',
    documentName: 'Test Client',
    documentGuid: 'some-long-id',
    documentType: 'Test',
    documentLocation: 'nowhere',
    streamId: testStreamId
  }

  let testUser;
  let adminUser
  let testStream;
  let client1;
  let client2;

  before( async () => {
    testUser = await testUtils.createTestUser( 'test@test.com', 'not-admin' )
    adminUser = await testUtils.createTestUser( 'admin@test.com', 'admin' )

    clientPayload.owner = testUser._id
  } )

  after( async () => {
    await testUser.remove()
    await adminUser.remove()
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


  describe( '/GET /accounts', () => {

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should GET the user corresponding to the auth token', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          let expectedAccount = JSON.parse( JSON.stringify( testUser.toObject() ) );
          delete expectedAccount.password
          res.should.have.status( 200 );
          res.body.should.have.property( 'resource' )
          res.body.resource.should.deep.equal( expectedAccount )
          done();
        } );
    } );
  } );

  describe( '/GET /accounts/admin', () => {

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/admin` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should require admin user', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/admin` )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should GET all existing users', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/admin` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          let testAccount = JSON.parse( JSON.stringify( testUser.toObject() ) );
          let adminAccount = JSON.parse( JSON.stringify( adminUser.toObject() ) );
          delete testAccount.password
          delete adminAccount.password
          res.should.have.status( 200 );
          // TODO: This should be resources (plural)
          res.body.should.have.property( 'resource' )
          res.body.resource.should.have.lengthOf( '2' )
          res.body.resource.should.deep.equal( [ testAccount, adminAccount ] )
          done();
        } );
    } );
  } );

  describe( '/PUT /accounts', () => {

    let newUser;
    let updatePayload = {
      email: 'not-new@test.com',
      password: 'another-secret-password',
      company: 'not-acme',
      name: 'not-test',
      surname: 'not-test',
      role: 'some-other-role'
    }

    before( async () => {
      newUser = await testUtils.createTestUser( 'new@test.com', 'some-role' )
    } )

    after( () => {
      newUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( routeBase )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should modify a resource', ( done ) => {
      chai.request( app )
        .put( routeBase )
        .set( 'Authorization', newUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          User.findOne( { _id: newUser._id } ).then( result => {
            result.email.should.equal( updatePayload.email )
            result.name.should.equal( updatePayload.name )
            result.surname.should.equal( updatePayload.surname )
            result.company.should.equal( updatePayload.company )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should not change password or role', ( done ) => {
      chai.request( app )
        .put( routeBase )
        .set( 'Authorization', newUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          User.findOne( { _id: newUser._id } ).then( result => {
            result.role.should.not.equal( updatePayload.role )
            result.password.should.not.equal( updatePayload.password )
            result.validatePassword( updatePayload.password, result.password, ( validation ) => {
              validation.should.be.false
              done()
            } )
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should not change password or role, even if admin!', ( done ) => {
      chai.request( app )
        .put( routeBase )
        .set( 'Authorization', adminUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          User.findOne( { _id: adminUser._id } ).then( result => {
            result.role.should.not.equal( updatePayload.role )
            result.password.should.not.equal( updatePayload.password )
            result.validatePassword( updatePayload.password, result.password, ( validation ) => {
              validation.should.be.false
              done()
            } )
          } ).catch( err => done( err ) )
        } )
    } )
  } )

  describe( '/GET /accounts/{id}', () => {

    let newUser;

    before( async () => {
      newUser = await testUtils.createTestUser( 'new@test.com', 'some-role' )
    } )

    after( () => {
      newUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${newUser._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should GET the user corresponding to the id provided', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${newUser._id}` )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resource' )
          User.findOne( {_id: newUser._id} ).then( result => {
            let user = JSON.parse( JSON.stringify( result ) )
            user.should.containSubset( res.body.resource )
            done()
          } ).catch( err => done( err ) )
        } );
    } );

    it( 'should GET not return certain keys', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${newUser._id}` )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resource' )
          res.body.resource.should.not.have.property( '__v' )
          res.body.resource.should.not.have.property( 'createdAt' )
          res.body.resource.should.not.have.property( 'email' )
          res.body.resource.should.not.have.property( 'logins' )
          res.body.resource.should.not.have.property( 'password' )
          res.body.resource.should.not.have.property( 'private' )
          res.body.resource.should.not.have.property( 'role' )
          res.body.resource.should.not.have.property( 'updatedAt' )
          res.body.resource.should.not.have.property( 'verified' )
          done()
        } );
    } );


    it( 'should GET not return certain keys even if you\'re admin', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${adminUser._id}` )
        .set( 'Authorization', testUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resource' )
          res.body.resource.should.not.have.property( '__v' )
          res.body.resource.should.not.have.property( 'createdAt' )
          res.body.resource.should.not.have.property( 'email' )
          res.body.resource.should.not.have.property( 'logins' )
          res.body.resource.should.not.have.property( 'password' )
          res.body.resource.should.not.have.property( 'private' )
          res.body.resource.should.not.have.property( 'role' )
          res.body.resource.should.not.have.property( 'updatedAt' )
          res.body.resource.should.not.have.property( 'verified' )
          done()
        } );
    } );
  } );

  describe( '/PUT /accounts/{id}', () => {

    let newUser;
    let updatePayload = {
      email: 'not-new@test.com',
      password: 'another-secret-password',
      company: 'not-acme',
      name: 'not-test',
      surname: 'not-test',
      role: 'some-other-role',
      archived: true
    }

    before( async () => {
      newUser = await testUtils.createTestUser( 'new@test.com', 'some-role' )
    } )

    after( () => {
      newUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${newUser._id}` )
        .send( updatePayload )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )


    it( 'should not allow non admin user', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${newUser._id}` )
        .set( 'Authorization', newUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should modify a resource if admin', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${newUser._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          User.findOne( { _id: newUser._id } ).then( result => {
            result.email.should.equal( updatePayload.email )
            result.name.should.equal( updatePayload.name )
            result.surname.should.equal( updatePayload.surname )
            result.company.should.equal( updatePayload.company )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should modify a role and archived if admin', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${newUser._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          User.findOne( { _id: newUser._id } ).then( result => {
            result.role.should.equal( updatePayload.role )
            result.archived.should.equal( updatePayload.archived )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should not change password', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${newUser._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          User.findOne( { _id: newUser._id } ).then( result => {
            result.validatePassword( updatePayload.password, result.password, ( validation ) => {
              validation.should.be.false
              done()
            } )
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should not change password or role, even if admin!', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${newUser._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          User.findOne( { _id: adminUser._id } ).then( result => {
            result.role.should.not.equal( updatePayload.role )
            result.password.should.not.equal( updatePayload.password )
            result.validatePassword( updatePayload.password, result.password, ( validation ) => {
              validation.should.be.false
              done()
            } )
          } ).catch( err => done( err ) )
        } )
    } )
  } )

  describe( '/POST /accounts/search', () => {

    let emailUser;
    let nameUser;
    let surnameUser;

    before( async () => {

      emailUser = new User( {
        email: 'someuser@email.com',
        password: 'super-secret-password',
        company: 'acme',
        name: 'test',
        surname: 'test',
        role: 'not-admin'
      } )

      nameUser = new User( {
        email: 'testtest@email.com',
        password: 'super-secret-password',
        company: 'acme',
        name: 'some',
        surname: 'test',
        role: 'not-admin'
      } )

      surnameUser = new User( {
        email: 'testtesttest@email.com',
        password: 'super-secret-password',
        company: 'acme',
        name: 'test',
        surname: 'some',
        role: 'not-admin'
      } )

      await emailUser.save()
      await nameUser.save()
      await surnameUser.save()
    } )

    after( async () => {
      await emailUser.remove()
      await nameUser.remove()
      await surnameUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .post( `${routeBase}/search` )
        .send( { searchString: 'some-string'} )
        .end( ( err, res ) => {
          res.should.have.status( 401 );
          done()
        } )
    } )

    it( 'should fail if less than three letters in search', ( done ) => {
      chai.request( app )
        .post( `${routeBase}/search` )
        .set( 'Authorization', testUser.apitoken )
        .send( { searchString: 'so' } )
        .end( ( err, res ) => {
          res.should.have.status( 400 );
          res.body.should.have.property( 'message' )
          res.body.message.should.equal( 'no search criteria present, or too short search string (must be > 2).' )
          done()
        } )
    } )

    it( 'should find a user by name, surname or email', ( done ) => {
      chai.request( app )
        .post( `${routeBase}/search` )
        .set( 'Authorization', testUser.apitoken )
        .send( { searchString: 'som' } )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources[0].should.have.property( 'email' )
          res.body.resources.should.have.lengthOf( '3' )
          done()
        } )
    } )

    describe( 'set EXPOSE_EMAILS to null', () => {
      let tempApp;

      before( () => {
        // It should be possible to do this with EXPOSE_EMAILS set to FALSE or something too
        process.env.EXPOSE_EMAILS = "";
        tempApp = testUtils.newAPIServer( '/api', null )

      } )

      after( () => {
        process.env.EXPOSE_EMAILS = false;
      } )

      it( 'should find only return email in the search response if EXPOSE_EMAILS is non null', ( done ) => {
        chai.request( tempApp )
          .post( `${routeBase}/search` )
          .set( 'Authorization', testUser.apitoken )
          .send( { searchString: 'som' } )
          .end( ( err, res ) => {
            res.should.have.status( 200 );
            res.body.should.have.property( 'resources' )
            res.body.resources[0].should.not.have.property( 'email' )
            done()
          } )
      } )
    } )

  } )

} );