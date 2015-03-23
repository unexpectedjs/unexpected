var makePromise = require('./makePromise');

module.exports = function everyPromise(promiseBodies) {
    var promise = makePromise(promiseBodies[0]);
    promiseBodies.slice(1).forEach(function (body) {
        promise = promise.then(function () {
            return makePromise(body);
        });
    });
    return promise;
};
