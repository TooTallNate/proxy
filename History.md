
0.2.4 / 2016-01-18
==================

  * travis: test node v0.8, v0.10, and v0.12, v1, v2, v3, v4, and v5
  * README: use SVG for Travis-CI badge
  * package: update all the deps

0.2.3 / 2014-04-04
==================

  * package: update "mocha", remove from dependencies

0.2.2 / 2014-04-03
==================

  * History: match `git changelog` styling
  * package: update outdated deps
  * proxy: remove double semicolon
  * proxy: refactor to make the named functions be top-level
  * proxy: add a few debug() calls

0.2.1 / 2013-09-16
==================

  * Close the socket after a CONNECT authorization request

0.2.0 / 2013-09-10
==================

  * Fix calling the setup() function without any arguments
  * Initial integration of "commander" for the `proxy(1)` program

0.1.0 / 2013-09-09
==================

  * Added "Via" header
  * Added "X-Forwared-For" header
  * Strip hop-by-hop headers from requests and responses
  * Better tests (no longer reach the internet)
  * Add `.travis.yml` file
  * Proxy headers as original casing with node >= v0.11.6 (`rawHeaders`)
  * bin: set the `process.title` to "proxy"

0.0.1 / 2013-09-07
==================

  * Initial release
