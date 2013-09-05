
/**
 * Module dependencies.
 */

var net = require('net');
var url = require('url');
var http = require('http');
var basicAuthParser = require('basic-auth-parser');

/**
 * 13.5.1 End-to-end and Hop-by-hop Headers
 *
 * Hop-by-hop headers must be removed by the proxy before passing it on to the
 * next endpoint. Per-request basis hop-by-hop headers MUST be listed in a
 * Connection header, (section 14.10) to be introduced into HTTP/1.1 (or later).
 */

var hopByHopHeaders = [
  'Connection',
  'Keep-Alive',
  'Proxy-Authenticate',
  'Proxy-Authorization',
  'TE',
  'Trailers',
  'Transfer-Encoding',
  'Upgrade'
];

/**
 * Dummy creds...
 */

var creds = {
  username: 'foo',
  password: 'bar'
};

var server = http.createServer();

/**
 * HTTP GET/POST/DELETE/PUT, etc. proxy requests.
 */

server.on('request', function (req, res) {
  if (authenticate(req)) {
    var parsed = url.parse(req.url);
    console.log(req.method, req.url, req.headers);
    console.log(parsed);
  } else {
    requestAuthorization(socket);
  }
});

/**
 * HTTP CONNECT proxy requests.
 */

server.on('connect', function (req, socket, head) {
  if (authenticate(req)) {
    var parts = req.url.split(':');
    var host = parts[0];
    var port = +parts[1];
    var opts = { host: host, port: port };
    console.log(opts);
    var destination = net.connect(opts);
    destination.on('connect', function () {
      socket.write('HTTP/1.1 200 OK\r\n' +
                   'Proxy-Connection: close\r\n' +
                   '\r\n');
      socket.pipe(destination);
      destination.pipe(socket);
    });
    destination.on('error', function (e) {
      requestAuthorization(socket);
    });
  } else {
  }
});

/**
 * Checks `Proxy-Authorization` request headers. Same logic applied to CONNECT
 * requests as well as regular HTTP requests.
 *
 * @api private
 */

function authenticate (req, fn) {
  var auth = req.headers['proxy-authorization'];
  if (!auth) return false;
  var parsed = basicAuthParser(auth);
  console.log(parsed);
  if (parsed.scheme != 'Basic') return false;
  if (parsed.username != creds.username) return false;
  if (parsed.password != creds.password) return false;
  return true;
}

/**
 * Sends a "407 Proxy Authentication Required" HTTP response to the `socket`.
 * XXX: support/differentiate Keep-Alive/close connection here.
 *
 * @api private
 */

function requestAuthorization (socket) {
  // request Basic proxy authorization
  socket.end('HTTP/1.1 407 Proxy Authentication Required\r\n' +
             'Proxy-Authenticate: Basic realm="WallyWorld"\r\n' +
             'Proxy-Connection: close\r\n' +
             'Content-Length: 0\r\n' +
             '\r\n');

  socket.on('data', console.log);
  socket.on('end', console.log.bind(null, 'END event!'));
  socket.on('close', console.log.bind(null, 'CLOSE event!'));
}

var port = 8080;
server.listen(port);
console.log('proxy server listening on port %d', port);
