/*global window*/
var Assertion = require('./Assertion');
var utils = require('./utils');
var magicpen = require('magicpen');
var truncateStack = utils.truncateStack;
var extend = utils.extend;
var leven = require('leven');
var cloneError = utils.cloneError;

var anyType = {
    name: 'any',
    identify: function () {
        return true;
    },
    equal: function (a, b) {
        return a === b;
    },
    inspect: function (value, depth, output) {
        return output.text(value);
    },
    diff: function (actual, expected, output, diff, inspect) {
        return null;
    },
    is: function (typeOrTypeName) {
        var typeName;
        if (typeof typeOrTypeName === 'string') {
            typeName = typeOrTypeName;
        } else {
            typeName = typeOrTypeName.name;
        }
        if (this.name === typeName) {
            return true;
        } else if (this.baseType) {
            return this.baseType.is(typeName);
        } else {
            return false;
        }
    }
};

function Unexpected(options) {
    options = options || {};
    this.assertions = options.assertions || {any: {}};
    this.typeByName = options.typeByName || {};
    this.types = options.types || [anyType];
    this.output = options.output || magicpen();
    this._outputFormat = options.format || magicpen.defaultFormat;
}

function createExpectIt(expect, expectations) {
    function expectIt(subject) {
        var failed = false;
        var evaluations = expectations.map(function (expectation) {
            var args = Array.prototype.slice.call(expectation);
            args.unshift(subject);
            var evaluation = { expectation: args };
            if (!failed) {
                evaluation.evaluated = true;
                try {
                    expect.apply(expect, args);
                } catch (e) {
                    if (!e._isUnexpected) {
                        throw e;
                    }
                    failed = true;
                    evaluation.failure = e;
                }
            }

            return evaluation;
        });

        if (failed) {
            expect.fail(function (output) {
                evaluations.forEach(function (evaluation, index) {
                    if (index > 0) {
                        output.comment(' and').nl();
                    }

                    if (evaluation.failure) {
                        output.error('⨯ ').append(evaluation.failure.output);
                    } else {
                        var style = evaluation.evaluated ? 'success' : 'text';
                        var expectation = evaluation.expectation;
                        if (evaluation.evaluated) {
                            output.success('✓ ');
                        } else {
                            output.sp(2);
                        }

                        output[style]('expected ');
                        output.text(expect.inspect(expectation[0])).sp();
                        output[style](expectation[1]);
                        expectation.slice(2).forEach(function (v) {
                            output.sp().append(expect.inspect(v));
                        });
                    }
                });
            });
        }
    }
    expectIt._expectIt = true;
    expectIt._expectations = expectations;
    expectIt.and = function () {
        var copiedExpectations = expectations.slice();
        copiedExpectations.push(arguments);
        return createExpectIt(expect, copiedExpectations);
    };
    return expectIt;
}

Unexpected.prototype.it = function () { // ...
    return createExpectIt(this.expect, [arguments]);
};

Unexpected.prototype.equal = function (actual, expected, depth, seen) {
    var that = this;

    depth = depth || 0;
    if (depth > 500) {
        // detect recursive loops in the structure
        seen = seen || [];
        if (seen.indexOf(actual) !== -1) {
            throw new Error('Cannot compare circular structures');
        }
        seen.push(actual);
    }

    return this.findTypeOf(actual, expected).equal(actual, expected, function (a, b) {
        return that.equal(a, b, depth + 1, seen);
    });
};

Unexpected.prototype.findTypeOf = function () { // ...
    var objs = Array.prototype.slice.call(arguments);
    return utils.findFirst(this.types || [], function (type) {
        return objs.every(function (obj) {
            return type.identify(obj);
        });
    });
};

