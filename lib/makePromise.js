/*global Promise:true*/
var Promise = require('bluebird');
var oathbreaker = require('./oathbreaker');

function makePromise(body) {
    return new Promise(function (resolve, reject) {
        var runningTasks = 0;
        var errors = [];

        function finishWhenDone () {
            if (runningTasks === 0) {
                if (errors.length > 0) {
                    reject(errors[0]);
                } else {
                    resolve();
                }
            }
        }

        var runner = function (cb) {
            runningTasks += 1;
            return function () {
                runningTasks -= 1;
                try {
                    var result = cb.apply(null, arguments);
                    var promise = oathbreaker(result);
                    if (promise) {
                        runningTasks += 1;
                        result.then(function () {
                            runningTasks -= 1;
                            finishWhenDone();
                        }).caught(function (e) {
                            errors.push(e);
                            runningTasks -= 1;
                            finishWhenDone();
                        });
                    }
                } catch (e) {
                    errors.push(e);
                } finally {
                    finishWhenDone();
                }
            };
        };

        try {
            var promise = oathbreaker(body(runner));
            if (promise) {
                runningTasks += 1;
                promise.then(function () {
                    runningTasks -= 1;
                    finishWhenDone();
                }).caught(function (e) {
                    errors.push(e);
                    runningTasks -= 1;
                    finishWhenDone();
                });
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

function isNonPromiseNonArrayObject(obj) {
    return obj && typeof obj === 'object' && typeof obj.then !== 'function' && !Array.isArray(obj);
}

function extractPromisesFromObject(obj) {
    var promises = Object.keys(obj)
        .filter(function (key) {
            return isPromise(obj[key]);
        }).map(function (key) {
            return obj[key];
        });
    return promises;
}

['all', 'any', 'settle'].forEach(function (staticMethodName) {
    makePromise[staticMethodName] = function (obj) {
        return Promise[staticMethodName](isNonPromiseNonArrayObject(obj) ? extractPromisesFromObject(obj) : obj);
    };
});

module.exports = makePromise;
