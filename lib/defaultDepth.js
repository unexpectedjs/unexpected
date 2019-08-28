const utils = require('./utils');

let defaultDepth = 3;
const matchDepthParameter =
  typeof window !== 'undefined' &&
  typeof window.location !== 'undefined' &&
  window.location.search.match(/[?&]depth=(\d+)(?:$|&)/);

if (matchDepthParameter) {
  defaultDepth = parseInt(matchDepthParameter[1], 10);
} else {
  const defaultDepthFromEnv = utils.getEnv('UNEXPECTED_DEPTH');
  if (defaultDepthFromEnv) {
    defaultDepth = parseInt(defaultDepthFromEnv, 10);
  }
}
module.exports = defaultDepth;
