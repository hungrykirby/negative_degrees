var utils = require('./twit_utils');
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(process.env.PORT || 8000);
console.log('Server running');

utils.get_screen_name()
  .then(utils.streaming);
