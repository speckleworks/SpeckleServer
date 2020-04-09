/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const chaiSubset = require( 'chai-subset' );
const testUtils = require( '../testUtils' );

const Project = require( '../../models/Project' );
const Stream = require( '../../models/DataStream' );

const app = testUtils.newAPIServer( '/api', null )
const should = chai.should();
const expect = chai.expect;

chai.use( chaiSubset );
chai.use( chaiHttp );

describe( 'projects', () => {

  const routeBase = '/api/projects'
  const testStreamId = 'some-id'

  let projectPayload = {
    name: 'Test Project',
    description: 'A project for testing purposes',
    tags: [ 'test', 'CI' ],
    jobNumber: 'Mario Number 1'
  }

  let testUser1;
  let testUser2;
  let adminUser;

  let project1;
  let project2;

  before( async () => {
    testUser1 = await testUtils.createTestUser( 'test1@test.com', 'not-admin' )
    testUser2 = await testUtils.createTestUser( 'test2@test.com', 'not-admin' )
    adminUser = await testUtils.createTestUser( 'admin@test.com', 'admin' )

    projectPayload.owner = testUser1._id

  } )

  after( async () => {
    await testUser1.remove()
    await testUser2.remove()
    await adminUser.remove()
  } )

  beforeEach( async () => {
    testStream = new Stream( {
      streamId: testStreamId,
      owner: testUser1._id,
    } )

    await testStream.save()

    // User 1 is owner of Project 1
    project1 = new Project( projectPayload )
    project1.owner = testUser1._id

    // User 2 is owner of Project 2
    project2 = new Project( projectPayload )
    project2.owner = testUser2._id

    // User 1 is owner of Project 3
    // User 2 has read access on Project 3
    project3 = new Project( projectPayload )
    project3.name = "Project the Third"
    project3.owner = testUser1._id
    project3.canRead = [ testUser2._id ]

    // User 1 is owner of Project 4
    // User 2 has write access on Project 4
    project4 = new Project( projectPayload )
    project4.owner = testUser1._id
    project4.canWrite = [ testUser2._id ]

    await project1.save()
    await project2.save()
    await project3.save()
    await project4.save()

  } )

  afterEach( async () => {
    await Stream.collection.drop();
    await Project.collection.drop();
  } )


  describe( '/GET /projects', () => {
    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should GET all the projects where user is owner', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources.should.have.lengthOf( '3' )
          res.body.resources.should.deep.equal( JSON.parse( JSON.stringify( [ project1.toObject(), project3.toObject(), project4.toObject() ] ) ) )
          done();
        } );
    } );

    it( 'should GET all the projects where user is has read or write access', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources.should.have.lengthOf( '3' )
          res.body.resources.should.deep.equal( JSON.parse( JSON.stringify( [ project2.toObject(), project3.toObject(), project4.toObject() ] ) ) )
          done();
        } );
    } );

    it( 'should GET query projects user has access to', ( done ) => {
      chai.request( app )
        .get( routeBase )
        .set( 'Authorization', testUser2.apitoken )
        .query( { name: 'Test Project', limit: 10 } )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources.should.have.lengthOf( '2' )
          res.body.resources.should.deep.equal( JSON.parse( JSON.stringify( [ project2.toObject(), project4.toObject() ] ) ) )
          done();
        } );
    } );

  } );

  describe( '/GET /projects/admin', () => {
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

    it( 'should GET all the projects regardless of ownership or write/read access', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/admin` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources.should.have.lengthOf( '4' )
          res.body.resources.should.deep.equal( JSON.parse( JSON.stringify( [ project1.toObject(), project2.toObject(), project3.toObject(), project4.toObject() ] ) ) )
          done();
        } );
    } );

    it( 'should GET query all projects', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/admin` )
        .set( 'Authorization', adminUser.apitoken )
        .query( { name: 'Test Project', limit: 10 } )
        .end( ( err, res ) => {
          res.should.have.status( 200 );
          res.body.should.have.property( 'resources' )
          res.body.resources.should.have.lengthOf( '3' )
          res.body.resources.should.deep.equal( JSON.parse( JSON.stringify( [ project1.toObject(), project2.toObject(), project4.toObject() ] ) ) )
          done();
        } );
    } );

  } );

  describe( '/POST /projects', () => {

    let postPayload = {
      name: 'Post Project',
      description: 'A project for testing post requests',
      tags: [ 'POST', 'CI' ],
      jobNumber: 'Luigi Number 1'
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
          const _id = res.body.resource._id;
          Project.findOne( { _id } ).then( project => {
            project.should.containSubset( postPayload )
            done()
          } ).catch( err => done( err ) )
        } )
    } )
  } )

  describe( '/PUT /projects/{id}', () => {

    let unauthorizedUser
    let updatePayload = {
      name: 'New Project Who Dis?',
      jobNumber: 'Wario number 1'
    }

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should not accept request from non owner users without write access', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should not accept request from non owner users with read access', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project3._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should modify a resource if user is admin regardless of access', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project4._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          Project.findOne( { _id: project4._id } ).then( project => {
            project.should.containSubset( updatePayload )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should modify a resource if user is non-owner with write access', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project4._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          Project.findOne( { _id: project4._id } ).then( project => {
            project.should.containSubset( updatePayload )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should modify a resource if user is owner', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project4._id}` )
        .set( 'Authorization', testUser1.apitoken )
        .send( updatePayload )
        .end( ( err, res ) => {
          Project.findOne( { _id: project4._id } ).then( project => {
            project.should.containSubset( updatePayload )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

  } )

  describe( '/GET /projects/{id}', () => {

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${project1._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should require user to have some form of access', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${project1._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should return a resource if user is owner', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${project1._id}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project1._id } ).then( result => {
              res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
              done()
            } ).catch( err => done( err ) )
          } )
        } )

    it( 'should return a resource if user has read access', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${project3._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project3._id } ).then( result => {
            res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should return a resource if user has write access', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${project4._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project4._id } ).then( result => {
            res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should return a resource if user is admin regardless of access', ( done ) => {
      chai.request( app )
        .get( `${routeBase}/${project1._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project1._id } ).then( result => {
            res.body.resource.should.containSubset( JSON.parse( JSON.stringify( result ) ) )
            done()
          } ).catch( err => done( err ) )
        } )
    } )
  } )

  describe( '/DELETE /projects/{id}', () => {
    let otherStream
    let project5

    beforeEach( async () => {
      // Set up stream with read permission from testUser2 and adminUser
      otherStream = new Stream( {
        streamId: 'otherStream',
        owner: testUser2._id,
      } )
      otherStream.canRead = [ testUser2._id, adminUser._id ]
      otherStream.canWrite = [ adminUser._id ]
      await otherStream.save()

      // Add read permission to testUser2 and adminUser on testStream
      testStream.canRead = [ testUser2._id, adminUser._id ]
      // Add write permission to adminUser on testStream
      testStream.canWrite = [ adminUser._id ]

      await testStream.save()

      project1.streams = [ testStream.streamId, otherStream.streamId ]
      project1.permissions.canRead = [ testUser2._id, adminUser._id ]
      project1.permissions.canWrite = [ adminUser._id ]

      await project1.save()

      project5 = new Project( projectPayload )
      project5.jobNumber = "Mario Number 5"
      project5.streams = [ testStreamId ]
      project5.permissions.canRead = [ testUser2._id ]
      await project5.save()
    } )

    afterEach( async () => {
      testStream.canRead = []
      testStream.canWrite = []
      await testStream.save()

      try {
        project1.streams = []
        project1.permissions.canRead = []
        project1.permissions.canWrite = []
        await project1.save()
      } catch ( err ) {
        // No need to do anything here, this will happen if project is succesfully deleted
      }


      await otherStream.remove()

      try {
        await project5.remove()
      } catch ( err ) {
        // If it can't remove it then it's probably been deleted right? ;)
        return
      }
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project5._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should accept request if user is owner', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project1._id } )
            .then( result => {
              expect( result ).to.be.a( 'null' )
              done()
            } ).catch( err => done( err ) )
        } )
    } )

    it( 'should not accept request if user has read access', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project3._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 400 )
          Project.findOne( { _id: project1._id } )
            .then( result => {
              expect( result ).not.to.be.a( 'null' )
              done()
            } ).catch( err => done( err ) )
        } )
    } )

    it( 'should not accept request if user has write access', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project4._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 400 )
          Project.findOne( { _id: project1._id } )
            .then( result => {
              expect( result ).not.to.be.a( 'null' )
              done()
            } ).catch( err => done( err ) )
        } )
    } )

    it( 'should accept request if user is admin regardless of access', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project1._id } )
            .then( result => {
              expect( result ).to.be.a( 'null' )
              done()
            } ).catch( err => done( err ) )
        } )
    } )

    it( 'should keep stream permissions if user has them in other projects', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          Stream.findOne( { _id: testStream._id } )
            .then( result => {
              expect( result.canWrite ).to.be.an( 'array' ).that.is.empty
              expect( result.canRead ).to.deep.equal( [ testUser2._id ] )
              done()
            } ).catch( err => done( err ) )
        } )
    } )

    it( 'should remove stream permissions if user does not have them in other projects', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          Stream.findOne( { _id: otherStream._id } )
            .then( result => {
              expect( result.canRead ).to.be.an( 'array' ).that.is.empty
              expect( result.canWrite ).to.be.an( 'array' ).that.is.empty
              done()
            } ).catch( err => done( err ) )
        } )
    } )

  } )

  describe( '/PUT /projects/{id}/adduser/{user_id}', () => {

    let newUser;

    beforeEach( async () => {
      project1.streams = [ testStream.streamId ]
      await project1.save()

      project2.streams = [ testStream.streamId ]
      await project2.save()

      project3.streams = [ testStream.streamId ]
      await project3.save()

      project4.streams = [ testStream.streamId ]
      await project4.save()

      newUser = await testUtils.createTestUser( 'new@test.com', 'not-admin' )
    } )

    afterEach( async () => {
      testStream.canRead = []
      testStream.canWrite = []
      await testStream.save()

      project1.streams = []
      project1.canRead = []
      project1.canWrite = []
      await project1.save()

      project2.streams = []
      project2.canRead = []
      project2.canWrite = []
      await project2.save()

      project3.streams = []
      project3.canRead = [ testUser2._id ]
      project3.canWrite = []
      await project3.save()

      project4.streams = []
      project4.canRead = []
      project4.canWrite = [ testUser2._id ]
      await project4.save()

      await newUser.remove()
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/adduser/${newUser._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should not work if user has read access', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project3._id}/adduser/${newUser._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          Project.findOne( {_id: project3._id} ).then( result => {
            expect( result.canRead ).to.deep.equal( [ testUser2._id ] )
            expect( result.permissions.canWrite ).to.be.an( 'array' ).that.is.empty
            Stream.findOne( {_id: testStream._id} ).then( s => {
              expect( s.canWrite ).to.be.an( 'array' ).that.is.empty
              done()
            } ).catch( err => done( err ) )
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should give read access to project and write access to streams if user is owner', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project3._id}/adduser/${newUser._id}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project3._id } ).then( result => {
            expect( result.canRead ).to.deep.equal( [ testUser2._id, newUser._id ] )
            expect( result.permissions.canWrite ).to.deep.equal( [ newUser._id ] )
            Stream.findOne( { _id: testStream._id } ).then( s => {
              expect( s.canWrite ).to.deep.equal( [ newUser._id ] )
              done()
            } ).catch( err => done( err ) )
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should give read access to project and write access to streams if user has write access', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project4._id}/adduser/${newUser._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project4._id } ).then( result => {
            expect( result.canRead ).to.deep.equal( [ newUser._id ] )
            expect( result.canWrite ).to.deep.equal( [ testUser2._id ] )
            expect( result.permissions.canWrite ).to.deep.equal( [ newUser._id ] )
            Stream.findOne( { _id: testStream._id } ).then( s => {
              expect( s.canWrite ).to.deep.equal( [ newUser._id ] )
              done()
            } ).catch( err => done( err ) )
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should give read access to project and write access to streams if user is admin', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project4._id}/adduser/${newUser._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project4._id } ).then( result => {
            expect( result.canRead ).to.deep.equal( [ newUser._id ] )
            expect( result.canWrite ).to.deep.equal( [ testUser2._id ] )
            expect( result.permissions.canWrite ).to.deep.equal( [ newUser._id ] )
            Stream.findOne( { _id: testStream._id } ).then( s => {
              expect( s.canWrite ).to.deep.equal( [ newUser._id ] )
              done()
            } ).catch( err => done( err ) )
          } ).catch( err => done( err ) )
        } )
    } )

  } )

  describe( '/DELETE /projects/{id}/removeUser/{user_id}', () => {

    let otherStream
    let project5

    beforeEach( async () => {
      // Set up stream with read permission from testUser2 and adminUser
      otherStream = new Stream( {
        streamId: 'otherStream',
        owner: testUser2._id,
      } )
      otherStream.canRead = [ testUser2._id, adminUser._id ]
      otherStream.canWrite = [ adminUser._id ]
      await otherStream.save()

      // Add read permission to testUser2 and adminUser on testStream
      testStream.canRead = [ testUser2._id, adminUser._id ]
      // Add write permission to adminUser on testStream
      testStream.canWrite = [ adminUser._id ]
      await testStream.save()

      project1.streams = [ testStream.streamId, otherStream.streamId ]
      project1.permissions.canRead = [ testUser2._id, adminUser._id ]
      project1.permissions.canWrite = [ adminUser._id ]

      await project1.save()

      project5 = new Project( projectPayload )
      project5.streams = [ testStream.streamId ]
      project5.permissions.canRead = [ testUser2._id ]
      await project5.save()
    } )

    afterEach( async () => {
      testStream.canRead = []
      testStream.canWrite = []
      await testStream.save()

      try {
        project1.streams = []
        project1.permissions.canRead = []
        project1.permissions.canWrite = []
        await project1.save()
      } catch ( err ) {
        // No need to do anything here, this will happen if project is succesfully deleted
      }


      await otherStream.remove()

      try {
        await project5.remove()
      } catch ( err ) {
        // If it can't remove it then it's probably been deleted right? ;)
        return
      }
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}/removeuser/${testUser2._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should not work if user has read access', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project3._id}/removeuser/${testUser2._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should remove read access to user on project', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project3._id}/removeuser/${testUser2._id}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project3._id } ).then( result => {
            expect( result.canRead ).to.be.an( 'array' ).that.is.empty
            done()
          } ).catch( err => done( err ) )
        } )
    } )


    it( 'should remove write access to user on project', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project4._id}/removeuser/${testUser2._id}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project4._id } ).then( result => {
            expect( result.canWrite ).to.be.an( 'array' ).that.is.empty
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should keep stream permissions if user has them in other projects', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}/removeuser/${testUser2._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          Stream.findOne( { _id: testStream._id } )
            .then( result => {
              expect( result.canRead ).to.include( testUser2._id )
              done()
            } ).catch( err => done( err ) )
        } )
    } )

    it( 'should remove stream permissions if user does not have them in other projects', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}/removeuser/${testUser2._id}` )
        .set( 'Authorization', adminUser.apitoken )
        .end( ( err, res ) => {
          Stream.findOne( { _id: otherStream._id } )
            .then( result => {
              // expect( result.canRead ).to.be.an( 'array' ).that.is.empty
              expect( result.canRead ).to.deep.equal( [ adminUser._id ] )
              expect( result.canWrite ).to.deep.equal( [ adminUser._id ] )
              done()
            } ).catch( err => done( err ) )
        } )
    } )

  } )

  describe( '/PUT /projects/{id}/addstream/{stream_id}', () => {

    beforeEach( async () => {
      project1.permissions.canRead = [ testUser2._id ]
      project1.permissions.canWrite = [ adminUser._id ]
      await project1.save()
    } )

    afterEach( () => {
      Project.findOne( {_id: project1._id} ).then( res => {
        res.permissions.canRead = []
        res.permissions.canWrite = []
        return res.save()
      } )
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/addstream/${testStream.streamId}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )


    it( 'should require user to have write access to the project', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/addstream/${testStream.streamId}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 400 )
          done()
        } )
    } )

    it( 'should require user to have write access to the stream', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project2._id}/addstream/${testStream.streamId}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 400 )
          done()
        } )
    } )

    it( 'should add a stream to a project if a user can write to project and stream', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/addstream/${testStream.streamId}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project1._id} ).then( result => {
            expect( result.streams ).to.deep.equal( [ testStream.streamId ] )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should update stream permissions with users in project.permissions object', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/addstream/${testStream.streamId}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Stream.findOne( { _id: testStream._id } ).then( result => {
            result.canRead.should.include( testUser2._id )
            result.canWrite.should.include(  adminUser._id )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should update stream permissions with project owner read + write on stream', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/addstream/${testStream.streamId}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Stream.findOne( { _id: testStream._id } ).then( result => {
            result.canRead.should.deep.equal( [ testUser2._id, testUser1._id ] )
            result.canWrite.should.deep.equal( [ adminUser._id, testUser1._id ] )
            done()
          } ).catch( err => done( err ) )
        } )
    } )

  } )

  describe( '/DELETE /projects/{id}/removestream/{stream_id}', () => {

    let testStream2;

    beforeEach( async () => {
      testStream2 = new Stream( {
        streamId: 'some-other-stream',
        owner: testUser1._id,
        canRead: [ testUser1._id, testUser2._id ],
        canWrite: [ ]
      } )

      await testStream2.save()

      project2.streams = [ testStream.streamId, testStream2.streamId ]
      project2.permissions.canRead = [ testUser2._id, testUser1._id ]
      await project2.save()

      project1.permissions.canRead = [ testUser2._id ]
      project1.permissions.canWrite = [ adminUser._id ]
      project1.streams = [ testStream.streamId ]
      await project1.save()

      testStream.canRead = [ testUser2._id, testUser1._id ]
      testStream.canWrite = [ adminUser._id ]
      await testStream.save()
    } )

    afterEach( async () => {
      await testStream2.remove()

      project2.permissions.canRead = []
      project2.streams = []
      await project2.save()

      await Project.findOne( { _id: project1._id } ).then( res => {
        res.permissions.canRead = []
        res.permissions.canWrite = []
        res.streams = []
        return res.save()
      } )
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}/removestream/${testStream.streamId}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )


    it( 'should require user to have write access to the project', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}/removestream/${testStream.streamId}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should require user to have write access to the stream', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project2._id}/removestream/${testStream.streamId}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should remove a stream from a project if a user can write to project and stream', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}/removestream/${testStream.streamId}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Project.findOne( { _id: project1._id } ).then( result => {
            expect( result.streams ).to.be.an( 'array' ).that.is.empty
            done()
          } ).catch( err => done( err ) )
        } )
    } )

    it( 'should delete stream permissions with users in project.permissions object if no other projects with that user contain that stream', ( done ) => {
      chai.request( app )
        .delete( `${routeBase}/${project1._id}/removestream/${testStream.streamId}` )
        .set( 'Authorization', testUser1.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          Stream.findOne( { _id: testStream._id } ).then( result => {
            result.canRead.should.deep.equal( [ testUser2._id, testUser1._id ] )
            result.canWrite.should.be.an( 'array' ).that.is.empty
            done()
          } ).catch( err => done( err ) )
        } )
    } )
  } )

  describe( '/PUT /projects/{id}/upgradeuser/{user_id}', () => {

    let testStream2;

    beforeEach( async () => {
      testStream2 = new Stream( {
        streamId: 'some-other-stream',
        owner: testUser1._id,
        canRead: [ testUser1._id, testUser2._id ],
        canWrite: [ ]
      } )

      await testStream2.save()

      project2.streams = [ testStream.streamId, testStream2.streamId ]
      project2.permissions.canRead = [ testUser2._id, testUser1._id ]
      await project2.save()

      project1.permissions.canRead = [ testUser2._id ]
      project1.permissions.canWrite = [ adminUser._id ]
      project1.streams = [ testStream.streamId ]
      await project1.save()

      testStream.canRead = [ testUser2._id, testUser1._id ]
      testStream.canWrite = [ adminUser._id ]
      await testStream.save()
    } )

    afterEach( async () => {
      await testStream2.remove()

      project2.permissions.canRead = []
      project2.streams = []
      await project2.save()

      await Project.findOne( { _id: project1._id } ).then( res => {
        res.permissions.canRead = []
        res.permissions.canWrite = []
        res.streams = []
        return res.save()
      } )
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/upgradeuser/${testUser2._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )


    it( 'should require user to have write access to the project', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/upgradeuser/${testUser2._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should not require user to have write access to a stream in the project', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project2._id}/upgradeuser/${testUser2._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          done()
        } )
    } )

    // it( 'should update the user\'s permissions on a project if the user making the request can write to project and stream', ( done ) => {
    //   chai.request( app )
    //     .put( `${routeBase}/${project1._id}/upgradeuser/${testUser2._id}` )
    //     .set( 'Authorization', testUser1.apitoken )
    //     .end( ( err, res ) => {
    //       err = new Error( 'test not implemented' )
    //       done( err )

    //     } )
    // } )

    // it( 'should update the user\'s permissions on a streams associated with the project if the user making the request can write to project and stream', ( done ) => {
    //   chai.request( app )
    //     .put( `${routeBase}/${project1._id}/upgradeuser/${testUser2._id}` )
    //     .set( 'Authorization', testUser1.apitoken )
    //     .end( ( err, res ) => {
    //       err = new Error( 'test not implemented' )
    //       done( err )

    //     } )
    // } )
  } )

  describe( '/PUT /projects/{id}/downgradeuser/{user_id}', () => {


    let testStream2;

    beforeEach( async () => {
      testStream2 = new Stream( {
        streamId: 'some-other-stream',
        owner: testUser1._id,
        canRead: [ testUser1._id, testUser2._id ],
        canWrite: [ ]
      } )

      await testStream2.save()

      project2.streams = [ testStream.streamId, testStream2.streamId ]
      project2.permissions.canRead = [ testUser2._id, testUser1._id ]
      await project2.save()

      project1.permissions.canRead = [ testUser2._id ]
      project1.permissions.canWrite = [ adminUser._id ]
      project1.streams = [ testStream.streamId ]
      await project1.save()

      testStream.canRead = [ testUser2._id, testUser1._id ]
      testStream.canWrite = [ adminUser._id ]
      await testStream.save()
    } )

    afterEach( async () => {
      await testStream2.remove()

      project2.permissions.canRead = []
      project2.streams = []
      await project2.save()

      await Project.findOne( { _id: project1._id } ).then( res => {
        res.permissions.canRead = []
        res.permissions.canWrite = []
        res.streams = []
        return res.save()
      } )
    } )

    it( 'should require authentication', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/downgradeuser/${testUser2._id}` )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )


    it( 'should require user to have write access to the project', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project1._id}/downgradeuser/${testUser2._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 401 )
          done()
        } )
    } )

    it( 'should not require user to have write access to a stream in the project', ( done ) => {
      chai.request( app )
        .put( `${routeBase}/${project2._id}/downgradeuser/${testUser2._id}` )
        .set( 'Authorization', testUser2.apitoken )
        .end( ( err, res ) => {
          res.should.have.status( 200 )
          done()
        } )
    } )

    // it( 'should update the user\'s permissions on a project if the user making the request can write to project and stream', ( done ) => {
    //   chai.request( app )
    //     .put( `${routeBase}/${project1._id}/downgradeuser/${testUser2._id}` )
    //     .set( 'Authorization', testUser1.apitoken )
    //     .end( ( err, res ) => {
    //       err = new Error( 'test not implemented' )
    //       done( err )

    //     } )
    // } )

    // it( 'should update the user\'s permissions on a streams associated with the project if the user making the request can write to project and stream', ( done ) => {
    //   chai.request( app )
    //     .put( `${routeBase}/${project1._id}/downgradeuser/${testUser2._id}` )
    //     .set( 'Authorization', testUser1.apitoken )
    //     .end( ( err, res ) => {
    //       err = new Error( 'test not implemented' )
    //       done( err )

    //     } )
    // } )
  } )

} );