/*global namespace*/
(function () {
    var shim = namespace.shim;
    var getKeys = shim.getKeys;

    var utils = namespace.utils;
    var isArguments = utils.isArguments;
    var isUndefinedOrNull = utils.isUndefinedOrNull;

    /**
     * Asserts deep equality
     *
     * @see taken from node.js `assert` module (copyright Joyent, MIT license)
     */
    function equal(actual, expected, types) {
        var matchingCustomType = utils.findFirst(types || [], function (type) {
            return type.identify(actual) && type.identify(expected);
        });

        if (matchingCustomType) {
            return matchingCustomType.equal(actual, expected, types);
        }

        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
            return true;

            // 7.2. If the expected value is a Date object, the actual value is
            // equivalent if it is also a Date object that refers to the same time.
        } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime();

            // 7.3. Other pairs that do not both pass typeof value == "object",
            // equivalence is determined by ==.
        } else if (typeof actual !== 'object' && typeof expected !== 'object') {
            return actual === expected;

            // 7.4. For all other Object pairs, including Array objects, equivalence is
            // determined by having the same number of owned properties (as verified
            // with Object.prototype.hasOwnProperty.call), the same set of keys
            // (although not necessarily the same order), equivalent values using === for every
            // corresponding key, and an identical "prototype" property. Note: this
            // accounts for both named and indexed properties on Arrays.
        } else {
            if (isUndefinedOrNull(actual) || isUndefinedOrNull(expected)) {
                return false;
            }
            // an identical "prototype" property.
            if (actual.prototype !== expected.prototype) {
                return false;
            }
            //~~~I've managed to break Object.keys through screwy arguments passing.
            //   Converting to array solves the problem.
            if (isArguments(actual)) {
                if (!isArguments(expected)) {
                    return false;
                }
                return equal(Array.prototype.slice.call(actual), Array.prototype.slice.call(expected), types);
            }
            var actualKeys, expectedKeys, key, i;
            try {
                actualKeys = getKeys(actual);
                expectedKeys = getKeys(expected);
            } catch (e) {//happens when one is a string literal and the other isn't
                return false;
            }
            // having the same number of owned properties (keys incorporates hasOwnProperty)
            if (actualKeys.length !== expectedKeys.length) {
                return false;
            }
            //the same set of keys (although not necessarily the same order),
            actualKeys.sort();
            expectedKeys.sort();
            //~~~cheap key test
            for (i = actualKeys.length - 1; i >= 0; i -= 1) {
                if (actualKeys[i] !== expectedKeys[i]) {
                    return false;
                }
            }
            //equivalent values for every corresponding key, and
            //~~~possibly expensive deep test
            for (i = actualKeys.length - 1; i >= 0; i -= 1) {
                key = actualKeys[i];
                if (!equal(actual[key], expected[key], types)) {
                    return false;
                }
            }
            return true;
        }
    }

    namespace.equal = equal;
}());
