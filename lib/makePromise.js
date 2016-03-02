var Promise = require('unexpected-bluebird');
var oathbreaker = require('./oathbreaker');
var throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');

function makePromise(body) {
    if (typeof body !== 'function') {
        throw new TypeError('expect.promise(...) requires a function argument to be supplied.\n' +
                            'See http://unexpectedjs.github.io/api/promise/ for more details.');
    }

    if (body.length === 2) {
        return new Promise(body);
    }

    return new Promise(function (resolve, reject) {
        var runningTasks = 0;
        var resolvedValue;

        function fulfillIfDone() {
            if (runningTasks === 0) {
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
            return function () {
                runningTasks -= 1;
                try {
                    var result = cb.apply(null, arguments);
                    result = oathbreaker(result);
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
                fulfillIfDone();
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
            Array.prototype.push.apply(promises, extractPromisesFromObject(obj[key]));
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

['resolve', 'reject'].forEach(function (staticMethodName) {
    makePromise[staticMethodName] = Promise[staticMethodName];
});

module.exports = makePromise;
