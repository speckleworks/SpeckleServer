import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Speckle Stream Sender",
        description: "Takes the objects and sends them as a new stream. If the objects have been modified, use the Upload Speckle Object block before in order to update the objects in the server.",
        icon: "cloud_upload",
        allowBucketing: false,
        customComponent: false,
        parameters : [
          {
            name: "streamName",
            type: "string",
          },
        ],
      }),
    }
  }

  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  const {
    baseUrl,
    token,
    input,
    parameters,
  } = JSON.parse(event.body)

  if (!baseUrl || !token || !input ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  // Try to send stream objects
  Axios.defaults.headers.common[ 'Authorization' ] = token

  var stream = {name: parameters.streamName, objects: input};
  let result = await createStream(baseUrl, stream);

  return {
    statusCode: 200,
    body: JSON.stringify(result.streamId)
  }
}

function createStream( baseUrl, stream ) {
  return new Promise( ( resolve, reject ) => {
    Axios({
      method: 'POST',
      baseURL: baseUrl,
      url: `streams`,
    })
      .then( res => {
        console.log( res )
        stream.streamId = res.data.resource.streamId
        res.data.resource.onlineEditable = true
        return Axios({
          method: 'PUT',
          baseURL: baseUrl,
          url: `streams/${res.data.resource.streamId}`,
          data: stream,
        })
      } )
      .then( res => resolve( stream ) )
      .catch( err => {
        console.error( err )
        reject( err )
      } )
  } )
}