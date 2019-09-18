const countly = require( 'countly-sdk-nodejs' )
const machineIdSync = require( 'node-machine-id' ).machineIdSync
const { exec } = require( 'child_process' )

const logger = require( './config/logger' )

module.exports = ( ) => {
  let myMachineId = machineIdSync( )
  let tagVersion = 'unknown'

  try {
    exec( 'git describe --tags', ( err, stdout, stderr ) => {
      tagVersion = stdout
      logger.info( `` )
      logger.info( `Version: ${tagVersion}` )
      logger.info( `` )

      countly.init( {
        app_key: '6b79ee267ff23c4b99108591c5b33f0ba8ed5e4b',
        url: 'https://telemetry.speckle.works',
        device_id: myMachineId,
        app_version: tagVersion,
        debug: false
      } )

      countly.user_details( {
        'username': myMachineId
      } )

      countly.begin_session( false )

      countly.add_event( {
        "key": "server-deployment-test",
        "segmentation": {
          "machineId": myMachineId,
          "version": tagVersion
        }
      } )

      countly.track_view( `server-deployment/${tagVersion}` )

      countly.end_session( )
    } )
  } catch ( err ) {
    logger.error( err )
  }
}
