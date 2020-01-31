/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const chaiSubset = require( 'chai-subset' );
const testUtils = require( '../testUtils' );

const SpeckleObject = require( '../../models/SpeckleObject' );
const DataStream = require( '../../models/DataStream' );

const app = testUtils.newAPIServer( '/api', null )
const should = chai.should();
const expect = chai.expect;

chai.use( chaiSubset );
chai.use( chaiHttp );



describe( 'streams', () => {

      const routeBase = '/api/streams'

      let testUser1;
      let testUser2;
      let unauthorizedUser;
      let adminUser;

      let stream1;
      let stream2;
      let stream3;
      let stream4;


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

        // Save objects first so their _id can be assigned to a stream
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
          owner: testUser1._id,
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
          owner: testUser1._id,
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


        stream1 = new DataStream( {
          owner: testUser1._id,
          private: true,
          streamId: 'stream1',
          name: 'Test Stream 1',
          description: 'A test stream for testing purposes',
          objects: [
            object1._id,
            object2._id,
            object3._id
          ]
        } )

        await stream1.save();

        stream2 = new DataStream( {
          owner: testUser1._id,
          private: false,
          streamId: 'stream2',
          name: 'Test Stream 2',
          description: 'A test stream for testing purposes',
          objects: [
            object1._id,
            object2._id,
            object3._id
          ]
        } )

        await stream2.save();

        stream3 = new DataStream( {
          owner: testUser1._id,
          private: true,
          streamId: 'stream3',
          name: 'Test Stream 3',
          description: 'A test stream for testing purposes',
          objects: [
            object1._id,
          ]
        } )

        await stream3.save();

        stream4 = new DataStream( {
          owner: testUser2._id,
          private: true,
          streamId: 'stream4',
          name: 'Test Stream 4',
          description: 'A test stream for testing purposes',
          objects: [
            object1._id,
            object2._id,
            object3._id
          ]
        } )

        await stream4.save();


      } )

      afterEach( async () => {
        await DataStream.collection.drop();
        await SpeckleObject.collection.drop();
      } )

    describe( '/POST /streams', () => {

      let postPayload;

      beforeEach( () => {
        postPayload = {
          private: true,
          name: 'Test Stream',
          description: 'A test stream for posting purposes',
          objects: [
            object1,
            object2,
            object3
          ]
        }
      } )

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
            res.should.have.status( 200 )
            const _id = res.body.resource._id;
            DataStream.findOne( { _id } ).then( stream => {
              postPayload.objects = postPayload.objects.map( o => o._id )
              stream.should.containSubset( postPayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      // TODO: Should probably not allow this...
      it( 'should allow users to create streams with objects they do not have access to', ( done ) => {
        chai.request( app )
          .post( routeBase )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .send( postPayload )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            const _id = res.body.resource._id;
            DataStream.findOne( { _id } ).then( stream => {
              postPayload.objects = postPayload.objects.map( o => o._id )
              stream.should.containSubset( postPayload )
              done()
            } ).catch( err => done( err ) )
          } )
      } )


    } );


    describe( '/GET /streams', () => {

      beforeEach( async () => {
        stream3.canRead = [ testUser2._id ];
        await stream3.save()
      } );

      afterEach( async () => {
        stream3.canRead = [ ];
        await stream3.save()
      } );

      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .get( routeBase )
          .end( ( err, res ) => {
            res.should.have.status( 401 );
            done()
          } )
      } )

      it( 'should return streams where user is owner', ( done ) => {
        chai.request( app )
          .get( routeBase )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 );
            res.body.resources.should.have.lengthOf( '3' )
            done()
          } )
      } )

      it( 'should return streams where user is not owner but has read access', ( done ) => {
        chai.request( app )
          .get( routeBase )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 );
            res.body.resources.should.have.lengthOf( '3' )
            done()
          } )
      } )

      it( 'should return all public streams if user has read access to or owns none', ( done ) => {
        chai.request( app )
          .get( routeBase )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 );
            res.body.resources.should.have.lengthOf( '1' )
            done()
          } )
      } )
    } );

    describe( '/GET /streams/admin', () => {
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
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should GET all the streams regardless of ownership or write/read access', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/admin` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources.should.have.lengthOf( '4' )
          done();
        } );
      } );
    } );

    describe( '/GET /streams/{id}', () => {

      let defaultLayer = {
        name: "Default Generated Speckle Layer",
        objectCount: 3,
        orderIndex: 0,
        properties: {
          color: {
            a: 1,
            hex: "Black",
          }
        },
        startIndex: 0,
        topology: "0;0-3 ",
      }

      let streamSubset = {
        private: true,
        streamId: 'stream1',
        name: 'Test Stream 1',
        description: 'A test stream for testing purposes',
      }

      beforeEach( async () => {
        stream3.canRead = [ testUser2._id ];
        await stream3.save()
      } );

      afterEach( async () => {
        stream3.canRead = [];
        await stream3.save()
      } );



      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${stream1.streamId}` )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should require user to have some form of access', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should return a resource if user is owner', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.resource.should.containSubset( streamSubset );
            res.body.resource.objects.should.have.lengthOf( '3' )
            done()
            } )
        } )


      it( 'should add a default layer if none exists', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.resource.layers[0].should.containSubset( defaultLayer );
            done()
            } )
        } )

      it( 'should return a resource if user has read access', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${stream3.streamId}` )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            done()
          } )
      } )

      it( 'should return a resource if it is not private', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${stream2.streamId}` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            done()
          } )
      } )


      it( 'should return a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .get( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.resource.should.containSubset( streamSubset );
            res.body.resource.objects.should.have.lengthOf( '3' )
            done()
          } )
      } )


    } );

    describe( '/PUT /streams/{id}', () => {

      let updatePayload = {
        name: 'Updated Stream',
        objects: [
          {
            private: true,
            name: 'updated Stream object',
            type: 'test-object',
            geometryHash: 'updated-hash',
            hash: 'updated-hash',
            applicationId: 'test',
            properties: {
              foo: 'bar'
            }
          }
        ]
      }

      let numberOfObjects;

      beforeEach( async () => {
        stream2.canRead = [ testUser2._id ];
        await stream2.save()

        stream3.canWrite = [ testUser2._id ];
        await stream3.save()

        numberOfObjects = await SpeckleObject.countDocuments();
      } );

      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream1.streamId}` )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users without access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser2.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should not accept request from non owner users with read only access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream2.streamId}` )
          .set( 'Authorization', testUser2.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should modify a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', adminUser.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( { streamId: stream1.streamId } ).then( stream => {
              stream.name.should.equal( updatePayload.name )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should modify a resource if user is non-owner with write access', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream3.streamId}` )
          .set( 'Authorization', testUser2.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( { streamId: stream3.streamId } ).then( stream => {
              stream.name.should.equal( updatePayload.name )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should modify a resource if user is owner', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser1.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( { streamId: stream1.streamId } ).then( stream => {
              stream.name.should.equal( updatePayload.name )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      // TODO: I don't think it's expected to work this way though...
      it( 'should replace all objects if present in update payload (no upsert behaviour)', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser1.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( { streamId: stream1.streamId } ).then( stream => {
              stream.objects.should.have.lengthOf( '1' )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should create object if it is not of type "Placeholder"', ( done ) => {
        chai.request( app )
          .put( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser1.apitoken )
          .send( updatePayload )
          .end( ( err, res ) => {
            SpeckleObject.countDocuments().then( res => {
              res.should.equal( numberOfObjects + 1 )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

    } );

    describe( '/DELETE /streams/{id}', () => {
      let numberOfStreams;

      beforeEach( async () => {
        stream1.children = [
          stream2.streamId,
          stream3.streamId
        ]
        await stream1.save()

        stream3.canWrite = [ testUser2._id ];
        await stream3.save()
        numberOfStreams = await DataStream.countDocuments();

      } )


      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${stream1.streamId}` )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            DataStream.findOne( { streamId: stream3.streamId } ).then( stream => {
              should.not.equal( stream, null )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should not accept request from non owner users without write access', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 404 )
            DataStream.findOne( { streamId: stream3.streamId } ).then( stream => {
              should.not.equal( stream, null )
              done()
            } ).catch( err => done( err ) )
          } )
      } )


      it( 'should delete a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( { streamId: stream1.streamId } ).then( stream => {
              should.equal( stream, null )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should not delete a resource if user is non-owner with write access', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${stream3.streamId}` )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 404 )
            DataStream.findOne( { streamId: stream3.streamId } ).then( stream => {
              should.not.equal( stream, null )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should delete a resource if user is owner', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( { streamId: stream1.streamId } ).then( stream => {
              should.equal( stream, null )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

      it( 'should delete all children streams', ( done ) => {
        chai.request( app )
          .delete( `${routeBase}/${stream1.streamId}` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.countDocuments().then( res => {
              res.should.equal( numberOfStreams - 3 )
              done()
            } ).catch( err => done( err ) )
          } )
      } )

    } );

    describe( '/POST /streams/{id}/clone', () => {

      let defaultLayer = {
        name: "Default Generated Speckle Layer",
        objectCount: 3,
        orderIndex: 0,
        properties: {
          color: {
            a: 1,
            hex: "Black",
          }
        },
        startIndex: 0,
        topology: "0;0-3 ",
      }

      let streamSubset = {
        private: true,
        name: 'Test Stream 1 (clone)',
        description: 'A test stream for testing purposes',
      }

      let stream2Subset = {
        private: false,
        name: 'Test Stream 2 (clone)',
        description: 'A test stream for testing purposes',
      }

      let stream3Subset = {
        private: true,
        name: 'Test Stream 3 (clone)',
        description: 'A test stream for testing purposes',
      }

      beforeEach( async () => {
        stream1.children = [ 'test' ];
        await stream1.save();

        stream3.canRead = [ testUser2._id ];
        await stream3.save()
      } );


      it( 'should require authentication', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream1.streamId}/clone` )
          .end( ( err, res ) => {
            res.should.have.status( 401 )
            done()
          } )
      } )

      it( 'should require user to have some form of access', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream1.streamId}/clone` )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 400 )
            done()
          } )
      } )

      it( 'should clone a stream if user is owner', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream1.streamId}/clone` )
          .set( 'Authorization', testUser1.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.clone.should.containSubset( streamSubset );
            DataStream.findOne( {streamId: res.body.clone.streamId} ).then( stream => {
              should.not.equal( stream, null )
              stream.objects.should.have.lengthOf( '3' )
              done()
              } ).catch( err => done( err ) )
            } )
        } )


      it( 'should return a resource if user has read access', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream3.streamId}/clone` )
          .set( 'Authorization', testUser2.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.clone.should.containSubset( stream3Subset );
            DataStream.findOne( {streamId: res.body.clone.streamId} ).then( stream => {
              should.not.equal( stream, null )
              stream.objects.should.have.lengthOf( '1' )
              done()
              } ).catch( err => done( err ) )
            } )
      } )

      it( 'should return a resource if it is not private', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream2.streamId}/clone` )
          .set( 'Authorization', unauthorizedUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.clone.should.containSubset( stream2Subset );
            DataStream.findOne( {streamId: res.body.clone.streamId} ).then( stream => {
              should.not.equal( stream, null )
              stream.objects.should.have.lengthOf( '3' )
              done()
              } ).catch( err => done( err ) )
            } )
      } )


      it( 'should return a resource if user is admin regardless of access', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream1.streamId}/clone` )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.clone.should.containSubset( streamSubset );
            DataStream.findOne( {streamId: res.body.clone.streamId} ).then( stream => {
              should.not.equal( stream, null )
              stream.objects.should.have.lengthOf( '3' )
              done()
              } ).catch( err => done( err ) )
            } )
      } )



      it( 'should accept a new name for the clone in the post payload', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream1.streamId}/clone` )
          .send( {name: 'new name'} )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            res.body.clone.name.should.equal( 'new name' );
            DataStream.findOne( {streamId: res.body.clone.streamId} ).then( stream => {
              should.not.equal( stream, null )
              stream.name.should.equal( 'new name' )
              done()
              } ).catch( err => done( err ) )
            } )
      } )


      it( 'should add stream cloned from as a parent to the new stream', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream1.streamId}/clone` )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( {streamId: res.body.clone.streamId} ).then( stream => {
              stream.parent.should.equal( stream1.streamId )
              done()
              } ).catch( err => done( err ) )
            } )
      } )

      it( 'should new stream to list of parent stream children', ( done ) => {
        chai.request( app )
          .post( `${routeBase}/${stream1.streamId}/clone` )
          .set( 'Authorization', adminUser.apitoken )
          .end( ( err, res ) => {
            res.should.have.status( 200 )
            DataStream.findOne( {streamId: stream1.streamId} ).then( stream => {
              stream.children.should.deep.equal( [ 'test', res.body.clone.streamId ] )
              done()
              } ).catch( err => done( err ) )
            } )
      } )

    } );



    describe( '/GET /streams/{id}/diff/{otherId}', () => {

      // Not implemented!
      // TODO: Implement!!!

    } );



    describe( '/GET /streams/{id}/objects', () => {

      // Not implemented!
      // TODO: Implement!!!

    } );


    describe( '/GET /streams/{id}/clients', () => {

      // Not implemented!
      // TODO: Implement!!!

    } );

    }
)