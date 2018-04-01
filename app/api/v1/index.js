const winston = require( 'winston' )
const chalk = require( 'chalk' )
const passport = require( 'passport' )

var tokenCheck = require( './middleware/TokenCheck' )
var serverDescription = require( '../../../config' ).serverDescription

module.exports = function( app, express, urlRoot ) {
  var r = new express.Router( )

  // strict auth will return a 401 if no authorization header is present. pass means req.user exists
  let mandatoryAuthorisation = passport.authenticate( 'jwt-strict', { session: false } )
  // relaxed auth allows for annonymous access to the endpoint, but permissions should be checked inside. pass doesn't guarantee req.user
  let optionalAuthorisation = passport.authenticate( [ 'jwt-strict', 'anonymous' ], { session: false } )

  //
  // ACCOUNTS & USERS
  // 

  // create a new account xxx
  r.post( '/accounts/register', require( './accounts/UserCreate' ) )

  // login xxx
  r.post( '/accounts/login', require( './accounts/UserLogin' ) )

  // get profile xxx
  r.get( '/accounts', mandatoryAuthorisation, require( './accounts/UserGet' ) )

  // update profile xxx 
  r.put( '/accounts', mandatoryAuthorisation, require( './accounts/UserPut' ) )

  // get other user's display profile xxx
  r.get( '/accounts/:userId', mandatoryAuthorisation, require( './accounts/UserProfile' ) )

  // search profiles by email xxx
  r.post( '/accounts/search', mandatoryAuthorisation, require( './accounts/UserSearch' ) )


  // 
  // CLIENTS
  // 

  // create a new client xxx
  r.post( '/clients', optionalAuthorisation, require( './clients/ClientPost' ) )

  // get a user's clients xxx
  r.get( '/clients', mandatoryAuthorisation, require( './clients/ClientGetAll' ) )

  // get a client / perm check 'read' xxx
  r.get( '/clients/:clientId', mandatoryAuthorisation, require( './clients/ClientGet' ) )

  // update a client / perm check 'write' xxx
  r.put( '/clients/:clientId', mandatoryAuthorisation, require( './clients/ClientPut' ) )

  // delete a client / perm check 'delete' xxx
  r.delete( '/clients/:clientId', mandatoryAuthorisation, require( './clients/ClientDelete' ) )

  // 
  // STREAMS 
  // 

  // create a new stream xxx
  r.post( '/streams', mandatoryAuthorisation, require( './streams/StreamPost' ) )

  // get a user's streams xxx
  r.get( '/streams', mandatoryAuthorisation, require( './streams/StreamGetAll' ) )

  // get stream / perm check 'read' xxx
  r.get( '/streams/:streamId', optionalAuthorisation, require( './streams/StreamGet' ) )

  // update a stream / perm check 'write' xxx
  r.put( '/streams/:streamId', mandatoryAuthorisation, require( './streams/StreamPut' ) )

  // delete a stream / perm check 'delete' xxx
  r.delete( '/streams/:streamId', mandatoryAuthorisation, require( './streams/StreamDelete' ) )

  // duplicate a stream / perm check 'read' xxx
  r.post( '/streams/:streamId/clone', mandatoryAuthorisation, require( './streams/StreamDuplicate' ) )

  // diff a stream against another / perm check 'read' / perm check 'read' xxx
  r.get( '/streams/:streamId/diff/:otherId', optionalAuthorisation, require( './streams/StreamDiff' ) )

  // Get stream objects / perm check 'read' xxx
  r.get( '/streams/:streamId/objects', optionalAuthorisation, require( './streams/StreamObjectsGet' ) )


  //
  // OBJECTS 
  // 

  // Create an object or more!
  r.post( '/objects', mandatoryAuthorisation, require( './objects/ObjectPost' ) )

  // Get an object / perm check 'read' xxx
  r.get( '/objects/:objectId', optionalAuthorisation, require( './objects/ObjectGet' ) )

  // Get more objects / perm check 'read' xxx
  r.post( '/objects/getbulk/', optionalAuthorisation, require( './objects/ObjectsGetBulk' ) )

  // update one xxx
  r.put( '/objects/:objectId', mandatoryAuthorisation, require( './objects/ObjectPut' ) )

  // update one properties xxx
  r.put( '/objects/:objectId/properties/', mandatoryAuthorisation, require( './objects/ObjectPutProperties' ) )
  
  // delete one / perm check 'delete' xxx
  r.delete( '/objects/:objectId', mandatoryAuthorisation, require( './objects/ObjectDelete' ) )


  // 
  // COMMENTS
  // 
  
  // get user's comments
  r.get( '/comments', mandatoryAuthorisation, require( './comments/CommentGetAll' ) )
  
  // get user's assignedTo comments
  r.get( '/comments/assigned', mandatoryAuthorisation, require( './comments/CommentGetAssigned' ) )
  
  // create a comment attached to a resource xxx
  r.post( '/comments/:resourceType/:resourceId', optionalAuthorisation, require( './comments/CommentPost' ) )
  
  // get comments from  a resource xxx
  r.get( '/comments/:resourceType/:resourceId', optionalAuthorisation, require( './comments/CommentGetFromResource' ) )
  
  // get comment by id
  r.get( '/comments/:commentId', optionalAuthorisation, require( './comments/CommentGet' ) )
  
  // edit a comment xxx
  r.put( '/comments/:commentId', mandatoryAuthorisation, require( './comments/CommentPut' ) )
  
  // delete a comment xxx
  r.delete( '/comments/:commentId', mandatoryAuthorisation, require( './comments/CommentDelete' ) )


  // 
  // PROJECTS 
  // 

  // create a project  xxx
  r.post( '/projects', mandatoryAuthorisation, require( './projects/ProjectPost' ) )

  // get user's projects xxx
  r.get( '/projects', mandatoryAuthorisation, require( './projects/ProjectGetAll' ) )

  // get project by id xxx
  r.get( '/projects/:projectId', mandatoryAuthorisation, require( './projects/ProjectGet' ) )

  // update a project xxx
  r.put( '/projects/:projectId', mandatoryAuthorisation, require( './projects/ProjectPut' ) )

  // crushkilldestroy a project xxx
  r.delete( '/projects/:projectId', mandatoryAuthorisation, require( './projects/ProjectDelete' ) )


  //
  // FINAL ROUTES & MOUNT
  //

  // generate routes doc
  let routes = [ ]
  let count = 1
  r.stack.forEach( ( middleware ) => {
    if ( middleware.route )
      routes.push( Object.keys( middleware.route.methods ).map( m => m.toUpperCase( ) ) + ': /api' + middleware.route.path )
  } )

  r.get( '/', ( req, res ) => {
    serverDescription.routes = routes
    serverDescription.version = '1.x.x'
    res.json( serverDescription )
  } )

  // mount all these routes up
  app.use( urlRoot, r )
}