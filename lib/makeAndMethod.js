module.exports = function makeAndMethod(expect, subject) {
    return function () { // ...
        var args = Array.prototype.slice.call(arguments);
        function executeAnd() {
            if (expect.findTypeOf(args[0]).is('expect.it')) {
                return args[0](subject);
            } else {
                return expect.apply(expect, [subject].concat(args));
            }
        }

        if (this.isFulfilled()) {
            return executeAnd();
        } else {
            return this.then(executeAnd);
        }
    };
};
