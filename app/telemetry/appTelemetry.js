const countly = require( 'countly-sdk-nodejs' )
const myMachineId = require( 'node-machine-id' ).machineIdSync( )

const logger = require( '../../config/logger' )

// This module lets us know which routes are hit on a server, thus aggregating
// the "hot" endpoints.

module.exports = ( app ) => {

  if ( process.env.TELEMETRY === 'false' )
    return

  try {
    countly.init( {
      // eslint-disable-next-line camelcase
      app_key: '6b79ee267ff23c4b99108591c5b33f0ba8ed5e4b',
      url: 'https://telemetry.speckle.works',
      // eslint-disable-next-line camelcase
      device_id: myMachineId,
      debug: false
    } )

    countly.user_details( {
      'username': myMachineId
    } )

    app.use( ( req, res, next ) => {

      next( ) // let's not block things, in case telemetry server is down.

      try {
        countly.track_view( `${req.method} "${req.route.path}"` )
      } catch ( err ) {
        logger.info( 'Failed to initialise route based telemetry.' )
      }

    } )
  } catch ( err ) {
    logger.info( 'Failed to initialise route based telemetry.' )
  }
}
