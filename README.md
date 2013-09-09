proxy
=====
### An HTTP proxy written with Node.js (think Squid)
[![Build Status](https://travis-ci.org/TooTallNate/proxy.png?branch=master)](https://travis-ci.org/TooTallNate/proxy)

This module provides standard "HTTP proxy" logic. You can script your own server
using the `proxy` server API. Be sure to take a look at the "Examples" section
below.

There is also a companion `proxy(1)` CLI tool, which spawns an HTTP(s) proxy
server with the specified options.

Installation
------------

Install with `npm`:

``` bash
$ npm install proxy
```

If you would like to have the `proxy(1)` CLI program in your $PATH, then install
"globally":

``` bash
$ npm install -g proxy
```


Examples
--------

#### Basic HTTP(s) proxy server

A basic HTTP(s) server with all the default options. All requests are allowed.
CONNECT HTTP method works as well.

``` js
var http = require('http');
var setup = require('proxy');

var server = setup(http.createServer());
server.listen(3128, function () {
  var port = server.address().port;
  console.log('HTTP(s) proxy server listening on port %d', port);
});
```

License
-------

(The MIT License)

Copyright (c) 2013 Nathan Rajlich &lt;nathan@tootallnate.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
