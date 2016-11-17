var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });
 
wss.on('connection', function connection(ws) {
  console.log('got connection')
  
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    setTimeout( function() {    
        ws.send('hai', function ack(error) {
            console.log(error)
        })
    }, 1000)
    });

  ws.send('something');
  ws.send('something else')
});