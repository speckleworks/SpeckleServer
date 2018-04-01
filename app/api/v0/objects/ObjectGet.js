const q2m = require( 'query-to-mongo' )

const SpeckleObject = require( '../../../../models/SpeckleObject' )

module.exports = ( req, res ) => {
  if ( !req.params.objectId ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No object id provided.' } )
  }
  let query = q2m( req.query )
  SpeckleObject.findOne( { _id: req.params.objectId }, query.options.fields )
    .then( object => {
      if ( !object ) throw new Error( 'Could not find object.' )
      res.send( { success: true, resource: object } )
    } )
    .catch( err => {
      res.status( 400 )
      res.send( { success: false, message: err.toString( ) } )
    } )
}