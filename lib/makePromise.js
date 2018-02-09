const Promise = require('unexpected-bluebird');
const oathbreaker = require('./oathbreaker');
const throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');

function makePromise(body) {
  if (typeof body !== 'function') {
    throw new TypeError(
      'expect.promise(...) requires a function argument to be supplied.\n' +
        'See http://unexpected.js.org/api/promise/ for more details.'
    );
  }

  if (body.length === 2) {
    return new Promise(body);
  }

  return new Promise((resolve, reject) => {
    let runningTasks = 0;
    let resolvedValue;
    let outerFunctionHasReturned = false;

    function fulfillIfDone() {
      if (outerFunctionHasReturned && runningTasks === 0) {
        resolve(resolvedValue);
      }
    }

    function noteResolvedValue(value) {
      if (
        typeof value !== 'undefined' &&
        typeof resolvedValue === 'undefined'
      ) {
        resolvedValue = value;
      }
    }

    const runner = cb => {
      runningTasks += 1;
      return (...args) => {
        runningTasks -= 1;
        let result;
        try {
          if (typeof cb === 'function') {
            result = oathbreaker(cb(...args));
            if (isPromise(result)) {
              runningTasks += 1;
              result.then(value => {
                noteResolvedValue(value);
                runningTasks -= 1;
                fulfillIfDone();
              }, reject);
            } else {
              noteResolvedValue(result);
            }
          }
        } catch (e) {
          return reject(e);
        }
        fulfillIfDone();
        return result;
      };
    };

    try {
      const result = oathbreaker(body(runner));
      if (isPromise(result)) {
        runningTasks += 1;
        result.then(value => {
          noteResolvedValue(value);
          runningTasks -= 1;
          fulfillIfDone();
        }, reject);
      } else {
        noteResolvedValue(result);
      }
    } catch (e) {
      return reject(e);
    }
    outerFunctionHasReturned = true;
    fulfillIfDone();
  });
}

function isPromise(obj) {
  return obj && typeof obj === 'object' && typeof obj.then === 'function';
}

function extractPromisesFromObject(obj) {
  if (isPromise(obj)) {
    return [obj];
  } else if (obj && typeof obj === 'object') {
    const promises = [];
    // Object or Array
    Object.keys(obj).forEach(key => {
      promises.push(...extractPromisesFromObject(obj[key]));
    });
    return promises;
  }
  return [];
}

['all', 'any', 'settle'].forEach(staticMethodName => {
  makePromise[staticMethodName] = obj => {
    const result = Promise[staticMethodName](extractPromisesFromObject(obj));
    if (staticMethodName === 'settle') {
      return result.then(promises => {
        promises.forEach(promise => {
          if (promise.isRejected()) {
            throwIfNonUnexpectedError(promise.reason());
          }
        });
        return promises;
      });
    }
    return result;
  };
});

// Expose all of Bluebird's static methods, except the ones related to long stack traces,
// unhandled rejections and the scheduler, which we need to manage ourselves:
Object.keys(Promise).forEach(staticMethodName => {
  if (
    !/^_|^on|^setScheduler|ongStackTraces/.test(staticMethodName) &&
    typeof Promise[staticMethodName] === 'function' &&
    typeof makePromise[staticMethodName] === 'undefined'
  ) {
    makePromise[staticMethodName] = Promise[staticMethodName];
  }
});

module.exports = makePromise;
