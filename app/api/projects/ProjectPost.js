const winston = require( '../../../config/logger' )

const Project = require( '../../../models/Project' )

module.exports = ( req, res ) => {
  if ( !req.body ) {
    res.status( 400 )
    return res.send( { success: false, message: 'No project provided' } )
  }

  let project = new Project( req.body )
  project.owner = req.user._id

  project.save()
    .then( resource => res.send( { success: true, resource: resource } ) )
    .catch( err => {
      winston.error( JSON.stringify( err ) )
      res.status( 400 )
      return res.send( { success: false, message: err.toString() } )
    } )
}
