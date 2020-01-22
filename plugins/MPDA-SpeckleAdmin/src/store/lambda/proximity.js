import get from 'lodash.get'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Proximity Filter",
        description: "Filters geometry objects based on proximity to location.",
        icon: "my_location",
        allowBucketing: true,
        customComponent: false,
        parameters : [
          {
            name: "x",
            type: "double",
          },
          {
            name: "y",
            type: "double",
          },
          {
            name: "z",
            type: "double",
          },
          {
            name: "radius",
            type: "double",
          },
          {
            name: "includeNonGeometryObjects",
            type: "boolean",
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

  var sourceLocation = [parseFloat(parameters.x), parseFloat(parameters.y), parseFloat(parameters.z)]
  var maxDistance = parseFloat(parameters.radius)

  var outputObjects = []

  input.forEach( o => {
    try
    {
      if (isWithin(o, sourceLocation, maxDistance, parameters.includeNonGeometryObjects))
        outputObjects.push(o)
    }
    catch (e)
    {
      console.log("Unable to process object with id " + o._id)
    }
  })

  return {
    statusCode: 200,
    body: JSON.stringify(outputObjects)
  }
}

function isWithin (obj, sourceLocation, maxDistance, allowNonGeometry)
{
  if (obj.type.startsWith("Point"))
  {
    if (distances(sourceLocation, obj.value).some(x => x <= maxDistance))
      return true
  }
  else if (obj.type.startsWith("Circle"))
  {
    if (distances(sourceLocation, obj.plane.origin.value)[0] + obj.radius < maxDistance)
    return true
  }
  else if (obj.type.startsWith("Arc"))
  {
    var flatPoints = []
    flatPoints.push(...obj.startPoint.value)
    flatPoints.push(...obj.midPoint.value)
    flatPoints.push(...obj.endPoint.value)
    if (distances(sourceLocation, flatPoints).some(x => x <= maxDistance))
      return true
  }
  else if (obj.type.startsWith("Ellipse"))
  {
    var dist = distances(sourceLocation, obj.plane.origin.value)[0]
    if (dist + obj.firstRadius < maxDistance || dist + obj.secondRadius < maxDistance)
      return true
  }
  else if (obj.type.startsWith("Polycurve"))
  {
    if (obj.segments.some(x => isWithin(x, sourceLocation, maxDistance, allowNonGeometry)))
      return true
  }
  else if (obj.type.startsWith("Box"))
  {
    var flatPoints = []
    var originPoint = obj.basePlane.origin.value

    for (let x = 0; x < 2; x++)
    {
      for (let y = 0; y < 2; y++)
      {
        for (let z = 0; z < 2; z++)
        {
          flatPoints.push(originPoint[0] + (x === 0 ? obj.xSize.start : obj.xSize.end))
          flatPoints.push(originPoint[1] + (y === 0 ? obj.ySize.start : obj.ySize.end))
          flatPoints.push(originPoint[2] + (z === 0 ? obj.zSize.start : obj.zSize.end))
        }
      }
    }
    
    if (distances(sourceLocation, flatPoints).some(x => x <= maxDistance))
      return true
  }
  else if (obj.type.startsWith("Line"))
  {
    if (distances(sourceLocation, obj.value).some(x => x <= maxDistance))
      return true
  }
  else if (obj.type.startsWith("Polyline"))
  {
    if (distances(sourceLocation, obj.value).some(x => x <= maxDistance))
      return true
  }
  else if (obj.type.startsWith("Curve"))
  {
    if (distances(sourceLocation, obj.points).some(x => x <= maxDistance))
      return true
  }
  else if (obj.type.startsWith("Mesh"))
  {
    if (distances(sourceLocation, obj.vertices).some(x => x <= maxDistance))
      return true
  }
  else if (obj.type.startsWith("Brep"))
  {
    if (isWithin(obj.displayValue, sourceLocation, maxDistance, allowNonGeometry))
    return false
  }
  else if (obj.type.startsWith("Extrusion"))
  {
    var flatPoints = []
    flatPoints.push(...obj.pathStart.value)
    flatPoints.push(...obj.pathEnd.value)
    if (distances(sourceLocation, flatPoints).some(x => x <= maxDistance))
      return true
  }
  else if (allowNonGeometry)
    return true

  return false
}


function distances (source, targets)
{
  var distances = []
  for (let i = 0; i < targets.length; i+=3)
  {
    distances.push(
      Math.sqrt(Math.pow(targets[i] - source[0], 2) + Math.pow(targets[i + 1] - source[1], 2) + Math.pow(targets[i + 2] - source[2], 2))
    )
  }
  return distances
}