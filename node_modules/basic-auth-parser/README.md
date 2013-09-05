# basic-auth-parser [![Build Status](https://secure.travis-ci.org/mmalecki/basic-auth-parser.png)](http://travis-ci.org/mmalecki/basic-auth-parser)
`basic-auth-parser` parses Basic Auth `Authorization` HTTP headers.

## Installation

    npm install basic-auth-parser

## Usage
```js
var basicAuthParser = require('./');
console.dir(basicAuthParser('Basic YWRtaW46cGFzc3dvcmQ='));
```

Output:
```
{ scheme: 'Basic', username: 'admin', password: 'password' }
```
