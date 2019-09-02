const countly = require( 'countly-sdk-nodejs' )
const machineIdSync = require( 'node-machine-id' ).machineIdSync

const { exec } = require( 'child_process' )

// async function ls() {

module.exports = ( ) => {
  let myMachineId = machineIdSync( )
  let tagVersion = 'unknown'

  try {
    exec( 'git describe --tags', ( err, stdout, stderr ) => {
      tagVersion = stdout
    } )
  } catch {

  }

  countly.init( {
    app_key: '6b79ee267ff23c4b99108591c5b33f0ba8ed5e4b',
    url: 'https://telemetry.speckle.works',
    device_id: myMachineId,
    debug: false
  } )

  countly.begin_session( false )

  countly.add_event( {
    "key": "server-deployment",
    "segmentation": {
      "serverName": process.env.SERVER_NAME,
      "canonicalUrl": process.env.CANONICAL_URL,
      "machineId": myMachineId
    }
  } )

  countly.end_session( )
}
