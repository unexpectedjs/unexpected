var makePromise = require('./makePromise');

module.exports = function (promise) {
    if (typeof promise.isPending !== 'function') {
        // wrap any non-Unexpected promise
        return makePromise(function () {
            return promise;
        });
    } else {
        return promise;
    }
};
