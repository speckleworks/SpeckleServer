import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Download Speckle Objects",
        description: "Gets objects from the specified ids using the queries given. It is heavily recommended that you extract only the necessary fields. If no fields are specified, all fields will be obtained.",
        icon: "arrow_downward",
        allowBucketing: true,
        customComponent: false,
        parameters : [
          {
            name: "fields",
            type: "array",
          },
          {
            name: "queries",
            type: "objectarray",
            headers: ["path", "criteria"]
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

  if (!baseUrl || !token || !input || !parameters ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  // Try to receive objects
  Axios.defaults.headers.common[ 'Authorization' ] = token

  let outputObjects = [ ]
  
  let bucket = [ ],
    maxReq = 500 // magic number; maximum objects to request in a bucket

  for ( let i = 0; i < input.length; i++ ) {
    bucket.push( input[ i ] )
    if ( i % maxReq === 0 && i !== 0 ) {
      let objects = await getObjects( baseUrl, bucket, parameters.fields, parameters.queries )
      outputObjects.push(...objects)
      bucket = [ ]
    }
  }

  if ( bucket.length !== 0 ) {
    let objects = await getObjects( baseUrl, bucket, parameters.fields, parameters.queries )
    outputObjects.push(...objects)
    bucket = [ ]
  }

  return {
    statusCode: 200,
    body: JSON.stringify(outputObjects)
  }
}

function getObjects( baseUrl, objectIds, fields, queries )
{
  var url = `objects/getbulk`//?base64,rawData,canRead,canWrite,children,anonymousComments,name`

  var query = { }

  if (queries != null && queries.length > 0)
    queries.forEach(q => {
      if (query.hasOwnProperty(q.path))
        query[q.path] += ',' + q.criteria
      else
        query[q.path] = q.criteria
    })

  if (fields != null)
  {
    if (!(fields.includes('hash')))
      fields.push('hash')
    
    query['fields'] = fields.join(',')
  }

  if (Object.keys(query).length > 0)
    url += '?' + Object.entries(query).map(([k,v]) => k + "=" + v).join('&')

  return new Promise( (resolve, reject) => {
    Axios({
      method: 'POST',
      baseURL: baseUrl,
      url: url,
      data: objectIds,
    })
    .then( res => resolve( res.data.resources.filter(x => !(x.type == 'String' && x.value == 'You do not have permissions to view this object')) ) )
    .catch( err => reject( err ) )
  })
}
