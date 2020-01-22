import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Upload Speckle Objects",
        description: "Uploads and updates the Speckle objects in the server. Use in conjunction with Upload Speckle Objects to update new objects.",
        icon: "arrow_upward",
        allowBucketing: true,
        customComponent: false,
        parameters : [ ],
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

  let objectIds = [ ]

  let bucket = [ ],
    maxReq = 50 // magic number; maximum objects to request in a bucket
  for ( let i = 0; i < input.length; i++ ) {
    bucket.push( input[ i ] )
    if ( i % maxReq === 0 && i !== 0 ) {
      let res = await createObjects( baseUrl, bucket );
      objectIds.push(...res)
      bucket = [ ]
    }
  }

  if ( bucket.length != 0 ) {
    let res = await createObjects( baseUrl, bucket );
    objectIds.push(...res)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(objectIds)
  }
}

function createObjects( baseUrl, objects ) {
  return new Promise( (resolve, reject) => {
    Axios({
      method: 'POST',
      baseURL: baseUrl,
      url: `objects/derive`,
      data: objects,
    })
      .then( res => resolve( res.data.resources ) )
      .catch( err => reject( err ))
  })
}