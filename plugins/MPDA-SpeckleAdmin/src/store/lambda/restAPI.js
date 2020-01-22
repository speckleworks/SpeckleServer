import Axios from 'axios'
import get from 'lodash.get'
import set from 'lodash.set'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "REST API Result Embedder",
        description: "Embeds the results of a REST API call into each object. Assumes that the REST API accepts batch (array) inputs.",
        icon: "swap_horiz",
        allowBucketing: true,
        customComponent: false,
        parameters : [
          {
            name: "apiUrl",
            type: "string",
          },
          {
            name: "apiMethod",
            type: "string",
          },
          {
            name: "inputMap",
            type: "objectarray",
            headers: ["source", "target"]
          },
          {
            name: "resultMap",
            type: "objectarray",
            headers: ["source", "target"]
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

  // Try to send stream objects
  var output = [ ]
  var validObjects = [ ]
  var invalidObjects = [ ]
  
  var restInput = {
    method: parameters.apiMethod,
    url: parameters.apiUrl,
    data: { }
  }

  var result

  if (parameters.inputMap !== undefined && parameters.inputMap.length > 0)
  {
    for (let obj of input) {
      var skip = false
      var tempDict = { }

      for (let i = 0; i < parameters.inputMap.length; i++)
      {
        tempDict[parameters.inputMap[i].target] = get(obj, parameters.inputMap[i].source)
        if (tempDict[parameters.inputMap[i].target] == null)
        {
          invalidObjects.push(obj)
          skip = true
          break
        }
      }

      if (skip) continue

      for (let k in tempDict) {
        var arr = get(restInput, 'data.' + k)
        if (arr == null)
          arr = [ ]
        arr.push(tempDict[k])

        restInput = set(
          restInput,
          'data.' + k,
          arr
        )
      }

      validObjects.push(obj)
    }

    if (Object.keys(restInput.data).length == 0)
    {
      return{
        statusCode: 200,
        body: JSON.stringify(input)
      }
    }
    
    result = await callAPI(restInput)
  }
  else
    validObjects = input
  
  for (let obj of validObjects) {

    var outputObj = JSON.parse(JSON.stringify(obj))

    var objResult

    if (parameters.inputMap !== undefined && parameters.inputMap.length > 0)
      objResult = Array.isArray(result.data) ? result.data.splice(0,1)[0] : result.data
    else
    {
      result = await callAPI(restInput)
      objResult = Array.isArray(result.data) ? result.data[0] : result.data
    }
    
    for (let i = 0; i < parameters.resultMap.length; i++)
    {
      outputObj = set(
        outputObj,
        parameters.resultMap[i].target,
        get(objResult, parameters.resultMap[i].source)
      )
    }

    delete outputObj.hash

    output.push(outputObj)
  }

  for (let obj of invalidObjects) {
    var outputObj = JSON.parse(JSON.stringify(obj))
    
    output.push(outputObj)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(output)
  }
}

function callAPI ( payload ) {
  return new Promise( async ( resolve, reject ) => {
    Axios({
      method: payload.method,
      url: payload.url,
      baseURL: '',
      data: payload.data,
    })
      .then (res => resolve(res))
      .catch( err => reject( err ))
  })
}