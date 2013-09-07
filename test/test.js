
/**
 * Module dependencies.
 */

var fs = require('fs');
var net = require('net');
var path = require('path');
var http = require('http');
var https = require('https');
var assert = require('assert');
var setup = require('../');


describe('proxy', function () {

  var proxy;
  var port;

  this.slow(1000);

  before(function (done) {
    proxy = setup(http.createServer());
    proxy.listen(function () {
      port = proxy.address().port;
      done();
    });
  });

  after(function (done) {
    proxy.once('close', function () { done(); });
    proxy.close();
  });

  it('should proxy HTTP GET requests', function (done) {
    var gotData = false;
    var socket = net.connect({ port: port });
    socket.once('close', function () {
      assert(gotData);
      done();
    });
    socket.once('connect', function () {
      socket.write(
        'GET http://www.google.com/ HTTP/1.1\r\n' +
        'User-Agent: curl/7.30.0\r\n' +
        'Host: www.google.com\r\n' +
        'Accept: */*\r\n' +
        'Proxy-Connection: Keep-Alive\r\n' +
        '\r\n');
    });
    socket.setEncoding('utf8');
    socket.once('data', function (data) {
      assert(0 == data.indexOf('HTTP/1.1 200 OK\r\n'));
      gotData = true;
      socket.destroy();
    });
  });

  it('should establish connection for CONNECT requests', function (done) {
    var gotData = false;
    var socket = net.connect({ port: port });
    socket.once('close', function () {
      assert(gotData);
      done();
    });
    socket.once('connect', function () {
      socket.write(
        'CONNECT google.com:443 HTTP/1.1\r\n' +
        'Host: google.com:443\r\n' +
        'User-Agent: curl/7.30.0\r\n' +
        'Proxy-Connection: Keep-Alive\r\n' +
        '\r\n');
    });
    socket.setEncoding('utf8');
    socket.once('data', function (data) {
      assert(0 == data.indexOf('HTTP/1.1 200 Connection established\r\n'));
      gotData = true;
      socket.destroy();
    });
  });


  describe('authentication', function () {
    function clearAuth () {
      delete proxy.authenticate;
    }

    before(clearAuth);
    after(clearAuth);

    it('should invoke the `server.authenticate()` function when set', function (done) {
      var auth = 'Basic Zm9vOmJhcg==';
      var called = false;
      proxy.authenticate = function (req, fn) {
        assert(auth == req.headers['proxy-authorization']);
        socket.destroy();
        called = true;
      };
      var socket = net.connect({ port: port });
      socket.once('close', function () {
        assert(called);
        done();
      });
      socket.once('connect', function () {
        socket.write(
          'GET / HTTP/1.1\r\n' +
          'Proxy-Authorization: ' + auth + '\r\n' +
          '\r\n');
      });
    });

    it('should provide the HTTP client with a 407 response status code', function (done) {
      proxy.authenticate = function (req, fn) {
        // reject everything
        fn(null, false);
      };
      var gotData = false;
      var socket = net.connect({ port: port });
      socket.once('close', function () {
        assert(gotData);
        done();
      });
      socket.once('connect', function () {
        socket.write('GET / HTTP/1.1\r\n\r\n');
      });
      socket.setEncoding('utf8');
      socket.once('data', function (data) {
        assert(0 == data.indexOf('HTTP/1.1 407'));
        gotData = true;
        socket.destroy();
      });
    });

  });

});
