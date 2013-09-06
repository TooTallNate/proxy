
/**
 * Module dependencies.
 */

var net = require('net');
var url = require('url');
var basicAuthParser = require('basic-auth-parser');
var debug = require('debug')('proxy');

/**
 * Module exports.
 */

module.exports = setup;

/**
 * Sets up an `http.Server` or `https.Server` instance with the necessary
 * "request" and "connect" event listeners in order to make the server act as an
 * HTTP proxy.
 *
 * @param {http.Server|https.Server} server
 * @param {Object} options
 * @api public
 */

function setup (server, options) {
  if (!server) http.createServer();
  server.on('request', onrequest);
  server.on('connect', onconnect);
  return server;
}

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

/**
 * HTTP GET/POST/DELETE/PUT, etc. proxy requests.
 */

function onrequest (req, res) {
  if (authenticate(req)) {
    var parsed = url.parse(req.url);
    console.log(req.method, req.url, req.headers);
    console.log(parsed);
  } else {
    requestAuthorization(socket);
  }
}

/**
 * HTTP CONNECT proxy requests.
 */

function onconnect (req, socket, head) {
  if (authenticate(req)) {
    var parts = req.url.split(':');
    var host = parts[0];
    var port = +parts[1];
    var opts = { host: host, port: port };
    console.log(opts);
    var destination = net.connect(opts);
    destination.on('connect', function () {
      socket.write('HTTP/1.1 200 Connection established\r\n' +
                   '\r\n');
      socket.pipe(destination);
      destination.pipe(socket);
    });
    destination.on('error', function (e) {
      requestAuthorization(socket);
    });
  } else {
    requestAuthorization(socket);
  }
}

/**
 * Checks `Proxy-Authorization` request headers. Same logic applied to CONNECT
 * requests as well as regular HTTP requests.
 *
 * @param {http.ServerRequest} req
 * @api private
 */

function authenticate (req) {
  var auth = req.headers['proxy-authorization'];
  if (!auth) return false;
  var parsed = basicAuthParser(auth);
  if (parsed.scheme != 'Basic') return false;
  if (parsed.username != creds.username) return false;
  if (parsed.password != creds.password) return false;
  return true;
}

/**
 * Sends a "407 Proxy Authentication Required" HTTP response to the `socket`.
 *
 * @api private
 */

function requestAuthorization (socket) {
  // request Basic proxy authorization
  var realm = 'proxy';

  socket.write('HTTP/1.1 407 Proxy Authentication Required\r\n' +
               'Proxy-Authenticate: Basic realm="' + realm + '"\r\n' +
               '\r\n');

  socket.on('data', console.log);
  socket.on('end', console.log.bind(null, 'END event!'));
  socket.on('close', console.log.bind(null, 'CLOSE event!'));
}
