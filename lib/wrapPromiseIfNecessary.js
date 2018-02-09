const makePromise = require('./makePromise');

module.exports = promise => {
  if (typeof promise.isPending !== 'function') {
    // wrap any non-Unexpected promise
    return makePromise(() => promise);
  } else {
    return promise;
  }
};
