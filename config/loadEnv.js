const dotenv = require( 'dotenv' );

const NODE_ENV = process.env.NODE_ENV || 'dev';

module.exports = () => {
  let configPath = './.env'

  if ( NODE_ENV == 'test' ) {
    configPath = './test/.env.test'
  }

  const configResult = dotenv.config( { path: configPath } )

  if ( configResult.error ) {
    throw configResult.error
    // throw new Error( 'There is an error in the .env configuration file. Will use the default provided ones (if any).' )
  }
}
