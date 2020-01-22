import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Speckle Stream Receiver",
        description: "Gets objects ids from the specified streams. Use in conjunction with Download Speckle Objects to get the objects.",
        icon: "cloud_download",
        allowBucketing: false,
        customComponent: false,
        parameters : [
          {
            name: "streamIds",
            type: "array",
          }
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

  if (!baseUrl || !token ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  // Try to receive stream objects
  Axios.defaults.headers.common[ 'Authorization' ] = token

  let objectIds = [ ]
  for (let i = 0; i < parameters.streamIds.length; i++)
    objectIds.push(... await getStreamObjectIds( baseUrl, parameters.streamIds[i] ))

  objectIds = [...new Set(objectIds)]

  return {
    statusCode: 200,
    body: JSON.stringify(objectIds)
  }
}

function getStreamObjectIds( baseUrl, streamId )
{
  return new Promise( (resolve, reject) => {
    Axios({
      method: 'GET',
      baseURL: baseUrl,
      url: `streams/${streamId}?fields=objects,layers`,
    })
    .then( res => {
      let ids = res.data.resource.objects.map( o => o._id )
      resolve( ids )
    })
    .catch( err => {
      reject( err )
    })
  })
}