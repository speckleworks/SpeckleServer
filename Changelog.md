
## TODOS
- tests
- move bulk object creation in its own middleware

## General Summary: 
**Before**: ±40 routes for accounts, streams, objects
**After**: 40 routes for accounts, streams, objects, projects and comments

## Permission checks: 

- Simple, one resource way:
`.then( resource => PermissionCheck( req.user, 'read', resource ) )`
will either throw an error or resolve and return the resource (for promise chaining).

- Multiple resources:
`.then( objects => Promise.all( objects.map( o => PermissionCheck( req.user, 'read', o ) ).map( prom => prom.catch( e => e ) ) ) )`
Will return an array of resources, some of which may be null/undefined if the user does not have permission to read it. 

## Models: 

Old: 
- Streams (`DataStream`)
- Objects (`SpeckleObject`)
- Users (`User`)

New: 
- Projects (`Project`)
- Comments (`Comment`)

## Responses
All responses should be unified to the following: 

```js
ResponseBase: { 
    success: Boolean,
    message: String (optional),
    resource: Object,
    // or, never and
    resources: Array of Objects
}
```

## Payloads
All Payloads for POST or PUT should be unified to:

- POST/PUT Stream: BODY A stream
    + POST: new Stream( body )
    + PUT: myStream.set( body ).save( )
- POST/PUT Object: BODY A Object
    + POST: new Object( body )
    + PUT: myObject.set( body ).save( )
- POST/PUT Project: BODY A Project
    + POST: new Project( body )
    + PUT: myProject.set( body ).save( )
- POST/PUT Comment: BODY A Comment
    + POST: new Comment( body )
    + PUT: myComment.set( body ).save( )

