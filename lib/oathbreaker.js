var workQueue = require('./workQueue');
var Promise = require('unexpected-bluebird');
var useFullStackTrace = require('./useFullStackTrace');

module.exports = function oathbreaker(value) {
  if (!value || typeof value.then !== 'function') {
    return value;
  }

  if (!value.isRejected) {
    // this is not a bluebird promise
    return value;
  }

  if (value.isFulfilled()) {
    return value;
  }

  if (value.isRejected()) {
    value.caught(() => {
      // Ignore - already handled
    });

    throw value.reason();
  }

  var onResolve = () => {};
  var onReject = () => {};

  var evaluated = false;
  var error;
  value.then(
    obj => {
      evaluated = true;
      onResolve(value);
    },
    err => {
      evaluated = true;
      error = err;
      onReject(err);
    }
  );

  workQueue.drain();

  if (evaluated && error) {
    if (error._isUnexpected && Error.captureStackTrace) {
      Error.captureStackTrace(error);
    }
    throw error;
  } else if (evaluated) {
    return value;
  } else if (value._captureStackTrace && !useFullStackTrace) {
    value._captureStackTrace(true);
  }

  return new Promise((resolve, reject) => {
    onResolve = resolve;
    onReject = reject;
  });
};
