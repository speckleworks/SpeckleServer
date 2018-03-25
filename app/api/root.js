const winston = require( 'winston' )
const chalk = require( 'chalk' )
const passport = require( 'passport' )

var tokenCheck = require( './middleware/TokenCheck' )
var serverDescription = require( '../../config' ).serverDescription

module.exports = function( app, express ) {
  var r = new express.Router( )

  // strict auth will return a 401 if no authorization header is present. pass means req.user exists
  let mandatoryAuthorisation = passport.authenticate( 'jwt-strict', { session: false } )
  // relaxed auth allows for annonymous access to the endpoint, but permissions should be checked inside. pass doesn't guarantee req.user
  let optionalAuthorisation = passport.authenticate( [ 'jwt-strict', 'anonymous' ], { session: false } )

  //
  // ACCOUNTS & USERS
  // 

  // create a new account xxx
  r.post( '/accounts/register', require( './core/accounts/UserCreate' ) )

  // login xxx
  r.post( '/accounts/login', require( './core/accounts/UserLogin' ) )

  // get profile xxx
  r.get( '/accounts', mandatoryAuthorisation, require( './core/accounts/UserGet' ) )

  // update profile xxx 
  r.put( '/accounts', mandatoryAuthorisation, require( './core/accounts/UserPut' ) )

  // get other user's display profile xxx
  r.get( '/accounts/:userId', mandatoryAuthorisation, require( './core/accounts/UserProfile' ) )

  // search profiles by email xxx
  r.post( '/accounts/search', mandatoryAuthorisation, require( './core/accounts/UserSearch' ) )


  // 
  // CLIENTS
  // 

  // create a new client xxx
  r.post( '/clients', optionalAuthorisation, require( './core/clients/ClientPost' ) )

  // get a user's clients xxx
  r.get( '/clients', mandatoryAuthorisation, require( './core/accounts/UserGetClients' ) )

  // get a client / perm check 'read' xxx
  r.get( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientGet' ) )

  // update a client / perm check 'write' xxx
  r.put( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientPut' ) )

  // delete a client / perm check 'delete' xxx
  r.delete( '/clients/:clientId', mandatoryAuthorisation, require( './core/clients/ClientDelete' ) )

  // 
  // STREAMS 
  // 

  // create a new stream xxx
  r.post( '/streams', mandatoryAuthorisation, require( './core/streams/StreamPost' ) )

  // get a user's streams xxx
  r.get( '/streams', mandatoryAuthorisation, require( './core/accounts/UserGetStreams' ) )

  // get stream / perm check 'read'
  r.get( '/streams/:streamId', optionalAuthorisation, require( './core/streams/StreamGet' ) )

  // update a stream / perm check 'write'
  r.put( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamPut' ) )

  // delete a stream / perm check 'delete'
  r.delete( '/streams/:streamId', mandatoryAuthorisation, require( './core/streams/StreamDelete' ) )

  // duplicate a stream / perm check 'read'
  r.post( '/streams/:streamId/clone', mandatoryAuthorisation, require( './core/streams/StreamDuplicate' ) )

  // diff a stream against another / perm check 'read' / perm check 'read'
  r.get( '/streams/:streamId/diff/:otherId', optionalAuthorisation, require( './core/streams/StreamDiff' ) )

  // Get stream objects / perm check 'read' 
  r.get( '/streams/:streamId/objects', optionalAuthorisation, require( './core/streams/StreamObjectsGet' ) )


  //
  // OBJECTS 
  // 

  // Create an object
  r.post( '/objects', mandatoryAuthorisation, require( './core/objects/ObjectPost' ) )

  // Create many objects
  r.post( '/objects/bulk', mandatoryAuthorisation, require( './core/objects/ObjectPostBulk' ) )

  // Get an object / perm check 'read'
  r.get( '/objects/:objectId', optionalAuthorisation, require( './core/objects/ObjectGet' ) )

  // Get more objects / perm check 'read'
  r.post( '/objects/getbulk/', optionalAuthorisation, require( './core/objects/ObjectsGetBulk' ) )

  // update one
  r.put( '/objects/:objectId', mandatoryAuthorisation, require( './core/objects/ObjectPut' ) )

  // delete one / perm check 'delete'
  r.delete( '/objects/:objectId', mandatoryAuthorisation, require( './core/objects/ObjectDelete' ) )


  // 
  // COMMENTS
  // 
  
  // get user's comments
  r.get( '/comments', mandatoryAuthorisation, require( './core/comments/CommentGetAll' ) )
  
  // get user's assignedTo comments
  r.get( '/comments/assigned', mandatoryAuthorisation, require( './core/comments/CommentGetAssigned' ) )
  
  // create a comment attached to a resource
  r.post( '/comments/:resourceType/:resourceId', optionalAuthorisation, require( './core/comments/CommentPost' ) )
  
  // get comments from  a resource
  r.get( '/comments/:resourceType/:resourceId', optionalAuthorisation, require( './core/comments/CommentGet' ) )
  
  // edit a comment
  r.put( '/comments/:commentId', mandatoryAuthorisation, require( './core/comments/CommentPut' ) )
  
  // delete a comment
  r.delete( '/comments/:commentId', mandatoryAuthorisation, require( './core/comments/CommentDelete' ) )


  // 
  // PROJECTS 
  // 

  // create a project
  r.post( '/projects', mandatoryAuthorisation, require( './core/projects/ProjectPost' ) )

  // get user's projects
  r.get( '/projects', mandatoryAuthorisation, require( './core/projects/ProjectGetAll' ) )

  // get project by id
  r.get( '/projects/:projectId', mandatoryAuthorisation, require( './core/projects/ProjectGet' ) )

  // update a project
  r.put( '/projects/:projectId', mandatoryAuthorisation, require( './core/projects/ProjectPut' ) )

  // crushkilldestroy a project
  r.delete( '/projects/:projectId', mandatoryAuthorisation, require( './core/projects/ProjectDelete' ) )


  //
  // FINAL ROUTES & MOUNT
  //

  // generate routes doc
  let routes = [ ]
  let count = 1
  r.stack.forEach( ( middleware ) => {
    if ( middleware.route )
      routes.push( Object.keys( middleware.route.methods ).map( m => count++ + ":\t" + m.toUpperCase( ) ) + '\t\t /api' + middleware.route.path )
  } )

  r.get( '/', ( req, res ) => {
    res.send( routes )
  } )

  // mount all these routes up
  app.use( '/api', r )
}