'use strict'
const winston           = require('winston')
const chalk             = require('chalk')

module.exports = ( req, res, next ) => {
  let token = req.get('speckle-token')
  if( !token ) {
    winston.debug( chalk.bgRed( 'No token provided.' ) )
    return res.send( { success: false, message:'No token provided.' } )
  }
  winston.debug( chalk.blue.underline('token check: ' + token ))
  winston.debug( chalk.red.underline( 'This is not really checking anything, as we have no users. It is one big TODO' ))
  
  // TODO properly
  if( token === 'asdf' ) { 
    req.user = {
      name: 'dimitrie',
      _id: '58402bb3cb1fd1cab2ff6c5f'
    }
    next() 
  }
  else {
    winston.debug( chalk.bgRed( 'token check failed: ' + token ) )
    return res.send( { success: false, message:'Token check failed.' } ) 
  }  
}