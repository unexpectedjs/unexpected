const Promise = require('unexpected-bluebird');
const utils = require('./utils');

let useFullStackTrace = false;
if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
  useFullStackTrace = !!window.location.search.match(
    /[?&]full-trace=true(?:$|&)/
  );
}

if (utils.getEnv('UNEXPECTED_FULL_TRACE')) {
  Promise.longStackTraces();
  useFullStackTrace = true;
}
module.exports = useFullStackTrace;
