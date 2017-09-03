function addAdditionalPromiseMethods(promise, expect, subject) {
    promise.and = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

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

module.exports = addAdditionalPromiseMethods;