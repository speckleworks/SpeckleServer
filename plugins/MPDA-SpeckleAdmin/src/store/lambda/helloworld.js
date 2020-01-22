exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Hello World!",
        description: "Spits out hello world.",
        icon: "person",
        allowBucketing: true,
        parameters : [ ],
      }),
    }
  }

  return {
    statusCode: 200,
    body: "Hello Hello Hello!"
  }
}
