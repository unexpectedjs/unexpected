var Promise = require('unexpected-bluebird');
var oathbreaker = require('./oathbreaker');
var throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');

function makePromise(body) {
    if (typeof body !== 'function') {
        throw new TypeError('expect.promise(...) requires a function argument to be supplied.\n' +
                            'See http://unexpected.js.org/api/promise/ for more details.');
    }

    if (body.length === 2) {
        return new Promise(body);
    }

    return new Promise(function (resolve, reject) {
        var runningTasks = 0;
        var resolvedValue;
        var outerFunctionHasReturned = false;

        function fulfillIfDone() {
            if (outerFunctionHasReturned && runningTasks === 0) {
                resolve(resolvedValue);
            }
        }

        function noteResolvedValue(value) {
            if (typeof value !== 'undefined' && typeof resolvedValue === 'undefined') {
                resolvedValue = value;
            }
        }

        var runner = function (cb) {
            runningTasks += 1;
            return function (...args) {
                runningTasks -= 1;
                var result;
                try {
                    if (typeof cb === 'function') {
                        result = oathbreaker(cb(...args));
                        if (isPromise(result)) {
                            runningTasks += 1;
                            result.then(function (value) {
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
            var result = oathbreaker(body(runner));
            if (isPromise(result)) {
                runningTasks += 1;
                result.then(function (value) {
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
        var promises = [];
        // Object or Array
        Object.keys(obj).forEach(function (key) {
            promises.push(...extractPromisesFromObject(obj[key]));
        });
        return promises;
    }
    return [];
}

['all', 'any', 'settle'].forEach(function (staticMethodName) {
    makePromise[staticMethodName] = function (obj) {
        var result = Promise[staticMethodName](extractPromisesFromObject(obj));
        if (staticMethodName === 'settle') {
            return result.then(function (promises) {
                promises.forEach(function (promise) {
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
Object.keys(Promise).forEach(function (staticMethodName) {
    if (!/^_|^on|^setScheduler|ongStackTraces/.test(staticMethodName) && typeof Promise[staticMethodName] === 'function' && typeof makePromise[staticMethodName] === 'undefined') {
        makePromise[staticMethodName] = Promise[staticMethodName];
    }
});

module.exports = makePromise;
