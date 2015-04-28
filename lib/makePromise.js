/*global Promise:true*/
var Promise = require('bluebird');
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
        var errors = [];
        var values = [];

        function finishWhenDone () {
            if (runningTasks === 0) {
                if (errors.length > 0) {
                    reject(errors[0]);
                } else {
                    resolve(values[0]);
                }
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
                            if (typeof value !== 'undefined') {
                                values.push(value);
                            }
                            runningTasks -= 1;
                            finishWhenDone();
                        }).caught(function (e) {
                            errors.push(e);
                            runningTasks -= 1;
                            finishWhenDone();
                        });
                    } else if (typeof result !== 'undefined') {
                        values.push(result);
                    }
                } catch (e) {
                    errors.push(e);
                } finally {
                    finishWhenDone();
                }
            };
        };

        try {
            var result = oathbreaker(body(runner));
            if (isPromise(result)) {
                runningTasks += 1;
                result.then(function (value) {
                    if (typeof value !== 'undefined') {
                        values.push(value);
                    }
                    runningTasks -= 1;
                    finishWhenDone();
                }).caught(function (e) {
                    errors.push(e);
                    runningTasks -= 1;
                    finishWhenDone();
                });
            } else if (typeof result !== 'undefined') {
                values.push(result);
            }
        } catch (e) {
            errors.push(e);
        }
        finishWhenDone();
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

module.exports = makePromise;
