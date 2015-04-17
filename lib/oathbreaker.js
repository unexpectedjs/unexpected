/*global Promise:true*/
var workQueue = require('./workQueue');
var Promise = require('bluebird');
module.exports = function oathbreaker(value) {
    if (!value || typeof value.then !== 'function') {
        return value;
    }

    if (!value.isRejected) {
        return value;
    }

    if (value.isFulfilled()) {
        return value.value();
    }


    if (value.isRejected()) {
        value.caught(function () {
            // Ignore - already handled
        });

        throw value.reason();
    }

    var onResolve = function () {};
    var onReject = function () {};

    var evaluated = false;
    var error;
    var resolvedValue;
    value.then(function (obj) {
        evaluated = true;
        resolvedValue = obj;
        onResolve(value);
    }).caught(function (err) {
        evaluated = true;
        error = err;
        onReject(err);
    });

    workQueue.drain();

    if (evaluated && error) {
        throw error;
    } else if (evaluated) {
        return resolvedValue;
    }

    return new Promise(function (resolve, reject) {
        onResolve = resolve;
        onReject = reject;
    });
};