Unexpected.prototype.inspect = function (obj, depth) {
    var seen = [];
    var that = this;
    var printOutput = function (obj, currentDepth, output) {
        if (currentDepth === 0 && typeof obj === 'object') {
            return output.text('...');
        }

        seen = seen || [];
        if (seen.indexOf(obj) !== -1) {
            return output.text('[Circular]');
        }

        return that.findTypeOf(obj).inspect(obj, currentDepth, output, function (v, childDepth) {
            seen.push(obj);
            if (typeof childDepth === 'undefined') {
                childDepth = currentDepth - 1;
            }
            return printOutput(v, childDepth, output.clone());
        });
    };

    return printOutput(obj, depth || 3, this.output.clone());
};

var placeholderSplitRegexp = /(\{(?:\d+)\})/g;
var placeholderRegexp = /\{(\d+)\}/;
Unexpected.prototype.fail = function (arg) {
    if (utils.isError(arg)) {
        throw arg;
    }
    var output = this.output.clone();
    if (typeof arg === 'function') {
        arg.call(this, output);
    } else {
        var message = arg || "explicit failure";
        var args = Array.prototype.slice.call(arguments, 1);
        var tokens = message.split(placeholderSplitRegexp);
        tokens.forEach(function (token) {
            var match = placeholderRegexp.exec(token);
            if (match) {
                var index = match[1];
                var placeholderArg = index in args ?  args[index] : match[0];
                if (placeholderArg.isMagicPen) {
                    output.append(placeholderArg);
                } else {
                    output.text(placeholderArg);
                }
            } else {
                output.text(token);
            }
        });
    }

    var error = new Error();
    error._isUnexpected = true;
    error.output = output;
    this.setErrorMessage(error);
    throw error;
};

// addAssertion(pattern, handler)
// addAssertion([pattern, ...]], handler)
// addAssertion(typeName, pattern, handler)
// addAssertion([typeName, ...], pattern, handler)
// addAssertion([typeName, ...], [pattern, pattern...], handler)
Unexpected.prototype.addAssertion = function (types, patterns, handler) {
    if (arguments.length !== 2 && arguments.length !== 3) {
        throw new Error('addAssertion: Needs 2 or 3 arguments');
    }
    if (typeof patterns === 'function') {
        handler = patterns;
        patterns = types;
        types = [anyType];
    } else {
        var typeByName = this.typeByName;
        // Normalize to an array of types, but allow types to be specified by name:
        types = (Array.isArray(types) ? types : [types]).map(function (type) {
            if (typeof type === 'string') {
                if (type in typeByName) {
                    return typeByName[type];
                } else {
                    throw new Error('No such type: ' + type);
                }
            } else {
                return type;
            }
        });
    }
    patterns = utils.isArray(patterns) ? patterns : [patterns];
    var assertions = this.assertions;
    types.forEach(function (type) {
        var typeName = type.name;
        var assertionsForType = assertions[typeName];
        if (!assertionsForType) {
            throw new Error('No such type: ' + typeName);
        }
        var isSeenByExpandedPattern = {};
        patterns.forEach(function (pattern) {
            ensureValidPattern(pattern);
            expandPattern(pattern).forEach(function (expandedPattern) {
                if (expandedPattern.text in assertionsForType) {
                    if (!isSeenByExpandedPattern[expandedPattern.text]) {
                        throw new Error('Cannot redefine assertion: ' + expandedPattern.text + (typeName === 'any' ? '' : ' for type ' + typeName));
                    }
                } else {
                    isSeenByExpandedPattern[expandedPattern.text] = true;
                    assertionsForType[expandedPattern.text] = {
                        handler: handler,
                        flags: expandedPattern.flags,
                        alternations: expandedPattern.alternations
                    };
                }
            });
        });
    });

    return this.expect; // for chaining
};

Unexpected.prototype.getType = function (typeName) {
    return utils.findFirst(this.typeNames, function (type) {
        return type.name === typeName;
    });
};

