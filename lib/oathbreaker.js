var Promise = require('bluebird');
var workQueue = require('./workQueue');
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

    var evaluated = false;
    var error;
    value.then(function () {
        evaluated = true;
    }).caught(function (err) {
        evaluated = true;
        error = err;
    });

    workQueue.drain();

    if (evaluated && error) {
        throw error;
    } else if (evaluated) {
        return null;
    }

    return value;
};
