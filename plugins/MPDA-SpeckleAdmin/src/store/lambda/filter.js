import get from 'lodash.get'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Filter",
        description: "Filters an array of objects by performing a string comparison of the paths against the criteria.",
        icon: "filter_list",
        allowBucketing: true,
        customComponent: false,
        parameters : [
          {
            name: "exactMatch",
            type: "boolean",
          },
          {
            name: "filters",
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
  
  if (!baseUrl || !token || !input ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  // Try to receive stream objects
  var returnObjects = []

  returnObjects = input.filter( o => { 
    for(let i = 0; i < parameters.filters.length; i++)
    {
      let prop = JSON.stringify(getProperty(o, parameters.filters[i].path))

      if (prop == null)
        return false
        
      if (parameters.hasOwnProperty('exactMatch') && parameters.exactMatch)
      {
        if (prop.toLowerCase() !== parameters.filters[i].criteria.toLowerCase())
          return false
      }
      else
      {
        if (!(prop.toLowerCase().includes(parameters.filters[i].criteria.toLowerCase())))
          return false
      }
    }
    return true
  })

  return {
    statusCode: 200,
    body: JSON.stringify(returnObjects)
  }
}

function getProperty ( source, sourcePath ) {
  return get(source, sourcePath)
}