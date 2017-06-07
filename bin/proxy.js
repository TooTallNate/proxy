#!/usr/bin/env node

process.title = 'proxy';

/**
 * Module dependencies.
 */

var program = require('commander');
var version = require('../package.json').version;

program
  .version(version)
  .option('-p, --port <n>', 'TCP port number to bind to. Defaults to 3128', 3128, Number)
  .option('-a, --authenticate <command>', '"authenticate" command to run when "Proxy-Authorization" is given')
  .parse(process.argv);

var http = require('http');
var setup = require('../');
var debug = require('debug')('proxy');
var spawn = require('child_process').spawn;
var basicAuthParser = require('basic-auth-parser');

/**
 * Setup the HTTP "proxy server" instance.
 */

var proxy = http.createServer();
setup(proxy);

/**
 * Outbound proxy requests will use `agent: false`.
 */

debug('setting outbound proxy request\'s `agent` to `false`');
proxy.agent = false;

/**
 * Proxy authenticate function.
 */

if (program.authenticate) {
  debug('setting `authenticate()` function for: "%s"', program.authenticate);
  proxy.authenticate = function (req, fn) {
    debug('authenticate(): "%s"', program.authenticate);

    // parse the "Proxy-Authorization" header
    var auth = req.headers['proxy-authorization'];
    if (!auth) {
      // optimization: don't invoke the child process if no
      // "Proxy-Authorization" header was given
      return fn(null, false);
    }
    var parsed = basicAuthParser(auth);
    debug('parsed "Proxy-Authorization": %j', parsed);

    // spawn a child process with the user-specified "authenticate" command
    var i;
    var env = {};
    for (i in process.env) {
      // inherit parent env variables
      env[i] = process.env[i];
    }
    // add "auth" related ENV variables
    for (i in parsed) {
      env['PROXY_AUTH_' + i.toUpperCase()] = parsed[i];
    }

    var opts = {};
    opts.stdio = [ 'ignore', 1, 2 ];
    opts.env = env;

    var args = [ '-c', program.authenticate ];
    // TODO: add Windows support
    var child = spawn('/bin/sh', args, opts);

    function onerror (err) {
      child.removeListener('exit', onexit);
      fn(err);
    }

    function onexit (code, signal) {
      debug('authentication child process "exit" event: %s %s', code, signal);
      child.removeListener('error', onerror);
      fn(null, 0 == code);
    }

    child.once('error', onerror);
    child.once('exit', onexit);
  };
}

/**
 * Bind to port.
 */

proxy.listen(program.port, function () {
  console.log('HTTP(s) proxy server listening on port %d', this.address().port);
});