Unexpected.prototype.addType = function (type) {
    var baseType;
    if (typeof type.name !== 'string' || type.name.trim() === '') {
        throw new Error('A type must be given a non-empty name');
    }

    this.assertions[type.name] = {};
    this.typeByName[type.name] = type;

    if (type.base) {
        baseType = utils.findFirst(this.types, function (t) {
            return t.name === type.base;
        });

        if (!baseType) {
            throw new Error('Unknown base type: ' + type.base);
        }
    } else {
        baseType = anyType;
    }


    var extendedType = extend({}, baseType, type, { baseType: baseType });
    var inspect = extendedType.inspect;

    extendedType.inspect = function () {
        if (arguments.length < 2) {
            return 'type: ' + type.name;
        } else {
            return inspect.apply(this, arguments);
        }
    };
    if (extendedType.identify === false) {
        extendedType.identify = function () {
            return false;
        };
        this.types.push(extendedType);
    } else {
        this.types.unshift(extendedType);
    }

    return this.expect;
};

Unexpected.prototype.installPlugin = function (plugin) {
    if (typeof plugin !== 'function') {
        throw new Error('Expected first argument given to installPlugin to be a function');
    }

    plugin(this.expect);

    return this.expect; // for chaining
};

function errorWithMessage(e, message) {
    var newError = cloneError(e);
    newError.output = message;
    return newError;
}

function buildDiff(expect, err) {
    return err.createDiff && err.createDiff(expect.output.clone(), function (actual, expected) {
        return expect.diff(actual, expected);
    }, function (v, depth) {
        return expect.inspect(v, depth || Infinity);
    }, function (actual, expected) {
        return expect.equal(actual, expected);
    });
}

function handleNestedExpects(expect, e, assertion) {
    switch (assertion.errorMode) {
    case 'nested':
        var newError = errorWithMessage(e, assertion.standardErrorMessage().nl()
                                        .indentLines()
                                        .i().block(e.output));
        delete newError.createDiff;
        return newError;
    case 'default':
        return errorWithMessage(e, assertion.standardErrorMessage());
    case 'bubble':
        return errorWithMessage(e, e.output);
    case 'diff':
        return errorWithMessage(e, e.output.clone().append(function (output) {
            var comparison = buildDiff(expect, e);
            delete e.createDiff;

            if (comparison && comparison.diff) {
                output.append(comparison.diff);
            } else {
                output.append(e.output);
            }
        }));
    default:
        throw new Error("Unknown error mode: '" + assertion.errorMode + "'");
    }
}

function installExpectMethods(unexpected, expectFunction) {
    var expect = expectFunction.bind(unexpected);
    expect.it = unexpected.it.bind(unexpected);
    expect.equal = unexpected.equal.bind(unexpected);
    expect.inspect = unexpected.inspect.bind(unexpected);
    expect.findTypeOf = unexpected.findTypeOf.bind(unexpected);
    expect.fail = unexpected.fail.bind(unexpected);
    expect.diff = unexpected.diff.bind(unexpected);
    expect.addAssertion = unexpected.addAssertion.bind(unexpected);
    expect.addType = unexpected.addType.bind(unexpected);
    expect.clone = unexpected.clone.bind(unexpected);
    expect.toString = unexpected.toString.bind(unexpected);
    expect.assertions = unexpected.assertions;
    expect.installPlugin = unexpected.installPlugin.bind(unexpected);
    expect.output = unexpected.output;
    expect.outputFormat = unexpected.outputFormat.bind(unexpected);
    return expect;
}

function makeExpectFunction(unexpected) {
    var expect = installExpectMethods(unexpected, unexpected.expect);
    unexpected.expect = expect;
    return expect;
}

Unexpected.prototype.setErrorMessage = function (err) {
    var outputFormat = this.outputFormat();
    var message = err.output.clone().append(err.output);

    var comparison = buildDiff(this.expect, err);
    if (comparison) {
        message.nl(2).append(comparison.diff);
    }

    if (outputFormat === 'html') {
        outputFormat = typeof window !== 'undefined' && window.mochaPhantomJS ? 'ansi' : 'text';
        err.htmlMessage = message.toString('html');
    }
    err.output = message;
    err.message = '\n' + message.toString(outputFormat);
};

