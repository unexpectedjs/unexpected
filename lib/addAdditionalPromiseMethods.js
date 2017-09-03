function addAdditionalPromiseMethods(promise, expect, subject) {
    promise.and = function (...args) {
        function executeAnd() {
            if (expect.findTypeOf(args[0]).is('expect.it')) {
                return addAdditionalPromiseMethods(args[0](subject), expect, subject);
            } else {
                return expect(subject, ...args);
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

module.exports = addAdditionalPromiseMethods;
