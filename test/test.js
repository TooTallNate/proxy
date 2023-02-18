/**
 * Module dependencies.
 */

const fs = require('fs');
const net = require('net');
const path = require('path');
const http = require('http');
const https = require('https');
const assert = require('assert');
const setup = require('..');

describe('proxy', () => {
	let proxy;
	let proxyPort;

	let server;
	let serverPort;

	before((done) => {
		// setup proxy server
		proxy = setup(http.createServer());
		proxy.listen(() => {
			proxyPort = proxy.address().port;
			done();
		});
	});

	before((done) => {
		// setup target server
		server = http.createServer();
		server.listen(() => {
			serverPort = server.address().port;
			done();
		});
	});

	after((done) => {
		proxy.once('close', () => {
			done();
		});
		proxy.close();
	});

	after((done) => {
		server.once('close', () => {
			done();
		});
		server.close();
	});

	it('should proxy HTTP GET requests', (done) => {
		let gotData = false;
		let gotRequest = false;
		let host = `127.0.0.1:${  serverPort}`;
		server.once('request', (req, res) => {
			gotRequest = true;
			// ensure headers are being proxied
			assert(req.headers['user-agent'] === 'curl/7.30.0');
			assert(req.headers.host === host);
			assert(req.headers.accept === '*/*');
			res.end();
		});

		let socket = net.connect({ port: proxyPort });
		socket.once('close', () => {
			assert(gotData);
			assert(gotRequest);
			done();
		});
		socket.once('connect', () => {
			socket.write(
				`GET http://${ 
					host 
					}/ HTTP/1.1\r\n` +
					`User-Agent: curl/7.30.0\r\n` +
					`Host: ${ 
					host 
					}\r\n` +
					`Accept: */*\r\n` +
					`Proxy-Connection: Keep-Alive\r\n` +
					`\r\n`
			);
		});
		socket.setEncoding('utf8');
		socket.once('data', (data) => {
			assert(data.indexOf('HTTP/1.1 200 OK\r\n') === 0);
			gotData = true;
			socket.destroy();
		});
	});

	it('should establish connection for CONNECT requests', (done) => {
		let gotData = false;
		let socket = net.connect({ port: proxyPort });
		socket.once('close', () => {
			assert(gotData);
			done();
		});
		socket.once('connect', () => {
			let host = `127.0.0.1:${  serverPort}`;
			socket.write(
				`CONNECT ${ 
					host 
					} HTTP/1.1\r\n` +
					`Host: ${ 
					host 
					}\r\n` +
					`User-Agent: curl/7.30.0\r\n` +
					`Proxy-Connection: Keep-Alive\r\n` +
					`\r\n`
			);
		});
		socket.setEncoding('utf8');
		socket.once('data', (data) => {
			assert(
				data.indexOf('HTTP/1.1 200 Connection established\r\n') === 0
			);
			gotData = true;
			socket.destroy();
		});
	});

	describe('authentication', () => {
		function clearAuth() {
			delete proxy.authenticate;
		}

		before(clearAuth);
		after(clearAuth);

		it('should invoke the `server.authenticate()` function when set', (done) => {
			let auth = 'Basic Zm9vOmJhcg==';
			let called = false;
			proxy.authenticate = function(req, fn) {
				assert(auth === req.headers['proxy-authorization']);
				socket.destroy();
				called = true;
			};
			const socket = net.connect({ port: proxyPort });
			socket.once('close', () => {
				assert(called);
				done();
			});
			socket.once('connect', () => {
				socket.write(
					`GET / HTTP/1.1\r\n` +
						`Proxy-Authorization: ${ 
						auth 
						}\r\n` +
						`\r\n`
				);
			});
		});

		it('should provide the HTTP client with a 407 response status code', (done) => {
			proxy.authenticate = function(req, fn) {
				// reject everything
				fn(null, false);
			};
			let gotData = false;
			let socket = net.connect({ port: proxyPort });
			socket.once('close', () => {
				assert(gotData);
				done();
			});
			socket.once('connect', () => {
				socket.write('GET / HTTP/1.1\r\n\r\n');
			});
			socket.setEncoding('utf8');
			socket.once('data', (data) => {
				assert(data.indexOf('HTTP/1.1 407') === 0);
				gotData = true;
				socket.destroy();
			});
		});

		it('should close the socket after a CONNECT request\'s 407 response status code', (done) => {
			proxy.authenticate = function(req, fn) {
				// reject everything
				fn(null, false);
			};
			let gotData = false;
			let socket = net.connect({ port: proxyPort });
			socket.once('close', () => {
				assert(gotData);
				done();
			});
			socket.once('connect', () => {
				socket.write('CONNECT 127.0.0.1:80 HTTP/1.1\r\n\r\n');
			});
			socket.setEncoding('utf8');
			socket.once('data', (data) => {
				assert(data.indexOf('HTTP/1.1 407') === 0);
				gotData = true;
			});
		});
	});
});