Unexpected.prototype.expect = function expect(subject, testDescriptionString) {
    var that = this;
    if (arguments.length < 2) {
        throw new Error('The expect function requires at least two parameters.');
    }
    if (typeof testDescriptionString !== 'string') {
        throw new Error('The expect function requires the second parameter to be a string.');
    }
    var matchingType = this.findTypeOf(subject);
    var typeWithAssertion = matchingType;
    var assertionRule = this.assertions[typeWithAssertion.name][testDescriptionString];
    while (!assertionRule && typeWithAssertion !== anyType) {
        // FIXME: Detect cycles?
        typeWithAssertion = typeWithAssertion.baseType;
        assertionRule = this.assertions[typeWithAssertion.name][testDescriptionString];
    }
    if (assertionRule) {
        var flags = extend({}, assertionRule.flags);

        var nestingLevel = 0;
        var callInNestedContext = function (callback) {
            nestingLevel += 1;
            try {
                callback();
                nestingLevel -= 1;
            } catch (e) {
                nestingLevel -= 1;
                if (e._isUnexpected) {
                    truncateStack(e, wrappedExpect);
                    if (nestingLevel === 0) {
                        var wrappedError = handleNestedExpects(wrappedExpect, e, assertion);
                        that.setErrorMessage(wrappedError);
                        throw wrappedError;
                    }
                }
                throw e;
            }
        };

        var wrappedExpect = function wrappedExpect(subject, testDescriptionString) {
            testDescriptionString = testDescriptionString.replace(/\[(!?)([^\]]+)\] ?/g, function (match, negate, flag) {
                return Boolean(flags[flag]) !== Boolean(negate) ? flag + ' ' : '';
            }).trim();

            var args = Array.prototype.slice.call(arguments, 2);
            callInNestedContext(function () {
                that.expect.apply(that, [subject, testDescriptionString].concat(args));
            });
        };

        // Not sure this is the right way to go about this:
        wrappedExpect.equal = this.equal;
        wrappedExpect.types = this.types;
        wrappedExpect.inspect = this.inspect;
        wrappedExpect.diff = this.diff;
        wrappedExpect.findTypeOf = this.findTypeOf;
        wrappedExpect.output = this.output;
        wrappedExpect.outputFormat = this.outputFormat;
        wrappedExpect.fail = function () {
            var args = arguments;
            callInNestedContext(function () {
                that.fail.apply(that, args);
            });
        };
        wrappedExpect.format = this.format;

        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(wrappedExpect, subject);
        var assertion = new Assertion(wrappedExpect, subject, testDescriptionString,
                                      flags, assertionRule.alternations, args.slice(2));
        var handler = assertionRule.handler;
        try {
            handler.apply(assertion, args);
        } catch (e) {
            var err = e;
            if (err._isUnexpected) {
                truncateStack(err, this.expect);
            }
            throw err;
        }
    } else {
        var errorMessage;
        var definedForIncompatibleTypes = this.types.filter(function (type) {
            return this.assertions[type.name][testDescriptionString];
        }, this);
        if (definedForIncompatibleTypes.length > 0) {
            errorMessage =
                'The assertion "' + testDescriptionString + '" is not defined for the type "' + matchingType.name +
                '", but it is defined for ';
            if (definedForIncompatibleTypes.length === 1) {
                errorMessage += 'the type "' + definedForIncompatibleTypes[0].name + '"';
            } else {
                errorMessage += 'these types: ' + definedForIncompatibleTypes.map(function (incompatibleType) {
                    return '"' + incompatibleType.name + '"';
                }).join(', ');
            }
        } else {
            var assertionsWithScore = [];
            var bonusForNextMatchingType = 0;
            [].concat(this.types).reverse().forEach(function (type) {
                var typeMatchBonus = 0;
                if (type.identify(subject)) {
                    typeMatchBonus = bonusForNextMatchingType;
                    bonusForNextMatchingType += 0.9;
                }
                Object.keys(this.assertions[type.name]).forEach(function (assertion) {
                    assertionsWithScore.push({
                        type: type,
                        assertion: assertion,
                        score: typeMatchBonus - leven(testDescriptionString, assertion)
                    });
                });
            }, this);
            assertionsWithScore.sort(function (a, b) {
                return b.score - a.score;
            });
            errorMessage =
                'Unknown assertion "' + testDescriptionString + '", ' +
                'did you mean: "' + assertionsWithScore[0].assertion + '"';
        }

        throw truncateStack(new Error(errorMessage), this.expect);
    }
};

