module.exports = function makeAndMethod(expect, subject) {
    return function () { // ...
        var args = Array.prototype.slice.call(arguments);
        function executeAnd() {
            if (expect.findTypeOf(args[0]).is('expect.it')) {
                var result = args[0](subject);
                result.and = makeAndMethod(expect, subject);
                return result;
            } else {
                return expect.apply(expect, [subject].concat(args));
            }
        }

        if (this.isFulfilled()) {
            return executeAnd();
        } else {
            var result = this.then(executeAnd);
            result.and = makeAndMethod(expect, subject);
            return result;
        }
    };
};
