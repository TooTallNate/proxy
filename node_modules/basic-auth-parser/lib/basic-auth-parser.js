module.exports = function parse(auth) {
  if (!auth || typeof auth !== 'string') {
    throw new Error('No or wrong argument');
  }

  var result = {}, parts, decoded, colon;

  parts = auth.split(' ');

  result.scheme = parts[0];
  if (result.scheme !== 'Basic') {
    return result;
  }

  decoded = new Buffer(parts[1], 'base64').toString('utf8');
  colon = decoded.indexOf(':');

  result.username = decoded.substr(0, colon);
  result.password = decoded.substr(colon + 1);

  return result;
};
