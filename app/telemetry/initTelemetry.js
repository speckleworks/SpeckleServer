const countly = require( 'countly-sdk-nodejs' )
const machineIdSync = require( 'node-machine-id' ).machineIdSync
const { exec } = require( 'child_process' )

const logger = require( '../../config/logger' )

// This module lets us know the version of the running server, and how many times
// it's initialised.
module.exports = ( ) => {

  if ( process.env.TELEMETRY === 'false' )
    return

  let myMachineId = machineIdSync( )
  let tagVersion = 'unknown'

  try {
    exec( 'git describe --tags', ( err, stdout ) => {
      tagVersion = stdout.split( '-' )[ 0 ]
      logger.info( `Version: ${tagVersion}` )

      countly.init( {
        // eslint-disable-next-line camelcase
        app_key: '6b79ee267ff23c4b99108591c5b33f0ba8ed5e4b',
        url: 'https://telemetry.speckle.works',
        // eslint-disable-next-line camelcase
        device_id: myMachineId,
        // eslint-disable-next-line camelcase
        app_version: tagVersion,
        debug: false
      } )

      countly.user_details( {
        'username': myMachineId
      } )

      countly.add_event( {
        "key": "server-deployment",
        "segmentation": {
          "machineId": myMachineId,
          "version": tagVersion
        }
      } )

      // one view to track version
      countly.track_view( `SERVER DEPLOYMENT versioned at ${tagVersion}` )

      // one view to track generic usage, regardless of version
      countly.track_view( `SERVER DEPLOYMENT generic` )

    } )
  } catch ( err ) {
    logger.error( err )
  }
}
