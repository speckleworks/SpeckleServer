module.exports = ( req, res, next ) => {
  if ( req.user.role==="admin" ) next()
  else return res.status( 401 ).send( "Only admins can access this route" )
}