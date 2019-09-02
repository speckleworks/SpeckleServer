const countly = require( 'countly-sdk-nodejs' )
const machineIdSync = require( 'node-machine-id' ).machineIdSync

module.exports = ( ) => {
  let myMachineId = machineIdSync( )
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
