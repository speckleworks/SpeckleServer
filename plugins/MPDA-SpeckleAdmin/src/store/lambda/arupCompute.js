import Axios from 'axios'
import get from 'lodash.get'
import set from 'lodash.set'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "ArupCompute",
        description: "Perform calculations on ArupCompute",
        icon: "person",
        allowBucketing: true,
        customComponent: true,
        parameters : [
          {
            name: "selectedLibrary",
            type: "object",
          },
          {
            name: "selectedFunction",
            type: "object",
          },
          {
            name: "pathData",
            type: "object",
          },
          {
            name: "valueData",
            type: "object",
          },
          {
            name: "outputPath",
            type: "string",
          }
        ],
        msal :{
          clientId: "b69b78cf-f613-4bd2-ad91-df0c8f86835b",
          authority: "https://login.microsoftonline.com/4ae48b41-0137-4599-8661-fc641fe77bea",
          loginRequest: 
          {
            scopes: ["api://df8247c5-9e83-4409-9946-6daf9722271a/access_as_user"]
          }
        }
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

  // Clean inputs
  if (parameters.pathData)
    parameters.pathData = Object.assign({}, ...
      Object.entries(parameters.pathData).filter(([k,v]) => {
        return (v !== null)
      }).map(([k,v]) => ({[k]:v}))
    )
  else
    parameters.pathData = {}
    
  if (parameters.valueData)
    parameters.valueData = Object.assign({}, ...
      Object.entries(parameters.valueData).filter(([k,v]) => {
        return (v !== null)
      }).map(([k,v]) => ({[k]:v}))
    )
  else
    parameters.valueData = {}
  
  if (parameters.outputPath === null || parameters.outputPath === undefined)
      parameters.outputPath = ''
  
  // Try to send stream objects
  var output = [ ]
  var validObjects = [ ]
  var invalidObjects = [ ]
  
  var restInput = {
    method: 'POST',
    url: parameters.selectedFunction.api,
    baseURL: `https://compute.arup.digital/api`,
    data: { },
    headers: {
      Authorization: 'Bearer ' + token
    }
  }

  if (parameters.selectedFunction.inputs.length > 0)
  {
    for (let obj of input) {
      var skip = false
      var tempDict = { }

      for (let i = 0; i < Object.keys(parameters.pathData).length; i++)
      {
        let k = Object.keys(parameters.pathData)[i]
        tempDict[k] = get(obj, parameters.pathData[k])
        if (tempDict[k] == null)
        {
          invalidObjects.push(obj)
          skip = true
          break
        }
      }

      if (skip) continue

      for (let key in parameters.valueData)
        tempDict[key] = parameters.valueData[key]

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
  }
  else
    validObjects = input

  let result = await callAPI(restInput)
  
  for (let obj of validObjects) {
    var outputObj = JSON.parse(JSON.stringify(obj))

    var objResult

    if (parameters.selectedFunction.inputs.length > 0)
      objResult = Array.isArray(result.data) ? result.data.splice(0,1)[0] : result.data
    else
      objResult = Array.isArray(result.data) ? result.data[0] : result.data
    
    try
    {
      if (objResult.arupComputeResultItems.length === 1)
      {
        outputObj = set(
          outputObj,
          parameters.outputPath.replace("/^.+|.+$/g", ''),
          objResult.arupComputeResultItems[0].value
        )
      }
      else if (objResult.arupComputeResultItems.length > 0)
      {
        objResult.arupComputeResultItems.forEach( res => {
          outputObj = set(
            outputObj,
            parameters.outputPath.replace("/^.+|.+$/g", '') + '.' + res.symbol,
            res.value
          )
        })
      }
      else
      {
        outputObj = set(
          outputObj,
          parameters.outputPath.replace("/^.+|.+$/g", ''),
          objResult.result
        )
      }
    }
    catch
    {
      // Desperately stuff all data in there :O
      outputObj = set(
        outputObj,
        parameters.outputPath.replace("/^.+|.+$/g", ''),
        objResult.hasOwnProperty('result') ? objResult.result : objResult
      )
    }

    delete outputObj.hash

    output.push(outputObj)
  }

  output.push(...invalidObjects)

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
      baseURL: payload.baseURL,
      data: payload.data,
      headers: payload.headers
    })
      .then (res => resolve( res ))
      .catch( err => reject( err ))
  })
}