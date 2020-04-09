/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const chaiSubset = require( 'chai-subset' );
const testUtils = require( '../testUtils' );

const SpeckleObject = require( '../../models/SpeckleObject' );

const app = testUtils.newAPIServer( '/api', null )
const should = chai.should();
const expect = chai.expect;

chai.use( chaiSubset );
chai.use( chaiHttp );

describe( 'objects', () => {

      const routeBase = '/api/objects'

      let testUser1;
      let testUser2;
      let unauthorizedUser;
      let adminUser;

      let object1;
      let object2;
      let object3;

      before( async () => {
        testUser1 = await testUtils.createTestUser( 'test1@test.com', 'not-admin' )
        testUser2 = await testUtils.createTestUser( 'test2@test.com', 'not-admin' )
        unauthorizedUser = await testUtils.createTestUser( 'unauthorized@test.com', 'not-admin' )
        adminUser = await testUtils.createTestUser( 'admin@test.com', 'admin' )
      } )

      after( async () => {
        await testUser1.remove()
        await testUser2.remove()
        await unauthorizedUser.remove()
        await adminUser.remove()
      } )

      beforeEach( async () => {

        object1 = new SpeckleObject( {
          owner: testUser1._id,
          private: true,
          name: 'Test SpeckleObject 1',
          type: 'test-object',
          geometryHash: 'hash',
          hash: 'hash',
          applicationId: 'test',
          properties: {
            foo: 'bar'
          }
        } )

        await object1.save()

        object2 = new SpeckleObject( {
          owner: testUser2._id,
          private: false,
          name: 'Test SpeckleObject 2',
          type: 'test-object',
          geometryHash: 'hash-hash',
          hash: 'hash-hash',
          applicationId: 'test',
          properties: {
            foo: 'bar'
          }
        } )

        await object2.save()

        object3 = new SpeckleObject( {
          owner: testUser2._id,
          private: true,
          canRead: [ testUser1._id ],
          name: 'Test SpeckleObject 3',
          type: 'test-object',
          geometryHash: 'hash-hash-hashh',
          hash: 'hash-hash-hash',
          applicationId: 'test',
          properties: {
            foo: 'bar'
          }
        } )
        await object3.save()

      } )

      afterEach( async () => {
        await SpeckleObject.collection.drop();
      } )


    describe( '/POST /objects', () => {

      let postPayload = {
        name: 'Test SpeckleObject',
        type: 'test-object',
        geometryHash: 'hashy-hash',
        hash: 'hashy-hash',
        applicationId: 'test',
        properties: {
          foo: 'bar'
        }
      }

      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .post( routeBase )
          .send( postPayload )
          .end( ( err, res ) => {
            res.should.have.status( 401 );
            done()
          } )
      } )

      it( 'should create a mongodb object matching the input payload', ( done ) => {
        chai.request( app )
          .post( routeBase )
          .set( 'Authorization', testUser1.apitoken )
          .send( postPayload )
          .end( ( err, res ) => {
            const _id = res.body.resources[0]._id;
            SpeckleObject.findOne( { _id } ).then( object => {
              object.should.containSubset( postPayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )
    } )

    describe( '/GET /objects/{id}', () => {

      it( 'should not require authentication', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${object2._id}` )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            done()
          } )
      } )

      it( 'should require user to have some form of access', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${object1._id}` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should return a resource if user is owner', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${object1._id}` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            SpeckleObject.findOne( { _id: object1._id } ).then( result => {
                res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
                done()
              } ).catch( err => done( err ) )
            } )
          } )

      it( 'should return a resource if user has read access', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${object3._id}` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            SpeckleObject.findOne( { _id: object3._id } ).then( result => {
              res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should return a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${object3._id}` )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            SpeckleObject.findOne( { _id: object3._id } ).then( result => {
              res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

    } );


    describe( '/PUT /objects/{id}', () => {

      let updatePayload = {
        name: 'Test SpeckleObject update',
        type: 'test-object update',
        geometryHash: 'hashy-hash update',
        hash: 'hashy-hash update',
        applicationId: 'test update',
        properties: {
          foo: 'bar update'
        }
      }


      beforeEach( async () => {

        object1 = await SpeckleObject.findOne( {_id: object1._id} );
        object1.canWrite = [ testUser2._id ]

        await object1.save()
      } )

      afterEach( async () => {
        object1 = await SpeckleObject.findOne( {_id: object1._id} );
        object1.canWrite = [ ]

        await object1.save()
      } )

      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}` )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users without write access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users with read access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object3._id}` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should modify a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}` )
          .set( 'Authorization', adminUser.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              res.should.containSubset( updatePayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should modify a resource if user is non-owner with write access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}` )
          .set( 'Authorization', testUser2.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              res.should.containSubset( updatePayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should modify a resource if user is owner', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}` )
          .set( 'Authorization', testUser1.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              res.should.containSubset( updatePayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

    } )

    describe( '/PUT /objects/{id}/properties', () => {


      let updatePayload = {
       foo: 'bar update',
       new: 'property'
      }


      beforeEach( async () => {

        object1 = await SpeckleObject.findOne( {_id: object1._id} );
        object1.canWrite = [ testUser2._id ]

        await object1.save()
      } )

      afterEach( async () => {
        object1 = await SpeckleObject.findOne( {_id: object1._id} );
        object1.canWrite = [ ]

        await object1.save()
      } )

      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}/properties` )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users without write access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}/properties` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users with read access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object3._id}/properties` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should modify a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}/properties` )
          .set( 'Authorization', adminUser.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              res.properties.should.containSubset( updatePayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should modify a resource if user is non-owner with write access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}/properties` )
          .set( 'Authorization', testUser2.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              res.properties.should.containSubset( updatePayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should modify a resource if user is owner', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${object1._id}/properties` )
          .set( 'Authorization', testUser1.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              res.properties.should.containSubset( updatePayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

    } )

    describe( '/POST /objects/derive', () => {


      let derivePayload;
      let object1Copy;

      beforeEach( async () => {

        derivePayload = [
          { _id: object1._id },
          { _id: object2._id },
          { _id: object3._id },
        ]

        object1Copy = {
          private: object1.private,
          name: object1.name,
          type: object1.type,
          geometryHash: object1.geometryHash,
          applicationId: object1.applicationId,
          properties: object1.properties,
        }

        object1 = await SpeckleObject.findOne( {_id: object1._id} );
        object1.canRead = [ unauthorizedUser._id ]

        await object1.save()

      } )

      afterEach( async () => {
        object1 = await SpeckleObject.findOne( {_id: object1._id} );
        object1.canRead = [ ]

        await object1.save()
      } )

      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/derive` )
          .send( derivePayload )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should require user to have some form of access', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/derive` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .send( derivePayload )
          .end( ( err, res ) => {
            res.body.resources.should.have.lengthOf( '2' )

            SpeckleObject.find( { owner: unauthorizedUser._id } ).then(
              objects => {
                objects.length.should.equal( 2 );
                objects[0].name = object1.name;
                objects[1].name = object2.name;
              }
            ).catch( err => done( err ) )

            done()
          } )
      } )

      it( 'should require a payload of object ID objects', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/derive` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should derive a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/derive` )
          .set( 'Authorization', adminUser.apitoken )
          .send( [ {_id: object1._id} ] )
          .end( ( err, res ) => {
            res.body.resources.should.have.lengthOf( '1' )
            SpeckleObject.findOne( {
              _id: res.body.resources[0]._id
            } ).then( res => {
              res.should.containSubset( object1Copy );
              res.hash.should.not.equal( object1.hash )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

    } )


    describe( '/POST /objects/getBulk', () => {


      let derivePayload;
      let object1Copy;

      beforeEach( async () => {

        getBulkPayload = [
          object1._id ,
          object2._id ,
          object3._id ,
        ]

        object1Copy = {
          private: object1.private,
          name: object1.name,
          type: object1.type,
          geometryHash: object1.geometryHash,
          applicationId: object1.applicationId,
          properties: object1.properties,
        }

      } )

      it( 'should not require authentication and only return public objects', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/getBulk` )
          .send( getBulkPayload )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            done()
            } )
          } )

      it( 'should return full public objects and unauthorized message for private objects if user is not authenticated', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/getBulk` )
          .send( getBulkPayload )
          .end( ( err, res ) => {
            res.body.resources.should.have.lengthOf( '3' )
            res.body.resources[0].value.should.be.equal( 'You do not have permissions to view this object' )
            res.body.resources[1].name.should.be.equal( 'Test SpeckleObject 2' )
            res.body.resources[2].value.should.be.equal( 'You do not have permissions to view this object' )
            done()
            } )
      } )

      it( 'should return all resources if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/getBulk` )
          .set( 'Authorization', adminUser.apitoken )
          .send( getBulkPayload )
          .end( ( err, res ) => {
            res.body.resources.should.have.lengthOf( '3' )
            res.body.resources[0].name.should.be.equal( 'Test SpeckleObject 1' )
            res.body.resources[1].name.should.be.equal( 'Test SpeckleObject 2' )
            res.body.resources[2].name.should.be.equal( 'Test SpeckleObject 3' )
            done()
          } )
      } )

    } )


    describe( '/DELETE /objects/{id}', () => {



      beforeEach( async () => {

        object1 = await SpeckleObject.findOne( {_id: object1._id} );
        object1.canWrite = [ testUser2._id ]

        await object1.save()
      } )

      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${object1._id}` )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users without write access', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${object1._id}` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 404 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users with read access', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${object3._id}` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 404 )
            done()
          } )
      } )

      it( 'should delete a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${object1._id}` )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              expect( res ).to.be.a( 'null' )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should not delete a resource if user is non-owner with write access', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${object1._id}` )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status ( 404 )
            done()
          } )
      } )

      it( 'should delete a resource if user is owner', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${object1._id}` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            SpeckleObject.findOne( {
              _id: object1._id
            } ).then( res => {
              expect( res ).to.be.a( 'null' )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

    } )

    }
)