Unexpected.prototype.diff = function (a, b) {
    var output = this.output.clone();
    var that = this;
    return this.findTypeOf(a, b).diff(a, b, output, function (actual, expected) {
        return that.diff(actual, expected);
    }, function (v, depth) {
        return that.inspect(v, depth || Infinity);
    }, function (actual, expected) {
        return that.equal(actual, expected);
    });
};

Unexpected.prototype.toString = function () {
    var assertions = this.assertions;
    var isSeenByExpandedPattern = {};
    Object.keys(assertions).forEach(function (typeName) {
        Object.keys(assertions[typeName]).forEach(function (expandedPattern) {
            isSeenByExpandedPattern[expandedPattern] = true;
        });
    }, this);
    return Object.keys(isSeenByExpandedPattern).sort().join('\n');
};

Unexpected.prototype.clone = function () {
    var clonedAssertions = {};
    Object.keys(this.assertions).forEach(function (typeName) {
        clonedAssertions[typeName] = extend({}, this.assertions[typeName]);
    }, this);
    var unexpected = new Unexpected({
        assertions: clonedAssertions,
        types: [].concat(this.types),
        typeByName: extend({}, this.typeByName),
        output: this.output.clone(),
        format: this.outputFormat()
    });
    return makeExpectFunction(unexpected);
};

Unexpected.prototype.outputFormat = function (format) {
    if (typeof format === 'undefined') {
        return this._outputFormat;
    } else {
        this._outputFormat = format;
        return this;
    }
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
        return texts.filter(function (text) {
            return text !== '';
        });
    }
    function createPermutations(tokens, index) {
        if (index === tokens.length) {
            return [{ text: '', flags: {}, alternations: [] }];
        }

        var token = tokens[index];
        var tail = createPermutations(tokens, index + 1);
        if (isFlag(token)) {
            var flag = token.slice(1, -1);
            return tail.map(function (pattern) {
                var flags = {};
                flags[flag] = true;
                return {
                    text: flag + ' ' + pattern.text,
                    flags: extend(flags, pattern.flags),
                    alternations: pattern.alternations
                };
            }).concat(tail.map(function (pattern) {
                var flags = {};
                flags[flag] = false;
                return {
                    text: pattern.text,
                    flags: extend(flags, pattern.flags),
                    alternations: pattern.alternations
                };
            }));
        } else if (isAlternation(token)) {
            return token
                .substr(1, token.length - 2) // Remove parentheses
                .split(/\|/)
                .reduce(function (result, alternation) {
                    return result.concat(tail.map(function (pattern) {
                        return {
                            text: alternation + pattern.text,
                            flags: pattern.flags,
                            alternations: [alternation].concat(pattern.alternations)
                        };
                    }));
                }, []);
        } else {
            return tail.map(function (pattern) {
                return {
                    text: token + pattern.text,
                    flags: pattern.flags,
                    alternations: pattern.alternations
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
        permutations.forEach(function (permutation) {
            permutation.text = permutation.text.trim();
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

module.exports = Unexpected;
