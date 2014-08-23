var Assertion = require('./Assertion');
var shim = require('./shim');
var utils = require('./utils');
var magicpen = require('magicpen');
var bind = shim.bind;
var forEach = shim.forEach;
var filter = shim.filter;
var map = shim.map;
var trim = shim.trim;
var reduce = shim.reduce;
var getKeys = shim.getKeys;
var indexOf = shim.indexOf;
var truncateStack = utils.truncateStack;
var extend = utils.extend;
var levenshteinDistance = utils.levenshteinDistance;
var isArray = utils.isArray;

var anyType = {
    name: 'any',
    identify: function (value) {
        return true;
    },
    equal: function (a, b) {
        return a === b;
    },
    inspect: function (output, value) {
        return output.text(value);
    },
    toJSON: function (value) {
        return value;
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

    var matchingType = utils.findFirst(this.types || [], function (type) {
        return type.identify(actual) && type.identify(expected);
    });

    if (matchingType) {
        return matchingType.equal(actual, expected, function (a, b) {
            return that.equal(a, b, depth + 1, seen);
        });
    }

    return false; // we should never get there
};

Unexpected.prototype.inspect = function (obj, depth) {
    var types = this.types;
    var seen = [];
    var printOutput = function (output, obj, depth) {
        if (depth === 0) {
            return output.text('...');
        }

        seen = seen || [];
        if (indexOf(seen, obj) !== -1) {
            return output.text('[Circular]');
        }

        var matchingType = utils.findFirst(types || [], function (type) {
            return type.identify(obj);
        });

        if (matchingType) {
            return matchingType.inspect(output, obj, function (output, v) {
                seen.push(obj);
                return printOutput(output, v, depth - 1);
            }, depth);
        } else {
            return output;
        }
    };

    return printOutput(this.output.clone(), obj, depth || 3);
};

var placeholderSplitRegexp = /(\{(?:\d+)\})/g;
var placeholderRegexp = /\{(\d+)\}/;
Unexpected.prototype.fail = function (arg) {
    var output = this.output.clone();
    if (typeof arg === 'function') {
        arg.call(this, output);
    } else {
        var message = arg || "explicit failure";
        var args = Array.prototype.slice.call(arguments, 1);
        var tokens = message.split(placeholderSplitRegexp);
        forEach(tokens, function (token) {
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
    this.serializeOutputToMessage(error);
    throw error;
};

Unexpected.prototype.findAssertionSimilarTo = function (text, type) {
    var editDistances = [];
    while (type) {
        forEach(getKeys(this.assertions[type.name]), function (assertion) {
            var distance = levenshteinDistance(text, assertion);
            editDistances.push({
                type: type,
                assertion: assertion,
                distance: distance
            });
        });
        type = type.baseType;
    }
    editDistances.sort(function (x, y) {
        return x.distance - y.distance;
    });
    return map(editDistances.slice(0, 5), function (editDistance) {
        return editDistance.assertion;
    });
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
        types = map(utils.isArray(types) ? types : [types], function (type) {
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
    forEach(types, function (type) {
        var typeName = type.name;
        var assertionsForType = assertions[typeName];
        if (!assertionsForType) {
            throw new Error('No such type: ' + typeName);
        }
        var isSeenByExpandedPattern = {};
        forEach(patterns, function (pattern) {
            ensureValidPattern(pattern);
            forEach(expandPattern(pattern), function (expandedPattern) {
                if (expandedPattern.text in assertionsForType) {
                    if (!isSeenByExpandedPattern[expandedPattern.text]) {
                        throw new Error('Cannot redefine assertion: ' + expandedPattern.text + (typeName === 'any' ? '' : ' for type ' + typeName));
                    }
                } else {
                    isSeenByExpandedPattern[expandedPattern.text] = true;
                    assertionsForType[expandedPattern.text] = {
                        handler: handler,
                        flags: expandedPattern.flags
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
    if (typeof type.name !== 'string' || trim(type.name) === '') {
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

    this.types.unshift(extend({}, baseType, type, { baseType: baseType }));

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
    var that = this;
    stack = stack || [];

    var i;
    for (i = 0 ; i < stack.length ; i += 1) {
        if (stack[i] === obj) {
            return obj;
        }
    }

    stack.push(obj);

    var sanitized,
        matchingType = utils.findFirst(this.types || [], function (type) {
            return type.identify(obj);
        });
    if (matchingType) {
        sanitized = matchingType.toJSON(obj, function (v) {
            return that.sanitize(v, stack);
        });
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

var errorMethodBlacklist = reduce(['message', 'line', 'sourceId', 'sourceURL', 'stack', 'stackArray'], function (result, prop) {
    result[prop] = true;
    return result;
}, {});

function errorWithMessage(e, message) {
    var newError = new Error();
    forEach(getKeys(e), function (key) {
        if (!errorMethodBlacklist[key]) {
            newError[key] = e[key];
        }
    });
    newError.output = message;
    return newError;
}

function handleNestedExpects(e, assertion) {
    switch (assertion.errorMode) {
    case 'nested':
        return errorWithMessage(e, assertion.standardErrorMessage().nl()
                                .indentLines()
                                .i().block(e.output));
    case 'default':
        return errorWithMessage(e, assertion.standardErrorMessage());
    case 'bubble':
        return errorWithMessage(e, e.output);
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
    expect.output = unexpected.output;
    expect.outputFormat = bind(unexpected.outputFormat, unexpected);
    return expect;
}

function makeExpectFunction(unexpected) {
    var expect = installExpectMethods(unexpected, unexpected.expect);
    unexpected.expect = expect;
    return expect;
}

Unexpected.prototype.serializeOutputToMessage = function (err) {
    var outputFormat = this.outputFormat();
    if (outputFormat === 'html') {
        outputFormat = 'text';
        err.htmlMessage = err.output.toString('html');
    }
    err.message = err.output.toString(outputFormat);
};

Unexpected.prototype.expect = function expect(subject, testDescriptionString) {
    var that = this;
    if (arguments.length < 2) {
        throw new Error('The expect functions requires at least two parameters.');
    }
    if (typeof testDescriptionString !== 'string') {
        throw new Error('The expect functions requires second parameter to be a string.');
    }
    var matchingType = utils.findFirst(this.types || [], function (type) {
        return type.identify(subject);
    });

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
                        var wrappedError = handleNestedExpects(e, assertion);
                        that.serializeOutputToMessage(wrappedError);
                        throw wrappedError;
                    }
                }
                throw e;
            }
        };

        var wrappedExpect = function wrappedExpect(subject, testDescriptionString) {
            testDescriptionString = trim(testDescriptionString.replace(/\[(!?)([^\]]+)\] ?/g, function (match, negate, flag) {
                return Boolean(flags[flag]) !== Boolean(negate) ? flag + ' ' : '';
            }));

            var args = Array.prototype.slice.call(arguments, 2);
            callInNestedContext(function () {
                that.expect.apply(that, [subject, testDescriptionString].concat(args));
            });
        };

        // Not sure this is the right way to go about this:
        wrappedExpect.equal = this.equal;
        wrappedExpect.types = this.types;
        wrappedExpect.sanitize = this.sanitize;
        wrappedExpect.inspect = this.inspect;
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
        var assertion = new Assertion(wrappedExpect, subject, testDescriptionString, flags, args.slice(2));
        var handler = assertionRule.handler;
        try {
            handler.apply(assertion, args);
        } catch (e) {
            var err = e;
            if (err._isUnexpected) {
                err = errorWithMessage(err, err.output);
                that.serializeOutputToMessage(err);
                truncateStack(err, this.expect);
            }
            throw err;
        }
    } else {
        var similarAssertions = this.findAssertionSimilarTo(testDescriptionString, matchingType);
        var message =
            'Unknown assertion "' + testDescriptionString + '", ' +
            'did you mean: "' + similarAssertions[0] + '"';
        var err = new Error(message);
        truncateStack(err, this.expect);
        throw err;
    }
};

Unexpected.prototype.toString = function () {
    var assertions = this.assertions;
    var isSeenByExpandedPattern = {};
    forEach(getKeys(assertions), function (typeName) {
        forEach(getKeys(assertions[typeName]), function (expandedPattern) {
            isSeenByExpandedPattern[expandedPattern] = true;
        });
    }, this);
    return getKeys(isSeenByExpandedPattern).sort().join('\n');
};

Unexpected.prototype.clone = function () {
    var clonedAssertions = {};
    forEach(getKeys(this.assertions), function (typeName) {
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

module.exports = Unexpected;
