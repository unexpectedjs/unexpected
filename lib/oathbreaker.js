/*global Promise:true*/
var workQueue = require('./workQueue');
var Promise = require('bluebird');
module.exports = function oathbreaker(value) {
    if (!value || typeof value.then !== 'function') {
        return null;
    }

    if (!value.isRejected) {
        return value;
    }

    if (value.isFulfilled()) {
        return null;
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
    value.then(function () {
        evaluated = true;
        onResolve();
    }).caught(function (err) {
        evaluated = true;
        error = err;
        onReject(err);
    });

    workQueue.drain();

    if (evaluated && error) {
        throw error;
    } else if (evaluated) {
        return null;
    }

    return new Promise(function (resolve, reject) {
        onResolve = resolve;
        onReject = reject;
    });
};
