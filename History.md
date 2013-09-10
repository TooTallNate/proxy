0.2.0 / 2013-09-10
==================

 - Fix calling the setup() function without any arguments
 - Initial integration of "commander" for the `proxy(1)` program

0.1.0 / 2013-09-09
==================

 - Added "Via" header
 - Added "X-Forwared-For" header
 - Strip hop-by-hop headers from requests and responses
 - Better tests (no longer reach the internet)
 - Add `.travis.yml` file
 - Proxy headers as original casing with node >= v0.11.6 (`rawHeaders`)
 - bin: set the `process.title` to "proxy"

0.0.1 / 2013-09-07
==================

 - Initial release
