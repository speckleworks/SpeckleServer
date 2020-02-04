const passport = require( 'passport' )
const adminCheck = require( './middleware/AdminCheck' )
const { exec } = require( 'child_process' )

module.exports = function ( app, express, urlRoot, plugins ) {

  let r = new express.Router( )

  // strict auth will return a 401 if no authorization header is present. pass means req.user exists
  let mandatoryAuthorisation = passport.authenticate( 'jwt-strict', { session: false } )
  // relaxed auth allows for annonymous access to the endpoint, but permissions should be checked inside. pass doesn't guarantee req.user
  let optionalAuthorisation = passport.authenticate( [ 'jwt-strict', 'anonymous' ], { session: false } )

  //
  // ACCOUNTS & USERS
  //

  // only allow api registration/login if local auth strategy is enabled
  if ( process.env.USE_LOCAL === 'true' ) {
    // create a new account xxx
    r.post( '/accounts/register', require( './accounts/UserCreate' ) )

    // login xxx
    r.post( '/accounts/login', require( './accounts/UserLogin' ) )
  }

  // get profile xxx
  r.get( '/accounts', mandatoryAuthorisation, require( './accounts/UserGet' ) )

  // get all accounts
  r.get( '/accounts/admin', mandatoryAuthorisation, adminCheck, require( './accounts/UserGetAdmin' ) )

  // update profile xxx
  r.put( '/accounts', mandatoryAuthorisation, require( './accounts/UserPut' ) )

  // get other user's display profile xxx
  r.get( '/accounts/:userId', mandatoryAuthorisation, require( './accounts/UserProfile' ) )

  // modify an account's role  (needs to be admin)
  r.put( '/accounts/:userId', mandatoryAuthorisation, adminCheck, require( './accounts/UserPutAdmin' ) )

  // search profiles by email xxx
  r.post( '/accounts/search', mandatoryAuthorisation, require( './accounts/UserSearch' ) )

  // TODOs:
  // API call to send a new verification email
  // API call to send a password reset email

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

  // get every stream on the server
  r.get( '/streams/admin', mandatoryAuthorisation, adminCheck, require( './streams/StreamGetAdmin' ) )

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

  // modified diff endpoint to follow delta specs from innovateuk grant
  r.get( '/streams/:streamId/delta/:otherId', optionalAuthorisation, require( './streams/StreamDelta' ) )

  // endpoint to apply a delta to a stream & create a new revison (clone)
  r.post( '/streams/:streamId/delta', mandatoryAuthorisation, (req, res) => {res.send('Todo')})

  // Get stream objects / perm check 'read' xxx
  r.get( '/streams/:streamId/objects', optionalAuthorisation, require( './streams/StreamObjectsGet' ) )

  // Get stream clients / perm check 'read'
  r.get( '/streams/:streamId/clients', optionalAuthorisation, require( './streams/StreamClientsGet' ) )

  //
  // OBJECTS
  //

  // Create an object or more!
  r.post( '/objects', mandatoryAuthorisation, require( './objects/ObjectPost' ) )

  // Derive an object or more!
  r.post( '/objects/derive', mandatoryAuthorisation, require( './objects/ObjectDerive' ) )

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

  // get all the projects on the server
  r.get( '/projects/admin', mandatoryAuthorisation, adminCheck, require( './projects/ProjectGetAdmin' ) )

  // get project by id xxx
  r.get( '/projects/:projectId', mandatoryAuthorisation, require( './projects/ProjectGet' ) )

  // update a project xxx
  r.put( '/projects/:projectId', mandatoryAuthorisation, require( './projects/ProjectPut' ) )

  // adds a stream to a project and propagates permissions
  r.put( '/projects/:projectId/addstream/:streamId', mandatoryAuthorisation, require( './projects/ProjectPutAddStream' ) )

  // removes a stream from a project, and takes user permissions out if no conflicts with other projects
  r.delete( '/projects/:projectId/removestream/:streamId', mandatoryAuthorisation, require( './projects/ProjectDeleteStream' ) )

  // adds a user to a project (defaults to canWrite for streams of this project, and canRead for the project itself)
  r.put( '/projects/:projectId/adduser/:userId', mandatoryAuthorisation, require( './projects/ProjectPutAddUser' ) )

  // removes a user from a project, and propagates perms on streams if no conflicts with other projects
  r.delete( '/projects/:projectId/removeuser/:userId', mandatoryAuthorisation, require( './projects/ProjectDeleteUser' ) )

  // moves a user to canWrite on all project streams
  r.put( '/projects/:projectId/upgradeuser/:userId', mandatoryAuthorisation, require( './projects/ProjectPutUpgradeUser' ) )

  // moves a user to canRead on all project streams, if no conflicts with other projects
  r.put( '/projects/:projectId/downgradeuser/:userId', mandatoryAuthorisation, require( './projects/ProjectPutDowngradeUser' ) )

  // crushkilldestroy a project xxx
  r.delete( '/projects/:projectId', mandatoryAuthorisation, require( './projects/ProjectDelete' ) )

  //
  // FINAL ROUTES & MOUNT
  //

  // generate routes doc
  let routes = [ ]
  r.stack.forEach( ( middleware ) => {
    if ( middleware.route ) { routes.push( { method: Object.keys( middleware.route.methods ).map( m => m.toUpperCase( ) )[ 0 ], route: process.env.CANONICAL_URL + '/api' + middleware.route.path } ) }
  } )

  let grouped = { projects: [ ], clients: [ ], streams: [ ], accounts: [ ], comments: [ ], objects: [ ] }
  routes.forEach( r => {
    // TESt
    if ( r.route.includes( 'projects' ) ) grouped.projects.push( r )
    if ( r.route.includes( 'clients' ) ) grouped.clients.push( r )
    if ( r.route.includes( 'comments' ) ) grouped.comments.push( r )
    if ( r.route.includes( 'streams' ) ) grouped.streams.push( r )
    if ( r.route.includes( 'accounts' ) ) grouped.accounts.push( r )
    if ( r.route.includes( 'objects' ) ) grouped.objects.push( r )
  } )

  let tagVersion = null
  try {
    exec( 'git describe --tags', ( err, stdout ) => {
      tagVersion = stdout.split( '-' )[ 0 ].replace( /(\r\n|\n|\r)/gm, "" )
    } )
  } catch ( err ) {
    // POKEMON
    tagVersion = '1.x.x'
  }

  r.get( '/', ( req, res ) => {
    let serverDescription = {
      isSpeckleServer: true, // looks stupid, but is used for url validation by the clients
      serverName: process.env.SERVER_NAME,
      version: tagVersion || '1.x.x',
      api: grouped,
      plugins: plugins,
      jnMask: process.env.JNMASK || "######-##"
    }

    return res.json( serverDescription )
  } )

  // mount all these routes up
  app.use( urlRoot, r )
}
