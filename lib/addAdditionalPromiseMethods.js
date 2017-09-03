module.exports = function addAdditionalPromiseMethods(promise, expect, subject) {
    promise.and = function () { // ...
        var args = Array.prototype.slice.call(arguments);
        function executeAnd() {
            if (expect.findTypeOf(args[0]).is('expect.it')) {
                return addAdditionalPromiseMethods(args[0](subject), expect, subject);
            } else {
                return expect.apply(expect, [subject].concat(args));
            }
        }

        if (this.isFulfilled()) {
            return executeAnd();
        } else {
            return addAdditionalPromiseMethods(this.then(executeAnd), expect, subject);
        }
    };

    return promise;
};
