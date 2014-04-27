/*global namespace*/
(function () {
    var shim = namespace.shim;
    var bind = shim.bind;
    var forEach = shim.forEach;
    var filter = shim.filter;
    var map = shim.map;
    var indexOf = shim.indexOf;
    var trim = shim.trim;
    var reduce = shim.reduce;
    var getKeys = shim.getKeys;

    var utils = namespace.utils;
    var truncateStack = utils.truncateStack;
    var isUndefinedOrNull = utils.isUndefinedOrNull;
    var isArguments = utils.isArguments;
    var getKeysOfDefinedProperties = utils.getKeysOfDefinedProperties;
    var extend = utils.extend;
    var levenshteinDistance = utils.levenshteinDistance;
    var isArray = utils.isArray;

    function Assertion(expect, subject, testDescription, flags, args) {
        this.expect = expect;
        this.obj = subject; // deprecated
        this.equal = bind(expect.equal, expect); // deprecated
        this.eql = this.equal; // deprecated
        this.inspect = bind(expect.inspect, expect); // deprecated
        this.subject = subject;
        this.testDescription = testDescription;
        this.flags = flags;
        this.args = args;
        this.errorMode = 'default';
    }

    Assertion.prototype.standardErrorMessage = function () {
        var expect = this.expect;
        var argsString = map(this.args, function (arg) {
            return expect.inspect(arg);
        }).join(', ');

        if (argsString.length > 0) {
            argsString = ' ' + argsString;
        }

        return 'expected ' +
            expect.inspect(this.subject) +
            ' ' + this.testDescription +
            argsString;
    };

    Assertion.prototype.throwStandardError = function () {
        var err = new Error(this.standardErrorMessage());
        err._isUnexpected = true;
        throw err;
    };

    Assertion.prototype.assert = function (condition) {
        var not = !!this.flags.not;
        condition = !!condition;
        if (condition === not) {
            this.throwStandardError();
        }
    };

    function Unexpected(assertions, types) {
        this.assertions = assertions || {};
        this.types = types || [];
    }

    Unexpected.prototype.equal = function (actual, expected, stack) {
        var matchingCustomType = utils.findFirst(this.types || [], function (type) {
            return type.identify(actual) && type.identify(expected);
        });

        if (matchingCustomType) {
            return matchingCustomType.equal(actual, expected);
        }

        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
            return true;

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
                return this.equal(Array.prototype.slice.call(actual), Array.prototype.slice.call(expected), stack);
            }
            var actualKeys = getKeysOfDefinedProperties(actual),
                expectedKeys = getKeysOfDefinedProperties(expected),
                key,
                i;

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
            if (stack) {
                if (indexOf(stack, actual) !== -1) {
                    throw new Error('Cannot compare circular structures');
                }
                stack.push(actual);
            } else {
                stack = [actual];
            }
            //equivalent values for every corresponding key, and
            //~~~possibly expensive deep test
            for (i = actualKeys.length - 1; i >= 0; i -= 1) {
                key = actualKeys[i];
                if (!this.equal(actual[key], expected[key], stack)) {
                    stack.pop();
                    return false;
                }
            }
            stack.pop();
            return true;
        }
    };

    Unexpected.prototype.inspect = function (obj) {
        return namespace.inspect(obj, false, 2, this.types);
    };

    Unexpected.prototype.format = function (message, args) {
        args = map(args, function (arg) {
            return this.inspect(arg);
        }, this);
        message = message.replace(/\{(\d+)\}/g, function (match, n) {
            return args[n] || match;
        });
        return message;
    };

    Unexpected.prototype.fail = function (message) {
        message = message || "explicit failure";
        var args = Array.prototype.slice.call(arguments, 1);
        throw new Error(this.format(message, args));
    };

    Unexpected.prototype.findAssertionSimilarTo = function (text) {
        var editDistrances = [];
        forEach(getKeys(this.assertions), function (assertion) {
            var distance = levenshteinDistance(text, assertion);
            editDistrances.push({
                assertion: assertion,
                distance: distance
            });
        });
        editDistrances.sort(function (x, y) {
            return x.distance - y.distance;
        });
        return map(editDistrances.slice(0, 5), function (editDistrance) {
            return editDistrance.assertion;
        });
    };

    Unexpected.prototype.addAssertion = function () {
        var assertions = this.assertions;
        var patterns = Array.prototype.slice.call(arguments, 0, -1);
        var handler = Array.prototype.slice.call(arguments, -1)[0];
        forEach(patterns, function (pattern) {
            ensureValidPattern(pattern);
            forEach(expandPattern(pattern), function (expandedPattern) {
                assertions[expandedPattern.text] = {
                    handler: handler,
                    flags: expandedPattern.flags
                };
            });
        });

        return this.expect; // for chaining
    };

    Unexpected.prototype.addType = function (obj) {
        this.types.unshift(obj);

        return this.expect;
    };

    Unexpected.prototype.installPlugin = function (plugin) {
        if (typeof plugin !== 'function') {
            throw new Error('Expected first argument given to installPlugin to be a function');
        }

        plugin(this.expect);

        return this.expect; // for chaining
    };

    Unexpected.prototype.sanitize = function (obj, stack) {
        stack = stack || [];

        var i;
        for (i = 0 ; i < stack.length ; i += 1) {
            if (stack[i] === obj) {
                return obj;
            }
        }

        stack.push(obj);

        var sanitized,
            matchingCustomType = utils.findFirst(this.types || [], function (type) {
                return type.identify(obj);
            });
        if (matchingCustomType) {
            sanitized = this.sanitize(matchingCustomType.toJSON(obj), stack);
        } else if (isArray(obj)) {
            sanitized = map(obj, function (item) {
                return this.sanitize(item, stack);
            }, this);
        } else if (typeof obj === 'object' && obj) {
            sanitized = {};
            forEach(getKeys(obj).sort(), function (key) {
                sanitized[key] = this.sanitize(obj[key], stack);
            }, this);
        } else {
            sanitized = obj;
        }
        stack.pop();
        return sanitized;
    };


    function handleNestedExpects(e, assertion) {
        switch (assertion.errorMode) {
        case 'nested':
            e.message = assertion.standardErrorMessage() + '\n    ' + e.message.replace(/\n/g, '\n    ');
            break;
        case 'default':
            e.message = assertion.standardErrorMessage();
            break;
        case 'bubble':
            break;
        default:
            throw new Error("Unknown error mode: '" + assertion.errorMode + "'");
        }
    }

    function installExpectMethods(unexpected, expectFunction) {
        var expect = bind(expectFunction, unexpected);
        expect.equal = bind(unexpected.equal, unexpected);
        expect.sanitize = bind(unexpected.sanitize, unexpected);
        expect.inspect = bind(unexpected.inspect, unexpected);
        expect.fail = bind(unexpected.fail, unexpected);
        expect.addAssertion = bind(unexpected.addAssertion, unexpected);
        expect.addType = bind(unexpected.addType, unexpected);
        expect.clone = bind(unexpected.clone, unexpected);
        expect.toString = bind(unexpected.toString, unexpected);
        expect.assertions = unexpected.assertions;
        expect.installPlugin = bind(unexpected.installPlugin, unexpected);
        return expect;
    }

    function makeExpectFunction(unexpected) {
        var expect = installExpectMethods(unexpected, unexpected.expect);
        unexpected.expect = expect;
        return expect;
    }

    Unexpected.prototype.expect = function expect(subject, testDescriptionString) {
        var that = this;
        if (arguments.length < 2) {
            throw new Error('The expect functions requires at least two parameters.');
        }
        if (typeof testDescriptionString !== 'string') {
            throw new Error('The expect functions requires second parameter to be a string.');
        }
        var assertionRule = this.assertions[testDescriptionString];
        if (assertionRule) {
            var flags = extend({}, assertionRule.flags);
            var nestingLevel = 0;
            var wrappedExpect = function wrappedExpect(subject, testDescriptionString) {
                testDescriptionString = trim(testDescriptionString.replace(/\[(!?)([^\]]+)\] ?/g, function (match, negate, flag) {
                    negate = !!negate;
                    return flags[flag] !== negate ? flag + ' ' : '';
                }));

                var args = Array.prototype.slice.call(arguments, 2);
                nestingLevel += 1;
                try {
                    that.expect.apply(that, [subject, testDescriptionString].concat(args));
                    nestingLevel -= 1;
                } catch (e) {
                    nestingLevel -= 1;
                    if (e._isUnexpected) {
                        truncateStack(e, wrappedExpect);
                        if (nestingLevel === 0) {
                            handleNestedExpects(e, assertion);
                        }
                    }
                    throw e;
                }
            };

            // Not sure this is the right way to go about this:
            wrappedExpect.equal = this.equal;
            wrappedExpect.types = this.types;
            wrappedExpect.sanitize = this.sanitize;
            wrappedExpect.inspect = this.inspect;

            var args = Array.prototype.slice.call(arguments, 2);
            args.unshift(wrappedExpect, subject);
            var assertion = new Assertion(wrappedExpect, subject, testDescriptionString, flags, args.slice(2));
            var handler = assertionRule.handler;
            try {
                handler.apply(assertion, args);
            } catch (e) {
                if (e._isUnexpected) {
                    truncateStack(e, this.expect);
                }
                throw e;
            }
        } else {
            var similarAssertions = this.findAssertionSimilarTo(testDescriptionString);
            var message =
                'Unknown assertion "' + testDescriptionString + '", ' +
                'did you mean: "' + similarAssertions[0] + '"';
            var err = new Error(message);
            truncateStack(err, this.expect);
            throw err;
        }
    };

    Unexpected.prototype.toString = function () {
        return getKeys(this.assertions).sort().join('\n');
    };

    Unexpected.prototype.clone = function () {
        var unexpected = new Unexpected(extend({}, this.assertions), [].concat(this.types));
        return makeExpectFunction(unexpected);
    };

    Unexpected.create = function () {
        var unexpected = new Unexpected();
        return makeExpectFunction(unexpected);
    };

    var expandPattern = (function () {
        function isFlag(token) {
            return token.slice(0, 1) === '[' && token.slice(-1) === ']';
        }
        function isAlternation(token) {
            return token.slice(0, 1) === '(' && token.slice(-1) === ')';
        }
        function removeEmptyStrings(texts) {
            return filter(texts, function (text) {
                return text !== '';
            });
        }
        function createPermutations(tokens, index) {
            if (index === tokens.length) {
                return [{ text: '', flags: {}}];
            }

            var token = tokens[index];
            var tail = createPermutations(tokens, index + 1);
            if (isFlag(token)) {
                var flag = token.slice(1, -1);
                return map(tail, function (pattern) {
                    var flags = {};
                    flags[flag] = true;
                    return {
                        text: flag + ' ' + pattern.text,
                        flags: extend(flags, pattern.flags)
                    };
                }).concat(map(tail, function (pattern) {
                    var flags = {};
                    flags[flag] = false;
                    return {
                        text: pattern.text,
                        flags: extend(flags, pattern.flags)
                    };
                }));
            } else if (isAlternation(token)) {
                var alternations = token.split(/\(|\)|\|/);
                alternations = removeEmptyStrings(alternations);
                return reduce(alternations, function (result, alternation) {
                    return result.concat(map(tail, function (pattern) {
                        return {
                            text: alternation + pattern.text,
                            flags: pattern.flags
                        };
                    }));
                }, []);
            } else {
                return map(tail, function (pattern) {
                    return {
                        text: token + pattern.text,
                        flags: pattern.flags
                    };
                });
            }
        }
        return function (pattern) {
            pattern = pattern.replace(/(\[[^\]]+\]) ?/g, '$1');
            var splitRegex = /\[[^\]]+\]|\([^\)]+\)/g;
            var tokens = [];
            var m;
            var lastIndex = 0;
            while ((m = splitRegex.exec(pattern))) {
                tokens.push(pattern.slice(lastIndex, m.index));
                tokens.push(pattern.slice(m.index, splitRegex.lastIndex));
                lastIndex = splitRegex.lastIndex;
            }
            tokens.push(pattern.slice(lastIndex));

            tokens = removeEmptyStrings(tokens);
            var permutations = createPermutations(tokens, 0);
            forEach(permutations, function (permutation) {
                permutation.text = trim(permutation.text);
                if (permutation.text === '') {
                    // This can only happen if the pattern only contains flags
                    throw new Error("Assertion patterns must not only contain flags");
                }
            });
            return permutations;
        };
    }());


    function ensureValidUseOfParenthesesOrBrackets(pattern) {
        var counts = {
            '[': 0,
            ']': 0,
            '(': 0,
            ')': 0
        };
        for (var i = 0; i < pattern.length; i += 1) {
            var c = pattern.charAt(i);
            if (c in counts) {
                counts[c] += 1;
            }
            if (c === ']' && counts['['] >= counts[']']) {
                if (counts['['] === counts[']'] + 1) {
                    throw new Error("Assertion patterns must not contain flags with brackets: '" + pattern + "'");
                }

                if (counts['('] !== counts[')']) {
                    throw new Error("Assertion patterns must not contain flags with parentheses: '" + pattern + "'");
                }

                if (pattern.charAt(i - 1) === '[') {
                    throw new Error("Assertion patterns must not contain empty flags: '" + pattern + "'");
                }
            } else if (c === ')' && counts['('] >= counts[')']) {
                if (counts['('] === counts[')'] + 1) {
                    throw new Error("Assertion patterns must not contain alternations with parentheses: '" + pattern + "'");
                }

                if (counts['['] !== counts[']']) {
                    throw new Error("Assertion patterns must not contain alternations with brackets: '" + pattern + "'");
                }
            }

            if ((c === ')' || c === '|') && counts['('] >= counts[')']) {
                if (pattern.charAt(i - 1) === '(' || pattern.charAt(i - 1) === '|') {
                    throw new Error("Assertion patterns must not contain empty alternations: '" + pattern + "'");
                }
            }
        }

        if (counts['['] !== counts[']']) {
            throw new Error("Assertion patterns must not contain unbalanced brackets: '" + pattern + "'");
        }

        if (counts['('] !== counts[')']) {
            throw new Error("Assertion patterns must not contain unbalanced parentheses: '" + pattern + "'");
        }
    }

    function ensureValidPattern(pattern) {
        if (typeof pattern !== 'string' || pattern === '') {
            throw new Error("Assertion patterns must be a non empty string");
        }
        if (pattern.match(/^\s|\s$/)) {
            throw new Error("Assertion patterns can't start or end with whitespace");
        }

        ensureValidUseOfParenthesesOrBrackets(pattern);
    }

    namespace.expect = Unexpected.create();
}());
