/*!
 * Copyright (c) 2013 Sune Simonsen <sune@we-knowhow.dk>
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the 'Software'), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),(o.weknowhow||(o.weknowhow={})).expect=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var createStandardErrorMessage = require(4);

function Assertion(expect, subject, testDescription, flags, alternations, args) {
    this.expect = expect;
    this.subject = subject;
    this.testDescription = testDescription;
    this.flags = flags;
    this.alternations = alternations;
    this.args = args;
    this.errorMode = 'default';
}

Assertion.prototype.standardErrorMessage = function () {
    return createStandardErrorMessage(this.expect, this.subject, this.testDescription, this.args);
};

Assertion.prototype.shift = function (expect, subject, assertionIndex) {
    var rest = this.args.slice(assertionIndex);
    this.args[assertionIndex] = expect.output.clone().error(this.args[assertionIndex]);
    if (typeof rest[0] === 'function') {
        rest[0](subject);
    } else {
        expect.apply(expect, [subject].concat(rest));
    }
};

Assertion.prototype.throwStandardError = function () {
    var err = new Error();
    err.output = this.standardErrorMessage();
    err._isUnexpected = true;
    throw err;
};

module.exports = Assertion;

},{}],2:[function(require,module,exports){
/*global setTimeout*/
var Assertion = require(1);
var createStandardErrorMessage = require(4);
var utils = require(7);
var magicpen = require(21);
var truncateStack = utils.truncateStack;
var extend = utils.extend;
var leven = require(17);
var cloneError = utils.cloneError;

var anyType = {
    name: 'any',
    identify: function () {
        return true;
    },
    equal: utils.objectIs,
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
    this.installedPlugins = options.installedPlugins || [];
    this.nestingLevel = 0;
}

var OR = {};
function getOrGroups(expectations) {
    var orGroups = [[]];
    expectations.forEach(function (expectation) {
        if (expectation === OR) {
            orGroups.push([]);
        } else {
            orGroups[orGroups.length - 1].push(expectation);
        }
    });
    return orGroups;
}

function evaluateGroup(expect, subject, orGroup) {
    var failedGroup = false;
    return orGroup.map(function (expectation) {
        var args = Array.prototype.slice.call(expectation);
        args.unshift(subject);
        var evaluation = { expectation: args };
        if (!failedGroup) {
            evaluation.evaluated = true;
            try {
                expect.apply(expect, args);
            } catch (e) {
                if (!e._isUnexpected) {
                    throw e;
                }
                failedGroup = true;
                evaluation.failure = e;
            }
        }

        return evaluation;
    });
}

function writeGroupEvaluationsToOutput(expect, output, groupEvaluations) {
    var hasOrClauses = groupEvaluations.length > 1;
    var hasAndClauses = groupEvaluations.some(function (groupEvaluation) {
        return groupEvaluation.length > 1;
    });
    groupEvaluations.forEach(function (groupEvaluation, i) {
        if (i > 0) {
            if (hasAndClauses) {
                output.nl();
            } else {
                output.sp();
            }
            output.jsComment('or').nl();
        }

        groupEvaluation.forEach(function (evaluation, j) {
            if (j > 0) {
                output.jsComment(' and').nl();
            }

            if (evaluation.failure) {
                if (hasAndClauses || hasOrClauses) {
                    output.error('⨯ ');
                }

                output.block(function (output) {
                    output.append(evaluation.failure.output);
                    if (!evaluation.failure._hasSerializedErrorMessage) {
                        var comparison = buildDiff(expect, evaluation.failure);
                        if (comparison) {
                            output.nl(2).append(comparison.diff);
                        }
                    }
                });
            } else {
                var style = evaluation.evaluated ? 'success' : 'text';
                var expectation = evaluation.expectation;
                if (evaluation.evaluated) {
                    output.success('✓ ');
                } else {
                    output.sp(2);
                }

                output.block(function (output) {
                    output[style]('expected ');
                    output.text(expect.inspect(expectation[0])).sp();
                    output[style](expectation[1]);
                    expectation.slice(2).forEach(function (v) {
                        output.sp().append(expect.inspect(v));
                    });
                });
            }
        });
    });
}

function createExpectIt(expect, expectations) {
    var orGroups = getOrGroups(expectations);

    function expectIt(subject) {
        var groupEvaluations = orGroups.map(function (orGroup) {
            return evaluateGroup(expect, subject, orGroup);
        });

        var failed = groupEvaluations.every(function (groupEvaluation) {
            return groupEvaluation.some(function (evaluation) {
                return evaluation.failure;
            });
        });

        if (failed) {
            expect.fail(function (output) {
                writeGroupEvaluationsToOutput(expect, output, groupEvaluations);
            });
        }
    }
    expectIt._expectIt = true;
    expectIt._expectations = expectations;
    expectIt._OR = OR;
    expectIt.and = function () {
        var copiedExpectations = expectations.slice();
        copiedExpectations.push(arguments);
        return createExpectIt(expect, copiedExpectations);
    };
    expectIt.or = function () {
        var copiedExpectations = expectations.slice();
        copiedExpectations.push(OR, arguments);
        return createExpectIt(expect, copiedExpectations);
    };
    return expectIt;
}

Unexpected.prototype.it = function () { // ...
    return createExpectIt(this.expect, [arguments]);
};

Unexpected.prototype.equal = function (actual, expected, depth, seen) {
    var that = this;

    depth = typeof depth === 'number' ? depth : 500;
    if (depth <= 0) {
        // detect recursive loops in the structure
        seen = seen || [];
        if (seen.indexOf(actual) !== -1) {
            throw new Error('Cannot compare circular structures');
        }
        seen.push(actual);
    }

    return this.findTypeOf(actual, expected).equal(actual, expected, function (a, b) {
        return that.equal(a, b, depth - 1, seen);
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
        var objType = that.findTypeOf(obj);
        if (currentDepth === 0 && objType.is('object') && !objType.is('expect.it')) {
            return output.text('...');
        }

        seen = seen || [];
        if (seen.indexOf(obj) !== -1) {
            return output.text('[Circular]');
        }

        return objType.inspect(obj, currentDepth, output, function (v, childDepth) {
            output = output.clone();
            seen.push(obj);
            if (typeof childDepth === 'undefined') {
                childDepth = currentDepth - 1;
            }
            return printOutput(v, childDepth, output) || output;
        });
    };

    var output = this.output.clone();
    return printOutput(obj, depth || 3, output) || output;
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
        var that = this;
        var message = arg ? String(arg) : 'Explicit failure';
        var args = Array.prototype.slice.call(arguments, 1);
        var tokens = message.split(placeholderSplitRegexp);
        tokens.forEach(function (token) {
            var match = placeholderRegexp.exec(token);
            if (match) {
                var index = match[1];
                if (index in args) {
                    var placeholderArg = args[index];
                    if (placeholderArg.isMagicPen) {
                        output.append(placeholderArg);
                    } else {
                        output.append(that.inspect(placeholderArg));
                    }
                } else {
                    output.text(match[0]);
                }

            } else {
                output.error(token);
            }
        });
    }

    var error = new Error();
    error._isUnexpected = true;
    error.output = output;
    if (this.nestingLevel === 0) {
        this.setErrorMessage(error);
    }
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
    var that = this;
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

    var output = this.expect.output;
    var extendedBaseType = Object.create(baseType);
    extendedBaseType.inspect = function (value, depth) {
        return baseType.inspect(value, depth, output.clone(), that.inspect.bind(that));
    };

    extendedBaseType.diff = function (actual, expected) {
        return baseType.diff(actual, expected,
                      output.clone(),
                      that.diff.bind(that),
                      that.inspect.bind(that),
                      that.equal.bind(that));
    };

    extendedBaseType.equal = function (actual, expected) {
        return baseType.equal(actual, expected, that.equal.bind(that));
    };

    var extendedType = extend({}, baseType, type, { baseType: extendedBaseType });
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

Unexpected.prototype.addStyle = function () { // ...
    return this.output.addStyle.apply(this.output, arguments);
};

Unexpected.prototype.installTheme = function () { // ...
    return this.output.installTheme.apply(this.output, arguments);
};

Unexpected.prototype.installPlugin = function (plugin) {
    var alreadyInstalled = this.installedPlugins.some(function (installedPlugin) {
        return installedPlugin === plugin.name;
    });

    if (alreadyInstalled) {
        return this.expect;
    }

    if (typeof plugin !== 'object' ||
        typeof plugin.name !== 'string' ||
        typeof plugin.installInto !== 'function' ||
        (plugin.dependencies && !Array.isArray(plugin.dependencies))) {
        throw new Error('Plugins must adhere to the following interface\n' +
                        '{\n' +
                        '  name: <plugin name>,\n' +
                        '  dependencies: <an optional list of dependencies>,\n' +
                        '  installInto: <a function that will update the given expect instance>\n' +
                        '}');
    }

    if (plugin.dependencies) {
        var installedPlugins = this.installedPlugins;
        var unfulfilledDependencies = plugin.dependencies.filter(function (dependency) {
            return !installedPlugins.some(function (plugin) {
                return plugin === dependency;
            });
        });

        if (unfulfilledDependencies.length === 1) {
            throw new Error(plugin.name + ' requires plugin ' + unfulfilledDependencies[0]);
        } else if (unfulfilledDependencies.length > 1) {
            throw new Error(plugin.name + ' requires plugins ' +
                            unfulfilledDependencies.slice(0, -1).join(', ') +
                            ' and ' + unfulfilledDependencies[unfulfilledDependencies.length - 1]);
        }
    }

    this.installedPlugins.push(plugin.name);
    plugin.installInto(this.expect);

    return this.expect; // for chaining
};

function errorWithMessage(e, message) {
    delete e._hasSerializedErrorMessage;
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
    var errorMode = e.errorMode || assertion.errorMode;
    switch (errorMode) {
    case 'nested':
        var comparison = buildDiff(expect, e);
        var message = assertion.standardErrorMessage().nl()
            .indentLines()
            .i().block(function (output) {
                output.append(e.output);
                if (comparison) {
                    output.nl(2).append(comparison.diff);
                }
            });
        var newError = errorWithMessage(e, message);
        delete newError.createDiff;
        delete newError.label;
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
    expect.addStyle = unexpected.addStyle.bind(unexpected);
    expect.installTheme = unexpected.installTheme.bind(unexpected);
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
    if (!err._hasSerializedErrorMessage) {
        var outputFormat = this.outputFormat();
        var message = err.output.clone().append(err.output);

        var comparison = buildDiff(this.expect, err);
        if (comparison) {
            message.nl(2).append(comparison.diff);
        }
        delete err.createDiff;

        if (outputFormat === 'html') {
            outputFormat = 'text';
            err.htmlMessage = message.toString('html');
        }
        err.output = message;
        err.message = '\n' + message.toString(outputFormat);
        err._hasSerializedErrorMessage = true;
    }
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
    while (!assertionRule && typeWithAssertion.name !== anyType.name) {
        // FIXME: Detect cycles?
        typeWithAssertion = typeWithAssertion.baseType;
        assertionRule = this.assertions[typeWithAssertion.name][testDescriptionString];
    }
    if (assertionRule) {
        var flags = extend({}, assertionRule.flags);

        var callInNestedContext = function (callback) {
            if (that.nestingLevel === 0) {
                setTimeout(function () {
                    that.nestingLevel = 0;
                }, 0);
            }

            that.nestingLevel += 1;
            try {
                callback();
            } catch (e) {
                if (e._isUnexpected) {
                    truncateStack(e, wrappedExpect);
                    var wrappedError = handleNestedExpects(wrappedExpect, e, assertion);
                    if (that.nestingLevel === 1) {
                        that.setErrorMessage(wrappedError);
                    }
                    throw wrappedError;
                }
                throw e;
            } finally {
                that.nestingLevel -= 1;
            }
        };

        var wrappedExpect = function wrappedExpect() {
            var subject = arguments[0];
            var testDescriptionString = arguments[1].replace(/\[(!?)([^\]]+)\] ?/g, function (match, negate, flag) {
                return Boolean(flags[flag]) !== Boolean(negate) ? flag + ' ' : '';
            }).trim();

            var args = new Array(arguments.length - 2);
            for (var i = 0; i < arguments.length - 2; i += 1) {
                args[i] = arguments[i + 2];
            }
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
        wrappedExpect.it = this.it.bind(this);

        var args = Array.prototype.slice.call(arguments, 2);
        var assertion = new Assertion(wrappedExpect, subject, testDescriptionString,
                                      flags, assertionRule.alternations, args);
        var handler = assertionRule.handler;
        try {
            handler.apply(assertion, [wrappedExpect, subject].concat(args));
        } catch (e) {
            var err = e;
            if (err._isUnexpected) {
                truncateStack(err, this.expect);
            }
            throw err;
        }
    } else {
        var errorMessage = this.output.clone();
        var definedForIncompatibleTypes = this.types.filter(function (type) {
            return this.assertions[type.name][testDescriptionString];
        }, this);
        if (definedForIncompatibleTypes.length > 0) {
            errorMessage
                .append(createStandardErrorMessage(this.expect, subject, testDescriptionString, Array.prototype.slice.call(arguments, 2))).nl()
                .indentLines()
                .i().error('The assertion "').jsString(testDescriptionString)
                .error('" is not defined for the type "').jsString(matchingType.name).error('",').nl()
                .i().error('but it is defined for ')
                .outdentLines();
            if (definedForIncompatibleTypes.length === 1) {
                errorMessage.error('the type "').jsString(definedForIncompatibleTypes[0].name).error('"');
            } else {
                errorMessage.error('these types: ');


                definedForIncompatibleTypes.forEach(function (incompatibleType, index) {
                    if (index > 0) {
                        errorMessage.error(', ');
                    }
                    errorMessage.error('"').jsString(incompatibleType.name).error('"');
                });
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
            errorMessage.error('Unknown assertion "').jsString(testDescriptionString)
                .error('", did you mean: "').jsString(assertionsWithScore[0].assertion).error('"');
        }
        var missingAssertionError = new Error();
        missingAssertionError.output = errorMessage;
        missingAssertionError._isUnexpected = true;
        missingAssertionError.errorMode = 'bubble';
        if (that.nestingLevel === 0) {
            this.setErrorMessage(missingAssertionError);
        }
        this.fail(missingAssertionError);
    }
};

Unexpected.prototype.diff = function (a, b, depth, seen) {
    var output = this.output.clone();
    var that = this;

    depth = typeof depth === 'number' ? depth : 500;
    if (depth <= 0) {
        // detect recursive loops in the structure
        seen = seen || [];
        if (seen.indexOf(a) !== -1) {
            throw new Error('Cannot compare circular structures');
        }
        seen.push(a);
    }

    return this.findTypeOf(a, b).diff(a, b, output, function (actual, expected) {
        return that.diff(actual, expected, depth - 1, seen);
    }, function (v, depth) {
        return that.inspect(v, depth || Infinity);
    }, function (actual, expected) {
        return that.equal(actual, expected);
    });
};

Unexpected.prototype.toString = function () {
    var assertions = this.assertions;
    var types = {};
    Object.keys(assertions).forEach(function (typeName) {
        types[typeName] = {};
        Object.keys(assertions[typeName]).forEach(function (expandedPattern) {
            types[typeName][expandedPattern] = true;
        });
    }, this);


    var pen = magicpen();
    Object.keys(types).sort().forEach(function (type) {
        var assertionsForType = Object.keys(types[type]).sort();
        if (assertionsForType.length > 0) {
            pen.text(type + ':').nl();
            pen.indentLines();

            assertionsForType.forEach(function (assertion) {
                pen.i().text(assertion).nl();
            });

            pen.outdentLines();
        }
    });

    return pen.toString();
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
        format: this.outputFormat(),
        installedPlugins: [].concat(this.installedPlugins)
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

},{}],3:[function(require,module,exports){
var utils = require(7);
var objectIs = utils.objectIs;
var isRegExp = utils.isRegExp;
var isArray = utils.isArray;
var extend = utils.extend;

module.exports = function (expect) {
    expect.addAssertion('[not] to be (ok|truthy)', function (expect, subject) {
        var not = !!this.flags.not;
        var condition = !!subject;
        if (condition === not) {
            expect.fail();
        }
    });

    expect.addAssertion('[not] to be', function (expect, subject, value) {
        expect(objectIs(subject, value), '[not] to be truthy');
    });

    expect.addAssertion('string', '[not] to be', function (expect, subject, value) {
        expect(subject, '[not] to equal', value);
    });

    expect.addAssertion('boolean', '[not] to be true', function (expect, subject) {
        expect(subject, '[not] to be', true);
    });

    expect.addAssertion('boolean', '[not] to be false', function (expect, subject) {
        expect(subject, '[not] to be', false);
    });

    expect.addAssertion('[not] to be falsy', function (expect, subject) {
        expect(subject, '[!not] to be truthy');
    });

    expect.addAssertion('[not] to be null', function (expect, subject) {
        expect(subject, '[not] to be', null);
    });

    expect.addAssertion('[not] to be undefined', function (expect, subject) {
        expect(typeof subject === 'undefined', '[not] to be truthy');
    });

    expect.addAssertion('to be defined', function (expect, subject) {
        expect(subject, 'not to be undefined');
    });

    expect.addAssertion(['number', 'NaN'], '[not] to be NaN', function (expect, subject) {
        expect(isNaN(subject), '[not] to be truthy');
    });

    expect.addAssertion('number', '[not] to be close to', function (expect, subject, value, epsilon) {
        this.errorMode = 'bubble';
        if (typeof epsilon !== 'number') {
            epsilon = 1e-9;
        }
        try {
            expect(Math.abs(subject - value), '[not] to be less than or equal to', epsilon);
        } catch (e) {
            var testDescription = this.testDescription;
            expect.fail(function (output) {
                output.error('expected ')
                    .append(expect.inspect(subject)).sp()
                    .error(testDescription).sp()
                    .append(expect.inspect(value)).sp()
                    .text('(epsilon: ')
                    .jsNumber(epsilon.toExponential())
                    .text(')');
            });
        }
    });

    expect.addAssertion('[not] to be (a|an)', function (expect, subject, type) {
        if ('string' === typeof type) {
            var subjectType = expect.findTypeOf(subject);
            type = /^reg(?:exp?|ular expression)$/.test(type) ? 'regexp' : type;
            this.args[0] = expect.output.clone().jsString(type);
            expect(subjectType.is(type), '[not] to be truthy');
        } else {
            if (typeof type.name === 'string') {
                this.args[0] = expect.output.clone().text(type.name);
            }

            expect(subject instanceof type, '[not] to be truthy');
        }

        return this;
    });

    // Alias for common '[not] to be (a|an)' assertions
    expect.addAssertion('[not] to be an (object|array)', function (expect, subject) {
        expect(subject, '[not] to be an', this.alternations[0]);
    });

    expect.addAssertion('[not] to be a (boolean|number|string|function|regexp|regex|regular expression)', function (expect, subject) {
        expect(subject, '[not] to be a', this.alternations[0]);
    });

    expect.addAssertion('string', 'to be (the empty|an empty|a non-empty) string', function (expect, subject) {
        expect(subject, this.alternations[0] === 'a non-empty' ? 'not to be empty' : 'to be empty');
    });

    expect.addAssertion('array-like', 'to be (the empty|an empty|a non-empty) array', function (expect, subject) {
        expect(subject, this.alternations[0] === 'a non-empty' ? 'not to be empty' : 'to be empty');
    });

    expect.addAssertion('string', '[not] to match', function (expect, subject, regexp) {
        subject = String(subject);
        try {
            expect(String(subject).match(regexp), '[not] to be truthy');
        } catch (e) {
            if (e._isUnexpected) {
                e.label = 'should match';
                if (this.flags.not) {
                    e.createDiff = function (output) {
                        var lastIndex = 0;
                        function flushUntilIndex(i) {
                            if (i > lastIndex) {
                                output.text(subject.substring(lastIndex, i));
                                lastIndex = i;
                            }
                        }
                        subject.replace(new RegExp(regexp.source, 'g'), function ($0, index) {
                            flushUntilIndex(index);
                            lastIndex += $0.length;
                            output.diffRemovedHighlight($0);
                        });
                        flushUntilIndex(subject.length);
                        return {diff: output};
                    };
                }
            }
            expect.fail(e);
        }
    });

    expect.addAssertion('object', '[not] to have [own] property', function (expect, subject, key, value) {
        if (arguments.length === 4) {
            expect(subject, 'to have [own] property', key);
            expect(subject[key], '[not] to equal', value);
        } else {
            expect(this.flags.own ?
                   subject && subject.hasOwnProperty(key) :
                   subject && subject[key] !== undefined,
                   '[not] to be truthy');
        }
    });

    expect.addAssertion('object', '[not] to have [own] properties', function (expect, subject, properties) {
        if (properties && isArray(properties)) {
            properties.forEach(function (property) {
                expect(subject, '[not] to have [own] property', property);
            });
        } else if (properties && typeof properties === 'object') {
            var flags = this.flags;

            if (flags.not) {
                throw new Error("Assertion '" + this.testDescription + "' only supports " +
                                "input in the form of an Array.");
            }

            try {
                Object.keys(properties).forEach(function (property) {
                    var value = properties[property];
                    if (typeof value === 'undefined') {
                        expect(subject, 'not to have [own] property', property);
                    } else {
                        expect(subject, 'to have [own] property', property, value);
                    }
                });
            } catch (e) {
                if (e._isUnexpected) {
                    e.createDiff = function (output, diff) {
                        var expected = extend({}, properties);
                        var actual = {};
                        var propertyNames = expect.findTypeOf(subject).getKeys(subject);
                        // Might put duplicates into propertyNames, but that does not matter:
                        for (var propertyName in subject) {
                            propertyNames.push(propertyName);
                        }
                        propertyNames.forEach(function (propertyName) {
                            if ((!flags.own || subject.hasOwnProperty(propertyName)) && !(propertyName in properties)) {
                                expected[propertyName] = subject[propertyName];
                            }
                            if ((!flags.own || subject.hasOwnProperty(propertyName)) && !(propertyName in actual)) {
                                actual[propertyName] = subject[propertyName];
                            }
                        });
                        var result = diff(actual, expected);
                        result.diff = utils.wrapConstructorNameAroundOutput(result.diff, subject);
                        return result;
                    };
                }
                expect.fail(e);
            }
        } else {
            throw new Error("Assertion '" + this.testDescription + "' only supports " +
                            "input in the form of an Array or an Object.");
        }
    });

    expect.addAssertion(['string', 'array-like'], '[not] to have length', function (expect, subject, length) {
        if (!this.flags.not) {
            this.errorMode = 'nested';
        }

        expect(subject.length, '[not] to be', length);
    });

    expect.addAssertion(['string', 'array-like'], '[not] to be empty', function (expect, subject) {
        expect(subject, '[not] to have length', 0);
    });

    expect.addAssertion(['string', 'array-like'], 'to be non-empty', function (expect, subject) {
        expect(subject, 'not to be empty');
    });

    expect.addAssertion('object', ['to [not] [only] have (key|keys)', '[not] to have (key|keys)'], function (expect, subject, keys) {
        keys = isArray(keys) ?
            keys :
            Array.prototype.slice.call(arguments, 2);

        if (this.flags.not && keys.length === 0) {
            return;
        }

        var hasKeys = subject && keys.every(function (key) {
            return subject.hasOwnProperty(key);
        });

        if (this.flags.only) {
            expect(hasKeys, 'to be truthy');
            expect(Object.keys(subject).length === keys.length, '[not] to be truthy');
        } else {
            expect(hasKeys, '[not] to be truthy');
        }
    });

    expect.addAssertion('string', '[not] to contain', function (expect, subject) {
        var args = Array.prototype.slice.call(arguments, 2);
        try {
            args.forEach(function (arg) {
                expect(subject.indexOf(arg) !== -1, '[not] to be truthy');
            });
        } catch (e) {
            if (e._isUnexpected && this.flags.not) {
                e.createDiff = function (output) {
                    var lastIndex = 0;
                    function flushUntilIndex(i) {
                        if (i > lastIndex) {
                            output.text(subject.substring(lastIndex, i));
                            lastIndex = i;
                        }
                    }
                    subject.replace(new RegExp(args.map(function (arg) {
                        return utils.escapeRegExpMetaChars(String(arg));
                    }).join('|'), 'g'), function ($0, index) {
                        flushUntilIndex(index);
                        lastIndex += $0.length;
                        output.diffRemovedHighlight($0);
                    });
                    flushUntilIndex(subject.length);
                    return {diff: output};
                };
            }
            expect.fail(e);
        }
    });

    expect.addAssertion('array-like', '[not] to contain', function (expect, subject) {
        var args = Array.prototype.slice.call(arguments, 2);
        try {
            args.forEach(function (arg) {
                expect(subject && Array.prototype.some.call(subject, function (item) {
                    return expect.equal(item, arg);
                }), '[not] to be truthy');
            });
        } catch (e) {
            if (e._isUnexpected && this.flags.not) {
                e.createDiff = function (output, diff, inspect, equal) {
                    return diff(subject, Array.prototype.filter.call(subject, function (item) {
                        return !args.some(function (arg) {
                            return equal(item, arg);
                        });
                    }));
                };
            }
            expect.fail(e);
        }
    });

    expect.addAssertion('number', '[not] to be finite', function (expect, subject) {
        expect(isFinite(subject), '[not] to be truthy');
    });

    expect.addAssertion('number', '[not] to be infinite', function (expect, subject) {
        expect(!isNaN(subject) && !isFinite(subject), '[not] to be truthy');
    });

    expect.addAssertion(['number', 'string'], '[not] to be within', function (expect, subject, start, finish) {
        this.args = [expect.output.clone().append(expect.inspect(start)).text('..').append(expect.inspect(finish))];
        expect(subject >= start && subject <= finish, '[not] to be truthy');
    });

    expect.addAssertion(['number', 'string'], ['<', '[not] to be (<|less than|below)'], function (expect, subject, value) {
        expect(subject < value, '[not] to be truthy');
    });

    expect.addAssertion(['number', 'string'], ['<=', '[not] to be (<=|less than or equal to)'], function (expect, subject, value) {
        expect(subject <= value, '[not] to be truthy');
    });

    expect.addAssertion(['number', 'string'], ['>', '[not] to be (>|greater than|above)'], function (expect, subject, value) {
        expect(subject > value, '[not] to be truthy');
    });

    expect.addAssertion(['number', 'string'], ['>=', '[not] to be (>=|greater than or equal to)'], function (expect, subject, value) {
        expect(subject >= value, '[not] to be truthy');
    });

    expect.addAssertion('number', '[not] to be positive', function (expect, subject) {
        expect(subject, '[not] to be >', 0);
    });

    expect.addAssertion('number', '[not] to be negative', function (expect, subject) {
        expect(subject, '[not] to be <', 0);
    });

    expect.addAssertion('[not] to equal', function (expect, subject, value) {
        try {
            expect(expect.equal(value, subject), '[not] to be truthy');
        } catch (e) {
            if (e._isUnexpected) {
                e.label = 'should equal';
                if (!this.flags.not) {
                    e.createDiff = function (output, diff) {
                        return diff(subject, value);
                    };
                }
            }
            expect.fail(e);
        }
    });

    expect.addAssertion('function', '[not] to (throw|throw error|throw exception)', function (expect, subject, arg) {
        this.errorMode = 'nested';

        var thrown = false;
        var hasArg = arguments.length > 2;

        try {
            subject();
        } catch (e) {
            var isUnexpected = e && e._isUnexpected;
            if (hasArg) {
                if (isUnexpected && (typeof arg === 'string' || isRegExp(arg))) {
                    expect(e.output.toString(), '[not] to satisfy', arg);
                } else {
                    expect(e, '[not] to satisfy', arg);
                }
            } else {
                if (this.flags.not) {
                    expect.fail('threw: {0}', isUnexpected ? e.output : expect.inspect(e));
                }
            }
            thrown = true;
        }

        this.errorMode = 'default';
        if (hasArg) {
            // in the presence of a matcher, ensure the `not` only applies to
            // the matching.
            expect(thrown, 'to be truthy');
        } else {
            expect(thrown, '[not] to be truthy');
        }
    });

    expect.addAssertion('function', 'to have arity', function (expect, subject, value) {
        expect(subject.length, 'to equal', value);
    });

    expect.addAssertion('object', [
        'to be a non-empty (map|hash|object) whose values satisfy',
        'to be (a map|a hash|an object) whose values satisfy'
    ], function (expect, subject) {
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an object');
        if (this.testDescription.indexOf('non-empty') !== -1) {
            expect(subject, 'not to equal', {});
        }
        this.errorMode = 'bubble';

        var errors = {};
        expect.findTypeOf(subject).getKeys(subject).forEach(function (key, index) {
            try {
                if (typeof extraArgs[0] === 'function') {
                    extraArgs[0](subject[key], index);
                } else {
                    expect.apply(expect, [subject[key], 'to satisfy assertion'].concat(extraArgs));
                }
            } catch (e) {
                errors[key] = e;
            }
        }, this);

        var errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            expect.fail(function (output) {
                var subjectOutput = expect.inspect(subject);
                output.error('failed expectation in');
                if (subjectOutput.size().height > 1) {
                    output.nl();
                } else {
                    output.sp();
                }
                subjectOutput.error(':');
                output.block(subjectOutput).nl();
                output.indentLines();

                errorKeys.forEach(function (key, index) {
                    var error = errors[key];
                    output.i().text(key).text(': ');
                    if (error._isUnexpected) {
                        output.block(error.output);
                    } else {
                        output.block(output.clone().text(error.message));
                    }

                    if (index < errorKeys.length - 1) {
                        output.nl();
                    }
                });
            });
        }
    });

    expect.addAssertion('array-like', 'to be (a non-empty|an) array whose items satisfy', function (expect, subject) { // ...
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        if (this.alternations[0] === 'a non-empty') {
            expect(subject, 'to be non-empty');
        }
        this.errorMode = 'bubble';
        expect.apply(expect, [subject, 'to be a map whose values satisfy'].concat(extraArgs));
    });

    expect.addAssertion('array-like', 'to be an array of', function (expect, subject, itemType) {
        expect(subject, 'to be an array whose items satisfy', 'to be a', itemType);
    });

    expect.addAssertion('array-like', 'to be a non-empty array of', function (expect, subject, itemType) {
        if (this.flags['non-empty']) {
            expect(subject, 'to be non-empty');
        }
        expect(subject, 'to be an array of', itemType);
    });

    expect.addAssertion('array-like', 'to be an array of (strings|numbers|booleans|arrays|objects|functions|regexps|regexes|regular expressions)', function (expect, subject) {
        expect(subject, 'to be an array of', this.alternations[0].replace(/e?s$/, ''));
    });

    expect.addAssertion('array-like', 'to be a non-empty array of (strings|numbers|booleans|arrays|objects|functions|regexps|regexes|regular expressions)', function (expect, subject) {
        expect(subject, 'to be a non-empty array of', this.alternations[0].replace(/e?s$/, ''));
    });

    expect.addAssertion('object', [
        'to be a non-empty (map|hash|object) whose (keys|properties) satisfy',
        'to be (a map|a hash|an object) whose (keys|properties) satisfy'
    ], function (expect, subject) {
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an object');

        if (this.testDescription.indexOf('non-empty') !== -1) {
            expect(subject, 'not to equal', {});
        }
        this.errorMode = 'bubble';

        var errors = {};
        Object.keys(subject).forEach(function (key, index) {
            try {
                if (typeof extraArgs[0] === 'function') {
                    extraArgs[0](key, subject[key]);
                } else {
                    expect.apply(expect, [key, 'to satisfy assertion'].concat(extraArgs));
                }
            } catch (e) {
                errors[key] = e;
            }
        });

        var errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            expect.fail(function (output) {
                output.error('failed expectation on keys ')
                      .text(Object.keys(subject).join(', '))
                      .error(':').nl()
                      .indentLines();

                errorKeys.forEach(function (key, index) {
                    var error = errors[key];
                    output.i().text(key).text(': ');
                    if (error._isUnexpected) {
                        output.block(error.output);
                    } else {
                        output.block(output.clone().text(error.message));
                    }

                    if (index < errorKeys.length - 1) {
                        output.nl();
                    }
                });
            });
        }
    });

    expect.addAssertion('object', 'to be canonical', function (expect, subject) {
        var stack = [];

        (function traverse(obj) {
            var i;
            for (i = 0 ; i < stack.length ; i += 1) {
                if (stack[i] === obj) {
                    return;
                }
            }
            if (obj && typeof obj === 'object') {
                var keys = Object.keys(obj);
                for (i = 0 ; i < keys.length - 1 ; i += 1) {
                    expect(keys[i], 'to be less than', keys[i + 1]);
                }
                stack.push(obj);
                keys.forEach(function (key) {
                    traverse(obj[key]);
                });
                stack.pop();
            }
        }(subject));
    });

    expect.addAssertion('Error', 'to [exhaustively] satisfy [assertion]', function (expect, subject, value) {
        var valueType = expect.findTypeOf(value);
        if (valueType.is('Error')) {
            expect(subject, 'to have properties', valueType.unwrap(value));
        } else if (typeof value === 'function') {
            value(subject);
        } else if (valueType.is('object')) {
            var keys = valueType.getKeys(value);
            keys.forEach(function (key) {
                expect(subject[key], 'to [exhaustively] satisfy', value[key]);
            });
            if (this.flags.exhaustively) {
                expect(utils.getKeysOfDefinedProperties(subject), 'to have length', keys.filter(function (key) {
                    return typeof value[key] !== 'undefined';
                }).length);
            }
        } else {
            expect(subject.message, 'to [exhaustively] satisfy', value);
        }
    });

    expect.addAssertion('binaryArray', 'to [exhaustively] satisfy', function (expect, subject, value) {
        if (typeof value === 'function') {
            if (value._expectIt) {
                try {
                    value(subject);
                } catch (e) {
                    if (e._isUnexpected) {
                        e.createDiff = function (output, diff, inspect, equal) {
                            return {
                                diff: output.append(e.output),
                                inline: false
                            };
                        };
                    }
                    expect.fail(e);
                }
            } else {
                value(subject);
            }
        } else {
            expect(subject, 'to equal', value);
        }
    });

    expect.addAssertion('[not] to [exhaustively] satisfy [assertion]', function (expect, subject, value) {
        if (this.flags.not) {
            try {
                expect(subject, 'to [exhaustively] satisfy [assertion]', value);
            } catch (e) {
                if (!e || !e._isUnexpected) {
                    throw e;
                }
                return;
            }
            expect.fail();
        } else if (this.flags.assertion && typeof value === 'string') {
            this.errorMode = 'bubble'; // to satisfy assertion 'to be a number' => to be a number
            expect.apply(expect, Array.prototype.slice.call(arguments, 1));
        } else if (value && value._expectIt) {
            try {
                value(subject);
            } catch (e) {
                if (e._isUnexpected) {
                    e.createDiff = function (output, diff, inspect, equal) {
                        return {
                            diff: output.append(e.output),
                            inline: false
                        };
                    };
                }
                expect.fail(e);
            }
        } else if (typeof value === 'function') {
            value(subject);
        } else if (isRegExp(value)) {
            expect(subject, 'to match', value);
        } else {
            var type = expect.findTypeOf(subject, value),
                bothAreArrays = type.is('array');
            if (type.is('array-like') || type.is('object')) {
                try {
                    expect(subject, 'to be an object');
                    var keys = type.getKeys(value);
                    keys.forEach(function (key) {
                        expect(subject[key], 'to [exhaustively] satisfy', value[key]);
                    });
                    if (type.is('array-like') || this.flags.exhaustively) {
                        expect(subject, 'to only have keys', keys);
                    }
                } catch (e) {
                    if (e._isUnexpected) {
                        var flags = this.flags;
                        e.createDiff = function (output, diff, inspect, equal) {
                            var result = {
                                diff: output,
                                inline: true
                            };

                            var keyIndex = {};
                            Object.keys(subject).concat(Object.keys(value)).forEach(function (key) {
                                if (!(key in result)) {
                                    keyIndex[key] = key;
                                }
                            });

                            var keys = Object.keys(keyIndex);

                            output.text(bothAreArrays ? '[' : '{').nl().indentLines();

                            keys.forEach(function (key, index) {
                                output.i().block(function () {
                                    var valueOutput;
                                    var annotation = output.clone();
                                    var conflicting;
                                    try {
                                        expect(subject[key], 'to [exhaustively] satisfy', value[key]);
                                    } catch (e) {
                                        if (!e._isUnexpected) {
                                            expect.fail(e);
                                        }
                                        conflicting = e;
                                    }
                                    var isInlineDiff = true;
                                    if (conflicting) {
                                        if (!(key in value)) {
                                            if (type.is('array-like') || flags.exhaustively) {
                                                annotation.error('should be removed');
                                            } else {
                                                conflicting = null;
                                            }
                                        } else {
                                            var keyDiff = conflicting.createDiff && conflicting.createDiff(output.clone(), diff, inspect, equal);
                                            isInlineDiff = !keyDiff || keyDiff.inline ;
                                            if (value[key] && value[key]._expectIt) {
                                                if (keyDiff && keyDiff.diff) {
                                                    annotation.append(keyDiff.diff);
                                                } else {
                                                    annotation.error('should satisfy ').append(inspect(value[key])).nl();
                                                    if (conflicting._isUnexpected) {
                                                        annotation.append(conflicting.output);
                                                    } else {
                                                        annotation.error(conflicting.message);
                                                    }
                                                }
                                            } else if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                                annotation.error(conflicting.label || 'should satisfy').sp()
                                                    .block(inspect(value[key]));

                                                if (keyDiff) {
                                                    annotation.nl().append(keyDiff.diff);
                                                }
                                            } else {
                                                valueOutput = keyDiff.diff;
                                            }
                                        }
                                    }

                                    var last = index === keys.length - 1;
                                    if (!valueOutput) {
                                        valueOutput = inspect(subject[key], conflicting ? Infinity : 1);
                                    }

                                    if (!bothAreArrays) {
                                        this.key(key).text(':').sp();
                                    }
                                    valueOutput.amend('text', last ? '' : ',');

                                    if (isInlineDiff) {
                                        this.append(valueOutput);
                                    } else {
                                        this.block(valueOutput);
                                    }
                                    if (!annotation.isEmpty()) {
                                        this.sp().annotationBlock(annotation);
                                    }
                                }).nl();
                            });

                            output.outdentLines().text(bothAreArrays ? ']' : '}');

                            if (!bothAreArrays) {
                                result.diff = utils.wrapConstructorNameAroundOutput(result.diff, subject);
                            }

                            return result;
                        };
                    }
                    expect.fail(e);
                }
            } else {
                expect(subject, 'to equal', value);
            }
        }
    });

    function wrapDiffWithTypePrefixAndSuffix(e, type) {
        if (e._isUnexpected && e.createDiff) {
            var createDiff = e.createDiff;
            e.createDiff = function (output) { // ...
                type.prefix.call(e, output);
                var result = createDiff.apply(this, arguments);
                type.suffix.call(e, output);
                return result;
            };
        }
        return e;
    }

    expect.addAssertion('wrapperObject', 'to [exhaustively] satisfy', function (expect, subject, value) {
        var valueType = expect.findTypeOf(value);
        if (valueType.is('wrapperObject')) {
            var type = expect.findTypeOf(subject, value);
            expect(type.is('wrapperObject'), 'to be truthy');
            try {
                expect(type.unwrap(subject), 'to [exhaustively] satisfy', type.unwrap(value));
            } catch (e) {
                expect.fail(wrapDiffWithTypePrefixAndSuffix(e, type));
            }
        } else {
            var subjectType = expect.findTypeOf(subject);
            expect(subjectType.is('wrapperObject'), 'to be truthy');
            try {
                expect(subjectType.unwrap(subject), 'to [exhaustively] satisfy', value);
            } catch (e) {
                e.label = 'should satisfy';
                expect.fail(wrapDiffWithTypePrefixAndSuffix(e, subjectType));
            }

        }
    });

    expect.addAssertion('function', 'when called with', function (expect, subject, args) { // ...
        this.errorMode = 'nested';
        this.shift(expect, subject.apply(subject, args), 1);
    });

    expect.addAssertion('array', 'when passed as parameters to', function (expect, subject, fn) { // ...
        this.errorMode = 'nested';
        this.shift(expect, fn.apply(fn, subject), 1);
    });
};

},{}],4:[function(require,module,exports){
module.exports = function createStandardErrorMessage(expect, subject, testDescription, args) {
    var output = expect.output.clone();

    var preamble = 'expected';

    var subjectOutput = expect.inspect(subject);

    var argsOutput = output.clone();
    if (args.length > 0) {
        var previousArgWasMagicPen = false;
        args.forEach(function (arg, index) {
            var isMagicPen = arg && arg.isMagicPen;
            if (0 < index) {
                if (!isMagicPen && !previousArgWasMagicPen) {
                    argsOutput.text(',');
                }
                argsOutput.text(' ');
            }
            if (isMagicPen) {
                argsOutput.append(arg);
            } else {
                argsOutput.append(expect.inspect(arg));
            }
            previousArgWasMagicPen = isMagicPen;
        });
    }

    var subjectSize = subjectOutput.size();
    var argsSize = argsOutput.size();
    var width = preamble.length + subjectSize.width + argsSize.width + testDescription.length;
    var height = Math.max(subjectSize.height, argsSize.height);

    output.error(preamble);

    if (subjectSize.height > 1) {
        output.nl();
    } else {
        output.sp();
    }

    output.append(subjectOutput);

    if (subjectSize.height > 1 || (height === 1 && width > 120)) {
        output.nl();
    } else {
        output.sp();
    }

    output.error(testDescription);

    if (argsSize.height > 1) {
        output.nl();
    } else if (argsSize.width > 0) {
        output.sp();
    }

    output.append(argsOutput);

    return output;
};

},{}],5:[function(require,module,exports){
module.exports = function (expect) {
    expect.installTheme({
        jsBoolean: 'jsPrimitive',
        jsNumber: 'jsPrimitive',
        error: ['red', 'bold'],
        success: ['green', 'bold'],
        diffAddedLine: 'green',
        diffAddedHighlight: ['bgGreen', 'white'],
        diffAddedSpecialChar: ['bgGreen', 'cyan', 'bold'],
        diffRemovedLine: 'red',
        diffRemovedHighlight: ['bgRed', 'white'],
        diffRemovedSpecialChar: ['bgRed', 'cyan', 'bold']
    });

    expect.installTheme('html', {
        jsComment: '#969896',
        jsFunctionName: '#795da3',
        jsKeyword: '#a71d5d',
        jsPrimitive: '#0086b3',
        jsRegexp: '#183691',
        jsString: '#df5000',
        jsKey: '#555'
    });

    expect.installTheme('ansi', {
        jsComment: 'gray',
        jsFunctionName: 'jsKeyword',
        jsKeyword: 'magenta',
        jsNumber: [],
        jsPrimitive: 'cyan',
        jsRegexp: 'green',
        jsString: 'cyan',
        jsKey: '#666',
        diffAddedHighlight: ['bgGreen', 'black'],
        diffRemovedHighlight: ['bgRed', 'black']
    });

    expect.addStyle('key', function (content) {
        content = String(content);
        if (/^[a-z\$\_][a-z0-9\$\_]*$/i.test(content)) {
            this.text(content, 'jsKey');
        } else if (/^(?:0|[1-9][0-9]*)$/.test(content)) {
            this.jsNumber(content);
        } else {
            this.jsString('\'')
                .jsString(JSON.stringify(content).replace(/^"|"$/g, '')
                         .replace(/'/g, "\\'")
                         .replace(/\\"/g, '"'))
                .jsString('\'');

        }
    });
    // Intended to be redefined by a plugin that offers syntax highlighting:
    expect.addStyle('code', function (content, language) {
        this.text(content);
    });

    expect.addStyle('annotationBlock', function () {
        var pen = this.getContentFromArguments(arguments);
        var height = pen.size().height;

        if (height > 0) {
            this.block(function () {
                for (var i = 0; i < height; i += 1) {
                    if (0 < i) {
                        this.nl();
                    }
                    this.error('//');
                }
            });
            this.sp().block(pen);
        }
    });

    expect.addStyle('shouldEqualError', function (expected, inspect) {
        this.error(typeof expected === 'undefined' ? 'should be' : 'should equal').sp().block(inspect(expected));
    });
};

},{}],6:[function(require,module,exports){
(function (Buffer){
var utils = require(7);
var isRegExp = utils.isRegExp;
var leftPad = utils.leftPad;
var extend = utils.extend;
var arrayChanges = require(9);
var leven = require(17);

module.exports = function (expect) {
    expect.addType({
        name: 'wrapperObject',
        identify: false,
        equal: function (a, b, equal) {
            return a === b || equal(this.unwrap(a), this.unwrap(b));
        },
        inspect: function (value, depth, output, inspect) {
            output.append(this.prefix(output.clone()));
            output.append(inspect(this.unwrap(value)));
            output.append(this.suffix(output.clone()));
        },
        diff: function (actual, expected, output, diff, inspect) {
            actual = this.unwrap(actual);
            expected = this.unwrap(expected);
            var comparison = diff(actual, expected);
            var prefixOutput = this.prefix(output.clone());
            var suffixOutput = this.suffix(output.clone());
            if (comparison && comparison.inline) {
                return {
                    inline: true,
                    diff: output.append(prefixOutput).append(comparison.diff).append(suffixOutput)
                };
            } else {
                return {
                    inline: true,
                    diff: output.append(prefixOutput).nl()
                        .indentLines()
                        .i().block(function () {
                            this.append(inspect(actual)).sp().annotationBlock(function () {
                                this.shouldEqualError(expected, inspect);
                                if (comparison) {
                                    this.nl().append(comparison.diff);
                                }
                            });
                        }).nl()
                        .outdentLines()
                        .append(suffixOutput)
                };
            }
        }
    });

    expect.addType({
        name: 'object',
        identify: function (obj) {
            return obj && (typeof obj === 'object' || typeof obj === 'function');
        },
        getKeys: Object.keys,
        equal: function (a, b, equal) {
            if (a === b) {
                return true;
            }

            if (b.constructor !== a.constructor) {
                return false;
            }

            var actualKeys = utils.getKeysOfDefinedProperties(a),
                expectedKeys = utils.getKeysOfDefinedProperties(b),
                key;

            // having the same number of owned properties (keys incorporates hasOwnProperty)
            if (actualKeys.length !== expectedKeys.length) {
                return false;
            }
            //the same set of keys (although not necessarily the same order),
            actualKeys.sort();
            expectedKeys.sort();
            // cheap key test
            for (var i = 0; i < actualKeys.length; i += 1) {
                if (actualKeys[i] !== expectedKeys[i]) {
                    return false;
                }
            }

            //equivalent values for every corresponding key, and
            // possibly expensive deep test
            for (var j = 0; j < actualKeys.length; j += 1) {
                key = actualKeys[j];
                if (!equal(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        },
        inspect: function (obj, depth, output, inspect) {
            var keys = Object.keys(obj);
            if (keys.length === 0) {
                return utils.wrapConstructorNameAroundOutput(output.text('{}'), obj);
            }
            var inspectedItems = keys.map(function (key, index) {
                var lastIndex = index === keys.length - 1;

                var hasGetter = obj.__lookupGetter__ && obj.__lookupGetter__(key);
                var hasSetter = obj.__lookupGetter__ && obj.__lookupSetter__(key);
                var propertyOutput = output.clone();
                if (hasSetter && !hasGetter) {
                    propertyOutput.text('set').sp();
                }
                propertyOutput.key(key);
                propertyOutput.text(':');

                // Inspect the setter function if there's no getter:
                var value = (hasSetter && !hasGetter) ? hasSetter : obj[key];
                var inspectedValue = inspect(value);

                if (!lastIndex) {
                    inspectedValue.amend('text', ',');
                }

                if (value && value._expectIt) {
                    propertyOutput.sp().block(inspectedValue);
                } else {
                    propertyOutput.sp().append(inspectedValue);
                }
                if (hasGetter && hasSetter) {
                    propertyOutput.sp().jsComment('/* getter/setter */');
                } else if (hasGetter) {
                    propertyOutput.sp().jsComment('/* getter */');
                }

                return propertyOutput;
            });

            var width = 0;
            var multipleLines = inspectedItems.some(function (o) {
                var size = o.size();
                width += size.width;
                return width > 50 || size.height > 1;
            });

            if (multipleLines) {
                output.text('{').nl().indentLines();

                inspectedItems.forEach(function (inspectedItem, index) {
                    output.i().block(inspectedItem).nl();
                });

                output.outdentLines().text('}');
            } else {
                output.text('{ ');
                inspectedItems.forEach(function (inspectedItem, index) {
                    output.append(inspectedItem);
                    var lastIndex = index === inspectedItems.length - 1;
                    if (!lastIndex) {
                        output.sp();
                    }
                });
                output.text(' }');
            }
            return utils.wrapConstructorNameAroundOutput(output, obj);
        },
        diff: function (actual, expected, output, diff, inspect, equal) {
            if (actual.constructor !== expected.constructor) {
                return {
                    diff: output.text('Mismatching constructors ')
                        .text(actual.constructor && actual.constructor.name || actual.constructor)
                        .text(' should be ').text(expected.constructor && expected.constructor.name || expected.constructor),
                    inline: false
                };
            }

            var result = {
                diff: output,
                inline: true
            };

            var keyIndex = {};
            Object.keys(actual).concat(Object.keys(expected)).forEach(function (key) {
                if (!(key in result)) {
                    keyIndex[key] = key;
                }
            });

            var keys = Object.keys(keyIndex);

            output.text('{').nl().indentLines();

            keys.forEach(function (key, index) {
                output.i().block(function () {
                    var valueOutput;
                    var annotation = output.clone();
                    var conflicting = !equal(actual[key], expected[key]);
                    var isInlineDiff = false;
                    if (conflicting) {
                        if (!(key in expected)) {
                            annotation.error('should be removed');
                            isInlineDiff = true;
                        } else {
                            var keyDiff = diff(actual[key], expected[key]);
                            if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                annotation.shouldEqualError(expected[key], inspect);

                                if (keyDiff) {
                                    annotation.nl().append(keyDiff.diff);
                                }
                            } else {
                                isInlineDiff = true;
                                valueOutput = keyDiff.diff;
                            }
                        }
                    } else {
                        isInlineDiff = true;
                    }

                    var last = index === keys.length - 1;
                    if (!valueOutput) {
                        valueOutput = inspect(actual[key], conflicting ? Infinity : 1);
                    }

                    this.key(key);
                    this.text(':').sp();
                    valueOutput.amend('text', last ? '' : ',');
                    if (isInlineDiff) {
                        this.append(valueOutput);
                    } else {
                        this.block(valueOutput);
                    }
                    if (!annotation.isEmpty()) {
                        this.sp().annotationBlock(annotation);
                    }
                }).nl();
            });

            output.outdentLines().text('}');

            result.diff = utils.wrapConstructorNameAroundOutput(output, actual);

            return result;
        }
    });

    function structurallySimilar(a, b) {
        var typeA = typeof a;
        var typeB = typeof b;

        if (typeA !== typeB) {
            return false;
        }

        if (typeA === 'string') {
            return leven(a, b) < a.length / 2;
        }

        if (typeA !== 'object' || !a) {
            return false;
        }

        if (utils.isArray(a) && utils.isArray(b)) {
            return true;
        }

        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        var numberOfSimilarKeys = 0;
        var requiredSimilarKeys = Math.round(Math.max(aKeys.length, bKeys.length) / 2);
        return aKeys.concat(bKeys).some(function (key) {
            if (key in a && key in b) {
                numberOfSimilarKeys += 1;
            }

            return numberOfSimilarKeys >= requiredSimilarKeys;
        });
    }

    expect.addType({
        name: 'array-like',
        base: 'object',
        identify: false,
        getKeys: function (obj) {
            var keys = new Array(obj.length);
            for (var i = 0 ; i < obj.length ; i += 1) {
                keys[i] = i;
            }
            return keys;
        },
        equal: function (a, b, equal) {
            if (a === b) {
                return true;
            } else if (a.constructor === b.constructor && a.length === b.length) {
                for (var i = 0; i < a.length; i += 1) {
                    if (!equal(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        prefix: function (output) {
            return output.text('[');
        },
        suffix: function (output) {
            return output.text(']');
        },
        inspect: function (arr, depth, output, inspect) {
            var prefixOutput = this.prefix(output.clone(), arr);
            var suffixOutput = this.suffix(output.clone(), arr);
            if (arr.length === 0) {
                return output.append(prefixOutput).append(suffixOutput);
            }

            if (depth === 1) {
                return output.append(prefixOutput).text('...').append(suffixOutput);
            }

            var inspectedItems = new Array(arr.length);
            for (var i = 0; i < arr.length; i += 1) {
                if (i in arr) {
                    inspectedItems[i] = inspect(arr[i]);
                } else {
                    inspectedItems[i] = output.clone();
                }
            }

            var width = 0;
            var multipleLines = inspectedItems.some(function (o) {
                var size = o.size();
                width += size.width;
                return width > 50 || size.height > 1;
            });

            inspectedItems.forEach(function (inspectedItem, index) {
                var lastIndex = index === inspectedItems.length - 1;
                if (!lastIndex) {
                    inspectedItem.amend('text', ',');
                }
            });

            if (multipleLines) {
                output.append(prefixOutput).nl().indentLines();

                inspectedItems.forEach(function (inspectedItem, index) {
                    output.i().block(inspectedItem).nl();
                });

                output.outdentLines().append(suffixOutput);
            } else {
                output.append(prefixOutput).sp();
                inspectedItems.forEach(function (inspectedItem, index) {
                    output.append(inspectedItem);
                    var lastIndex = index === inspectedItems.length - 1;
                    if (!lastIndex) {
                        output.sp();
                    }
                });
                output.sp().append(suffixOutput);
            }
        },
        diffLimit: 512,
        diff: function (actual, expected, output, diff, inspect, equal) {
            var result = {
                diff: output,
                inline: true
            };

            if (Math.max(actual.length, expected.length) > this.diffLimit) {
                result.diff.jsComment('Diff suppressed due to size > ' + this.diffLimit);
                return result;
            }

            if (actual.constructor !== expected.constructor) {
                return this.baseType.diff(actual, expected);
            }

            var changes = arrayChanges(actual, expected, equal, structurallySimilar);

            output.append(this.prefix(output.clone())).nl().indentLines();

            changes.forEach(function (diffItem, index) {
                output.i().block(function () {
                    var type = diffItem.type;
                    var last = !!diffItem.last;

                    if (type === 'insert') {
                        this.annotationBlock(function () {
                            this.error('missing ').block(inspect(diffItem.value));
                        });
                    } else if (type === 'remove') {
                        this.block(inspect(diffItem.value).amend('text', last ? ' ' : ', ').error('// should be removed'));
                    } else if (type === 'equal') {
                        this.block(inspect(diffItem.value).amend('text', last ? '' : ','));
                    } else {
                        var valueDiff = diff(diffItem.value, diffItem.expected);
                        if (valueDiff && valueDiff.inline) {
                            this.block(valueDiff.diff.amend('text', last ? '' : ','));
                        } else if (valueDiff) {
                            this.block(inspect(diffItem.value).amend('text', last ? ' ' : ', ')).annotationBlock(function () {
                                this.shouldEqualError(diffItem.expected, inspect).nl().append(valueDiff.diff);
                            });
                        } else {
                            this.block(inspect(diffItem.value).amend('text', last ? ' ' : ', ')).annotationBlock(function () {
                                this.shouldEqualError(diffItem.expected, inspect);
                            });
                        }
                    }
                }).nl();
            });

            output.outdentLines().append(this.suffix(output.clone()));

            return result;
        }
    });

    expect.addType({
        name: 'array',
        base: 'array-like',
        identify: function (arr) {
            return utils.isArray(arr);
        }
    });

    expect.addType({
        name: 'arguments',
        base: 'array-like',
        prefix: function (output) {
            return output.text('arguments(', 'cyan');
        },
        suffix: function (output) {
            return output.text(')', 'cyan');
        },
        identify: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Arguments]';
        }
    });

    expect.addType({
        base: 'object',
        name: 'Error',
        identify: function (value) {
            return utils.isError(value);
        },
        getKeys: function (value) {
            var keys = this.baseType.getKeys(value);
            keys.push('message');
            return keys;
        },
        unwrap: function (value) {
            return extend({
                message: value.message
            }, value);
        },
        equal: function (a, b, equal) {
            return a === b ||
                (equal(a.message, b.message) && this.baseType.equal(a, b));
        },
        inspect: function (value, depth, output, inspect) {
            var errorObject = this.unwrap(value);
            // TODO: Inspect Error as a built-in once we have the styles defined:
            output.text('Error(').append(inspect(errorObject, depth)).text(')');
        },
        diff: function (actual, expected, output, diff) {
            var result = diff(extend({
                message: actual.message
            }, actual), extend({
                message: expected.message
            }, expected));
            if (result.diff) {
                result.diff = utils.wrapConstructorNameAroundOutput(result.diff, actual);
            }
            return result;
        }
    });

    expect.addType({
        name: 'date',
        identify: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Date]';
        },
        equal: function (a, b) {
            return a.getTime() === b.getTime();
        },
        inspect: function (date, depth, output, inspect) {
            // TODO: Inspect "new" as an operator and Date as a built-in once we have the styles defined:
            output.jsKeyword('new').sp().text('Date(').append(inspect(date.toUTCString()).text(')'));
        }
    });

    expect.addType({
        base: 'object',
        name: 'function',
        identify: function (f) {
            return typeof f === 'function';
        },
        equal: function (a, b) {
            return a === b || a.toString() === b.toString();
        },
        inspect: function (f, depth, output, inspect) {
            var source = f.toString();
            var name;
            var args;
            var body;
            var matchSource = source.match(/^function (\w*)?\s*\(([^\)]*)\)\s*\{([\s\S]*?( *)?)\}$/);
            if (matchSource) {
                name = matchSource[1];
                args = matchSource[2];
                body = matchSource[3];
                var bodyIndent = matchSource[4] || '';
                // Remove leading indentation unless the function is a one-liner or it uses multiline string literals
                if (/\n/.test(body) && !/\\\n/.test(body)) {
                    body = body.replace(new RegExp('^ {' + bodyIndent.length + '}', 'mg'), '');
                }
                if (!name || name === 'anonymous') {
                    name = '';
                }
                if (/^\s*\[native code\]\s*$/.test(body)) {
                    body = ' /* native code */ ';
                } else {
                    body = body.replace(/^((?:.*\n){3}( *).*\n)[\s\S]*?\n((?:.*\n){3})$/, '$1$2// ... lines removed ...\n$3');
                }
            } else {
                name = f.name || '';
                args = ' /*...*/ ';
                body = ' /*...*/ ';
            }
            output.code('function ' + name + '(' + args + ') {' + body + '}', 'javascript');
        }
    });

    expect.addType({
        base: 'function',
        name: 'expect.it',
        identify: function (f) {
            return typeof f === 'function' && f._expectIt;
        },
        inspect: function (f, depth, output, inspect) {
            output.text('expect.it(');
            var orBranch = false;
            f._expectations.forEach(function (expectation, index) {
                if (expectation === f._OR) {
                    orBranch = true;
                    return;
                }

                if (orBranch) {
                    output.text(')\n      .or(');
                } else if (0 < index) {
                    output.text(')\n        .and(');
                }

                var args = Array.prototype.slice.call(expectation);
                args.forEach(function (arg, i) {
                    if (0 < i) {
                        output.text(', ');
                    }
                    output.append(inspect(arg));
                });
                orBranch = false;
            });

            output.text(')');
        }
    });

    expect.addType({
        name: 'regexp',
        identify: isRegExp,
        equal: function (a, b) {
            return a === b || (
                a.source === b.source &&
                    a.global === b.global &&
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline
            );
        },
        inspect: function (regExp, depth, output) {
            output.jsRegexp(regExp);
        }
    });

    expect.addType({
        name: 'binaryArray',
        base: 'array-like',
        digitWidth: 2,
        hexDumpWidth: 16,
        identify: false,
        equal: function (a, b) {
            if (a === b) {
                return true;
            }

            if (a.length !== b.length) return false;

            for (var i = 0; i < a.length; i += 1) {
                if (a[i] !== b[i]) return false;
            }

            return true;
        },
        hexDump: function (obj, maxLength) {
            var hexDump = '';
            if (typeof maxLength !== 'number' || maxLength === 0) {
                maxLength = obj.length;
            }
            for (var i = 0 ; i < maxLength ; i += this.hexDumpWidth) {
                if (hexDump.length > 0) {
                    hexDump += '\n';
                }
                var hexChars = '',
                    asciiChars = ' │';

                for (var j = 0 ; j < this.hexDumpWidth ; j += 1) {
                    if (i + j < maxLength) {
                        var octet = obj[i + j];
                        hexChars += leftPad(octet.toString(16).toUpperCase(), this.digitWidth, '0') + ' ';
                        asciiChars += String.fromCharCode(octet).replace(/\n/g, '␊').replace(/\r/g, '␍');
                    } else if (this.digitWidth === 2) {
                        hexChars += '   ';
                    }
                }

                if (this.digitWidth === 2) {
                    hexDump += hexChars + asciiChars + '│';
                } else {
                    hexDump += hexChars.replace(/\s+$/, '');
                }
            }
            return hexDump;
        },
        inspect: function (obj, depth, output) {
            var codeStr = this.name + '([';
            for (var i = 0 ; i < Math.min(this.hexDumpWidth, obj.length) ; i += 1) {
                if (i > 0) {
                    codeStr += ', ';
                }
                var octet = obj[i];
                codeStr += '0x' + leftPad(octet.toString(16).toUpperCase(), this.digitWidth, '0');
            }
            if (obj.length > this.hexDumpWidth) {
                codeStr += ' /* ' + (obj.length - this.hexDumpWidth) + ' more */ ';
            }
            codeStr += '])';
            output.code(codeStr, 'javascript');
        },
        diffLimit: 512,
        diff: function (actual, expected, output, diff, inspect) {
            var result = {diff: output};
            if (Math.max(actual.length, expected.length) > this.diffLimit) {
                result.diff.jsComment('Diff suppressed due to size > ' + this.diffLimit);
            } else {
                result.diff = utils.diffStrings(this.hexDump(actual), this.hexDump(expected), output, {type: 'Chars', markUpSpecialCharacters: false})
                    .replaceText(/[\x00-\x1f\x7f-\xff␊␍]/g, '.').replaceText(/[│ ]/g, function (styles, content) {
                        this.text(content);
                    });
            }
            return result;
        }
    });

    if (typeof Buffer !== 'undefined') {
        expect.addType({
            name: 'Buffer',
            base: 'binaryArray',
            identify: Buffer.isBuffer
        });
    }

    [8, 16, 32].forEach(function (numBits) {
        ['Int', 'Uint'].forEach(function (intOrUint) {
            var constructorName = intOrUint + numBits + 'Array',
                Constructor = this[constructorName];
            if (typeof Constructor !== 'undefined') {
                expect.addType({
                    name: constructorName,
                    base: 'binaryArray',
                    hexDumpWidth: 128 / numBits,
                    digitWidth: numBits / 4,
                    identify: function (obj) {
                        return obj instanceof Constructor;
                    }
                });
            }
        }, this);
    }, this);

    expect.addType({
        name: 'string',
        identify: function (value) {
            return typeof value === 'string';
        },
        inspect: function (value, depth, output) {
            output.jsString('\'')
                .jsString(JSON.stringify(value).replace(/^"|"$/g, '')
                         .replace(/'/g, "\\'")
                         .replace(/\\"/g, '"'))
                .jsString('\'');
        },
        diff: function (actual, expected, output, diff, inspect) {
            var result = {
                diff: output,
                inline: false
            };
            utils.diffStrings(actual, expected, output, {type: 'WordsWithSpace', markUpSpecialCharacters: true});
            return result;
        }
    });

    expect.addType({
        name: 'number',
        identify: function (value) {
            return typeof value === 'number';
        },
        inspect: function (value, depth, output) {
            if (value === 0 && 1 / value === -Infinity) {
                value = '-0';
            } else {
                value = String(value);
            }
            output.jsNumber(String(value));
        }
    });

    expect.addType({
        name: 'NaN',
        identify: function (value) {
            return typeof value === 'number' && isNaN(value);
        },
        inspect: function (value, depth, output) {
            output.jsPrimitive(value);
        }
    });

    expect.addType({
        name: 'boolean',
        identify: function (value) {
            return typeof value === 'boolean';
        },
        inspect: function (value, depth, output) {
            output.jsPrimitive(value);
        }
    });

    expect.addType({
        name: 'undefined',
        identify: function (value) {
            return typeof value === 'undefined';
        },
        inspect: function (value, depth, output) {
            output.jsPrimitive(value);
        }
    });

    expect.addType({
        name: 'null',
        identify: function (value) {
            return value === null;
        },
        inspect: function (value, depth, output) {
            output.jsPrimitive(value);
        }
    });
};

}).call(this,require(11).Buffer)
},{}],7:[function(require,module,exports){
var stringDiff = require(16);

var errorMethodBlacklist = ['message', 'line', 'sourceId', 'sourceURL', 'stack', 'stackArray'].reduce(function (result, prop) {
    result[prop] = true;
    return result;
}, {});

var specialCharRegexp = /([\x00-\x09\x0B-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BA-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF])/g;

var utils = module.exports = {
    objectIs: Object.is || function (a, b) {
        // Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        if (a === 0 && b === 0) {
            return 1 / a === 1 / b;
        }
        if (a !== a) {
            return b !== b;
        }
        return a === b;
    },

    isArray: function (ar) {
        return Object.prototype.toString.call(ar) === '[object Array]';
    },

    isRegExp: function (re) {
        return (Object.prototype.toString.call(re) === '[object RegExp]');
    },

    isError: function (err) {
        return typeof err === 'object' && (Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error);
    },

    extend: function (target) {
        for (var i = 1; i < arguments.length; i += 1) {
            var source = arguments[i];
            Object.keys(source).forEach(function (key) {
                target[key] = source[key];
            });
        }
        return target;
    },

    isUndefinedOrNull: function (value) {
        return value === null || value === undefined;
    },

    getKeysOfDefinedProperties: function (object) {
        var keys = Object.keys(object).filter(function (key) {
            return typeof object[key] !== 'undefined';
        });
        // The 'message' property of Error instances is not enumerable for some reason, but we want
        // to include it in the set when comparing:
        if (Object.prototype.toString.call(object) === '[object Error]') {
            keys.push('message');
        }
        return keys;
    },

    truncateStack: function (err, fn) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(err, fn);
        } else if ('stack' in err) {
            // Excludes IE<10, and fn cannot be anonymous for this backup plan to work:
            var stackEntries = err.stack.split(/\r\n?|\n\r?/),
            needle = 'at ' + fn.name + ' ';
            for (var i = 0 ; i < stackEntries.length ; i += 1) {
                if (stackEntries[i].indexOf(needle) !== -1) {
                    stackEntries.splice(1, i);
                    err.stack = stackEntries.join("\n");
                }
            }
        }
        return err;
    },

    findFirst: function (arr, predicate, thisObj) {
        var scope = thisObj || null;
        for (var i = 0 ; i < arr.length ; i += 1) {
            if (predicate.call(scope, arr[i], i, arr)) {
                return arr[i];
            }
        }
        return null;
    },

    leftPad: function (str, width, ch) {
        ch = ch || ' ';
        while (str.length < width) {
            str = ch + str;
        }
        return str;
    },

    cloneError: function (e) {
        var newError = new Error();
        Object.keys(e).forEach(function (key) {
            if (!errorMethodBlacklist[key]) {
                newError[key] = e[key];
            }
        });
        return newError;
    },

    escapeRegExpMetaChars: function (str) {
        return str.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
    },

    escapeChar: function (ch) {
        if (ch === '\t') {
            return '\\t';
        } else if (ch === '\r') {
            return '\\r';
        } else {
            var charCode = ch.charCodeAt(0);
            var hexChars = charCode.toString(16).toUpperCase();
            if (charCode < 256) {
                return '\\x' + utils.leftPad(hexChars, 2, '0');
            } else {
                return '\\u' + utils.leftPad(hexChars, 4, '0');
            }
        }
    },

    diffStrings: function (actual, expected, output, options) {
        options = options || {};
        var type = options.type || 'WordsWithSpace';

        function addStringToOutput(output, text, baseStyle, specialCharStyle) {
            if (options.markUpSpecialCharacters) {
                text.split(specialCharRegexp).forEach(function (part) {
                    if (specialCharRegexp.test(part)) {
                        output[specialCharStyle || baseStyle](utils.escapeChar(part));
                    } else {
                        output[baseStyle](part);
                    }
                });
            } else {
                output[baseStyle](text);
            }
            return output;
        }

        var diffLines = [];
        var lastPart;
        stringDiff.diffLines(actual, expected).forEach(function (part) {
            if (lastPart && lastPart.added && part.removed) {
                diffLines.push({
                    oldValue: part.value,
                    newValue: lastPart.value,
                    replaced: true
                });
                lastPart = null;
            } else if (lastPart) {
                diffLines.push(lastPart);
                lastPart = part;
            } else {
                lastPart = part;
            }
        });
        if (lastPart) {
            diffLines.push(lastPart);
        }

        diffLines.forEach(function (part, index) {
            var endsWithNewline = /\n$/.test(part.value);
            var value;
            if (part.replaced) {
                var oldLine = output.clone();
                var newLine = output.clone();
                var oldValue = part.oldValue;
                var newValue = part.newValue;
                var oldEndsWithNewline = oldValue.slice(-1) === '\n';
                var newEndsWithNewline = newValue.slice(-1) === '\n';
                if (oldEndsWithNewline) {
                    oldValue = oldValue.slice(0, -1);
                }
                if (newEndsWithNewline) {
                    newValue = newValue.slice(0, -1);
                }

                stringDiff['diff' + type](oldValue, newValue).forEach(function (part) {
                    if (part.added) {
                        addStringToOutput(newLine, part.value, 'diffAddedHighlight', 'diffAddedSpecialChar');
                    } else if (part.removed) {
                        addStringToOutput(oldLine, part.value, 'diffRemovedHighlight', 'diffRemovedSpecialChar');
                    } else {
                        newLine.diffAddedLine(part.value);
                        oldLine.diffRemovedLine(part.value);
                    }
                });
                oldLine.prependLinesWith(output.clone().diffRemovedLine('-'));
                newLine.prependLinesWith(output.clone().diffAddedLine('+'));

                if (oldEndsWithNewline && !newEndsWithNewline) {
                    oldLine.diffRemovedSpecialChar('\\n');
                }

                if (newEndsWithNewline && !oldEndsWithNewline) {
                    newLine.diffAddedSpecialChar('\\n');
                }

                output.append(oldLine).nl().append(newLine);
                if (oldEndsWithNewline && index < diffLines.length - 1) {
                    output.nl();
                }
            } else if (part.added) {
                value = endsWithNewline ?
                    part.value.slice(0, -1) :
                    part.value;

                output.append(function () {
                    addStringToOutput(this, value, 'diffAddedLine').prependLinesWith(function () {
                        this.diffAddedLine('+');
                    });
                });

                if (endsWithNewline) {
                    output.nl();
                }
            } else if (part.removed) {
                value = endsWithNewline ?
                    part.value.slice(0, -1) :
                    part.value;

                output.append(function () {
                    addStringToOutput(this, value, 'diffRemovedLine').prependLinesWith(function () {
                        this.diffRemovedLine('-');
                    });
                });

                if (endsWithNewline) {
                    output.nl();
                }
            } else {
                output.text(part.value.replace(/^(.)/gm, ' $1'));
            }
        });
        return output;
    },

    wrapConstructorNameAroundOutput: function (output, obj) {
        var constructorName = obj.constructor && obj.constructor !== Object && obj.constructor.name;
        if (constructorName && constructorName !== 'Object') {
            return output.clone().text(constructorName + '(').append(output).text(')');
        } else {
            return output;
        }
    }
};

},{}],8:[function(require,module,exports){
var Unexpected = require(2);

var unexpected = Unexpected.create();
var styles = require(5);
var types = require(6);
var assertions = require(3);

styles(unexpected);
types(unexpected);
assertions(unexpected);

module.exports = unexpected;

},{}],9:[function(require,module,exports){
var arrayDiff = require(10);

function extend(target) {
    for (var i = 1; i < arguments.length; i += 1) {
        var source = arguments[i];
        Object.keys(source).forEach(function (key) {
            target[key] = source[key];
        });
    }
    return target;
}

module.exports = function arrayChanges(actual, expected, equal, similar) {
    var mutatedArray = new Array(actual.length);

    for (var k = 0; k < actual.length; k += 1) {
        mutatedArray[k] = {
            type: 'similar',
            value: actual[k]
        };
    }

    if (mutatedArray.length > 0) {
        mutatedArray[mutatedArray.length - 1].last = true;
    }

    similar = similar || function (a, b) {
        return false;
    };

    var itemsDiff = arrayDiff(actual, expected, function (a, b) {
        return equal(a, b) || similar(a, b);
    });

    var removeTable = [];
    function offsetIndex(index) {
        return index + (removeTable[index - 1] || 0);
    }

    var removes = itemsDiff.filter(function (diffItem) {
        return diffItem.type === 'remove';
    });

    var removesByIndex = {};
    var removedItems = 0;
    removes.forEach(function (diffItem) {
        var removeIndex = removedItems + diffItem.index;
        mutatedArray.slice(removeIndex, diffItem.howMany + removeIndex).forEach(function (v) {
            v.type = 'remove';
        });
        removedItems += diffItem.howMany;
        removesByIndex[diffItem.index] = removedItems;
    });

    function updateRemoveTable() {
        removedItems = 0;
        actual.forEach(function (_, index) {
            removedItems += removesByIndex[index] || 0;
            removeTable[index] = removedItems;
        });
    }

    updateRemoveTable();

    var moves = itemsDiff.filter(function (diffItem) {
        return diffItem.type === 'move';
    });

    var movedItems = 0;
    moves.forEach(function (diffItem) {
        var moveFromIndex = offsetIndex(diffItem.from);
        var removed = mutatedArray.slice(moveFromIndex, diffItem.howMany + moveFromIndex);
        var added = removed.map(function (v) {
            return extend({}, v, { last: false, type: 'insert' });
        });
        removed.forEach(function (v) {
            v.type = 'remove';
        });
        Array.prototype.splice.apply(mutatedArray, [offsetIndex(diffItem.to), 0].concat(added));
        movedItems += diffItem.howMany;
        removesByIndex[diffItem.from] = movedItems;
        updateRemoveTable();
    });

    var inserts = itemsDiff.filter(function (diffItem) {
        return diffItem.type === 'insert';
    });

    inserts.forEach(function (diffItem) {
        var added = new Array(diffItem.values.length);
        for (var i = 0 ; i < diffItem.values.length ; i += 1) {
            added[i] = {
                type: 'insert',
                value: diffItem.values[i]
            };
        }
        Array.prototype.splice.apply(mutatedArray, [offsetIndex(diffItem.index), 0].concat(added));
    });

    var offset = 0;
    mutatedArray.forEach(function (diffItem, index) {
        var type = diffItem.type;
        if (type === 'remove') {
            offset -= 1;
        } else if (type === 'similar') {
            diffItem.expected = expected[offset + index];
        }
    });

    var conflicts = mutatedArray.reduce(function (conflicts, item) {
        return item.type === 'similar' ? conflicts : conflicts + 1;
    }, 0);

    for (var i = 0, c = 0; i < Math.max(actual.length, expected.length) &&  c <= conflicts; i += 1) {
        var expectedType = typeof expected[i];
        var actualType = typeof actual[i];

        if (
            actualType !== expectedType ||
                ((actualType === 'object' || actualType === 'string') && !similar(actual[i], expected[i])) ||
                (actualType !== 'object' && actualType !== 'string' && !equal(actual[i], expected[i]))
        ) {
            c += 1;
        }
    }

    if (c <= conflicts) {
        mutatedArray = [];
        var j;
        for (j = 0; j < Math.min(actual.length, expected.length); j += 1) {
            mutatedArray.push({
                type: 'similar',
                value: actual[j],
                expected: expected[j]
            });
        }

        if (actual.length < expected.length) {
            for (; j < Math.max(actual.length, expected.length); j += 1) {
                mutatedArray.push({
                    type: 'insert',
                    value: expected[j]
                });
            }
        } else {
            for (; j < Math.max(actual.length, expected.length); j += 1) {
                mutatedArray.push({
                    type: 'remove',
                    value: actual[j]
                });
            }
        }
        if (mutatedArray.length > 0) {
            mutatedArray[mutatedArray.length - 1].last = true;
        }
    }

    mutatedArray.forEach(function (diffItem) {
        if (diffItem.type === 'similar' && equal(diffItem.value, diffItem.expected)) {
            diffItem.type = 'equal';
        }
    });

    return mutatedArray;
};

},{}],10:[function(require,module,exports){
module.exports = arrayDiff;

// Based on some rough benchmarking, this algorithm is about O(2n) worst case,
// and it can compute diffs on random arrays of length 1024 in about 34ms,
// though just a few changes on an array of length 1024 takes about 0.5ms

arrayDiff.InsertDiff = InsertDiff;
arrayDiff.RemoveDiff = RemoveDiff;
arrayDiff.MoveDiff = MoveDiff;

function InsertDiff(index, values) {
  this.index = index;
  this.values = values;
}
InsertDiff.prototype.type = 'insert';
InsertDiff.prototype.toJSON = function() {
  return {
    type: this.type
  , index: this.index
  , values: this.values
  };
};

function RemoveDiff(index, howMany) {
  this.index = index;
  this.howMany = howMany;
}
RemoveDiff.prototype.type = 'remove';
RemoveDiff.prototype.toJSON = function() {
  return {
    type: this.type
  , index: this.index
  , howMany: this.howMany
  };
};

function MoveDiff(from, to, howMany) {
  this.from = from;
  this.to = to;
  this.howMany = howMany;
}
MoveDiff.prototype.type = 'move';
MoveDiff.prototype.toJSON = function() {
  return {
    type: this.type
  , from: this.from
  , to: this.to
  , howMany: this.howMany
  };
};

function strictEqual(a, b) {
  return a === b;
}

function arrayDiff(before, after, equalFn) {
  if (!equalFn) equalFn = strictEqual;

  // Find all items in both the before and after array, and represent them
  // as moves. Many of these "moves" may end up being discarded in the last
  // pass if they are from an index to the same index, but we don't know this
  // up front, since we haven't yet offset the indices.
  // 
  // Also keep a map of all the indicies accounted for in the before and after
  // arrays. These maps are used next to create insert and remove diffs.
  var beforeLength = before.length;
  var afterLength = after.length;
  var moves = [];
  var beforeMarked = {};
  var afterMarked = {};
  for (var beforeIndex = 0; beforeIndex < beforeLength; beforeIndex++) {
    var beforeItem = before[beforeIndex];
    for (var afterIndex = 0; afterIndex < afterLength; afterIndex++) {
      if (afterMarked[afterIndex]) continue;
      if (!equalFn(beforeItem, after[afterIndex])) continue;
      var from = beforeIndex;
      var to = afterIndex;
      var howMany = 0;
      do {
        beforeMarked[beforeIndex++] = afterMarked[afterIndex++] = true;
        howMany++;
      } while (
        beforeIndex < beforeLength &&
        afterIndex < afterLength &&
        equalFn(before[beforeIndex], after[afterIndex]) &&
        !afterMarked[afterIndex]
      );
      moves.push(new MoveDiff(from, to, howMany));
      beforeIndex--;
      break;
    }
  }

  // Create a remove for all of the items in the before array that were
  // not marked as being matched in the after array as well
  var removes = [];
  for (beforeIndex = 0; beforeIndex < beforeLength;) {
    if (beforeMarked[beforeIndex]) {
      beforeIndex++;
      continue;
    }
    var index = beforeIndex;
    var howMany = 0;
    while (beforeIndex < beforeLength && !beforeMarked[beforeIndex++]) {
      howMany++;
    }
    removes.push(new RemoveDiff(index, howMany));
  }

  // Create an insert for all of the items in the after array that were
  // not marked as being matched in the before array as well
  var inserts = [];
  for (afterIndex = 0; afterIndex < afterLength;) {
    if (afterMarked[afterIndex]) {
      afterIndex++;
      continue;
    }
    var index = afterIndex;
    var howMany = 0;
    while (afterIndex < afterLength && !afterMarked[afterIndex++]) {
      howMany++;
    }
    var values = after.slice(index, index + howMany);
    inserts.push(new InsertDiff(index, values));
  }

  var insertsLength = inserts.length;
  var removesLength = removes.length;
  var movesLength = moves.length;
  var i, j;

  // Offset subsequent removes and moves by removes
  var count = 0;
  for (i = 0; i < removesLength; i++) {
    var remove = removes[i];
    remove.index -= count;
    count += remove.howMany;
    for (j = 0; j < movesLength; j++) {
      var move = moves[j];
      if (move.from >= remove.index) move.from -= remove.howMany;
    }
  }

  // Offset moves by inserts
  for (i = insertsLength; i--;) {
    var insert = inserts[i];
    var howMany = insert.values.length;
    for (j = movesLength; j--;) {
      var move = moves[j];
      if (move.to >= insert.index) move.to -= howMany;
    }
  }

  // Offset the to of moves by later moves
  for (i = movesLength; i-- > 1;) {
    var move = moves[i];
    if (move.to === move.from) continue;
    for (j = i; j--;) {
      var earlier = moves[j];
      if (earlier.to >= move.to) earlier.to -= move.howMany;
      if (earlier.to >= move.from) earlier.to += move.howMany;
    }
  }

  // Only output moves that end up having an effect after offsetting
  var outputMoves = [];

  // Offset the from of moves by earlier moves
  for (i = 0; i < movesLength; i++) {
    var move = moves[i];
    if (move.to === move.from) continue;
    outputMoves.push(move);
    for (j = i + 1; j < movesLength; j++) {
      var later = moves[j];
      if (later.from >= move.from) later.from -= move.howMany;
      if (later.from >= move.to) later.from += move.howMany;
    }
  }

  return removes.concat(outputMoves, inserts);
}

},{}],11:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require(12)
var ieee754 = require(13)
var isArray = require(14)

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{}],12:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],13:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],14:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],16:[function(require,module,exports){
/* See LICENSE file for terms of use */

/*
 * Text diff implementation.
 *
 * This library supports the following APIS:
 * JsDiff.diffChars: Character by character diff
 * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
 * JsDiff.diffLines: Line based diff
 *
 * JsDiff.diffCss: Diff targeted at CSS content
 *
 * These methods are based on the implementation proposed in
 * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
 */
(function(global, undefined) {
  var JsDiff = (function() {
    /*jshint maxparams: 5*/
    function map(arr, mapper, that) {
      if (Array.prototype.map) {
        return Array.prototype.map.call(arr, mapper, that);
      }

      var other = new Array(arr.length);

      for (var i = 0, n = arr.length; i < n; i++) {
        other[i] = mapper.call(that, arr[i], i, arr);
      }
      return other;
    }
    function clonePath(path) {
      return { newPos: path.newPos, components: path.components.slice(0) };
    }
    function removeEmpty(array) {
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        if (array[i]) {
          ret.push(array[i]);
        }
      }
      return ret;
    }
    function escapeHTML(s) {
      var n = s;
      n = n.replace(/&/g, '&amp;');
      n = n.replace(/</g, '&lt;');
      n = n.replace(/>/g, '&gt;');
      n = n.replace(/"/g, '&quot;');

      return n;
    }

    var Diff = function(ignoreWhitespace) {
      this.ignoreWhitespace = ignoreWhitespace;
    };
    Diff.prototype = {
        diff: function(oldString, newString) {
          // Handle the identity case (this is due to unrolling editLength == 0
          if (newString === oldString) {
            return [{ value: newString }];
          }
          if (!newString) {
            return [{ value: oldString, removed: true }];
          }
          if (!oldString) {
            return [{ value: newString, added: true }];
          }

          newString = this.tokenize(newString);
          oldString = this.tokenize(oldString);

          var newLen = newString.length, oldLen = oldString.length;
          var maxEditLength = newLen + oldLen;
          var bestPath = [{ newPos: -1, components: [] }];

          // Seed editLength = 0
          var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
          if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {
            return bestPath[0].components;
          }

          for (var editLength = 1; editLength <= maxEditLength; editLength++) {
            for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {
              var basePath;
              var addPath = bestPath[diagonalPath-1],
                  removePath = bestPath[diagonalPath+1];
              oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
              if (addPath) {
                // No one else is going to attempt to use this value, clear it
                bestPath[diagonalPath-1] = undefined;
              }

              var canAdd = addPath && addPath.newPos+1 < newLen;
              var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
              if (!canAdd && !canRemove) {
                bestPath[diagonalPath] = undefined;
                continue;
              }

              // Select the diagonal that we want to branch from. We select the prior
              // path whose position in the new string is the farthest from the origin
              // and does not pass the bounds of the diff graph
              if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
                basePath = clonePath(removePath);
                this.pushComponent(basePath.components, oldString[oldPos], undefined, true);
              } else {
                basePath = clonePath(addPath);
                basePath.newPos++;
                this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined);
              }

              var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);

              if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {
                return basePath.components;
              } else {
                bestPath[diagonalPath] = basePath;
              }
            }
          }
        },

        pushComponent: function(components, value, added, removed) {
          var last = components[components.length-1];
          if (last && last.added === added && last.removed === removed) {
            // We need to clone here as the component clone operation is just
            // as shallow array clone
            components[components.length-1] =
              {value: this.join(last.value, value), added: added, removed: removed };
          } else {
            components.push({value: value, added: added, removed: removed });
          }
        },
        extractCommon: function(basePath, newString, oldString, diagonalPath) {
          var newLen = newString.length,
              oldLen = oldString.length,
              newPos = basePath.newPos,
              oldPos = newPos - diagonalPath;
          while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {
            newPos++;
            oldPos++;

            this.pushComponent(basePath.components, newString[newPos], undefined, undefined);
          }
          basePath.newPos = newPos;
          return oldPos;
        },

        equals: function(left, right) {
          var reWhitespace = /\S/;
          if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {
            return true;
          } else {
            return left === right;
          }
        },
        join: function(left, right) {
          return left + right;
        },
        tokenize: function(value) {
          return value;
        }
    };

    var CharDiff = new Diff();

    var WordDiff = new Diff(true);
    var WordWithSpaceDiff = new Diff();
    WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {
      return removeEmpty(value.split(/(\s+|\b)/));
    };

    var CssDiff = new Diff(true);
    CssDiff.tokenize = function(value) {
      return removeEmpty(value.split(/([{}:;,]|\s+)/));
    };

    var LineDiff = new Diff();
    LineDiff.tokenize = function(value) {
      var retLines = [],
          lines = value.split(/^/m);

      for(var i = 0; i < lines.length; i++) {
        var line = lines[i],
            lastLine = lines[i - 1];

        // Merge lines that may contain windows new lines
        if (line == '\n' && lastLine && lastLine[lastLine.length - 1] === '\r') {
          retLines[retLines.length - 1] += '\n';
        } else if (line) {
          retLines.push(line);
        }
      }

      return retLines;
    };

    return {
      Diff: Diff,

      diffChars: function(oldStr, newStr) { return CharDiff.diff(oldStr, newStr); },
      diffWords: function(oldStr, newStr) { return WordDiff.diff(oldStr, newStr); },
      diffWordsWithSpace: function(oldStr, newStr) { return WordWithSpaceDiff.diff(oldStr, newStr); },
      diffLines: function(oldStr, newStr) { return LineDiff.diff(oldStr, newStr); },

      diffCss: function(oldStr, newStr) { return CssDiff.diff(oldStr, newStr); },

      createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {
        var ret = [];

        ret.push('Index: ' + fileName);
        ret.push('===================================================================');
        ret.push('--- ' + fileName + (typeof oldHeader === 'undefined' ? '' : '\t' + oldHeader));
        ret.push('+++ ' + fileName + (typeof newHeader === 'undefined' ? '' : '\t' + newHeader));

        var diff = LineDiff.diff(oldStr, newStr);
        if (!diff[diff.length-1].value) {
          diff.pop();   // Remove trailing newline add
        }
        diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier

        function contextLines(lines) {
          return map(lines, function(entry) { return ' ' + entry; });
        }
        function eofNL(curRange, i, current) {
          var last = diff[diff.length-2],
              isLast = i === diff.length-2,
              isLastOfType = i === diff.length-3 && (current.added !== last.added || current.removed !== last.removed);

          // Figure out if this is the last line for the given file and missing NL
          if (!/\n$/.test(current.value) && (isLast || isLastOfType)) {
            curRange.push('\\ No newline at end of file');
          }
        }

        var oldRangeStart = 0, newRangeStart = 0, curRange = [],
            oldLine = 1, newLine = 1;
        for (var i = 0; i < diff.length; i++) {
          var current = diff[i],
              lines = current.lines || current.value.replace(/\n$/, '').split('\n');
          current.lines = lines;

          if (current.added || current.removed) {
            if (!oldRangeStart) {
              var prev = diff[i-1];
              oldRangeStart = oldLine;
              newRangeStart = newLine;

              if (prev) {
                curRange = contextLines(prev.lines.slice(-4));
                oldRangeStart -= curRange.length;
                newRangeStart -= curRange.length;
              }
            }
            curRange.push.apply(curRange, map(lines, function(entry) { return (current.added?'+':'-') + entry; }));
            eofNL(curRange, i, current);

            if (current.added) {
              newLine += lines.length;
            } else {
              oldLine += lines.length;
            }
          } else {
            if (oldRangeStart) {
              // Close out any changes that have been output (or join overlapping)
              if (lines.length <= 8 && i < diff.length-2) {
                // Overlapping
                curRange.push.apply(curRange, contextLines(lines));
              } else {
                // end the range and output
                var contextSize = Math.min(lines.length, 4);
                ret.push(
                    '@@ -' + oldRangeStart + ',' + (oldLine-oldRangeStart+contextSize)
                    + ' +' + newRangeStart + ',' + (newLine-newRangeStart+contextSize)
                    + ' @@');
                ret.push.apply(ret, curRange);
                ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));
                if (lines.length <= 4) {
                  eofNL(ret, i, current);
                }

                oldRangeStart = 0;  newRangeStart = 0; curRange = [];
              }
            }
            oldLine += lines.length;
            newLine += lines.length;
          }
        }

        return ret.join('\n') + '\n';
      },

      applyPatch: function(oldStr, uniDiff) {
        var diffstr = uniDiff.split('\n');
        var diff = [];
        var remEOFNL = false,
            addEOFNL = false;

        for (var i = (diffstr[0][0]==='I'?4:0); i < diffstr.length; i++) {
          if(diffstr[i][0] === '@') {
            var meh = diffstr[i].split(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
            diff.unshift({
              start:meh[3],
              oldlength:meh[2],
              oldlines:[],
              newlength:meh[4],
              newlines:[]
            });
          } else if(diffstr[i][0] === '+') {
            diff[0].newlines.push(diffstr[i].substr(1));
          } else if(diffstr[i][0] === '-') {
            diff[0].oldlines.push(diffstr[i].substr(1));
          } else if(diffstr[i][0] === ' ') {
            diff[0].newlines.push(diffstr[i].substr(1));
            diff[0].oldlines.push(diffstr[i].substr(1));
          } else if(diffstr[i][0] === '\\') {
            if (diffstr[i-1][0] === '+') {
              remEOFNL = true;
            } else if(diffstr[i-1][0] === '-') {
              addEOFNL = true;
            }
          }
        }

        var str = oldStr.split('\n');
        for (var i = diff.length - 1; i >= 0; i--) {
          var d = diff[i];
          for (var j = 0; j < d.oldlength; j++) {
            if(str[d.start-1+j] !== d.oldlines[j]) {
              return false;
            }
          }
          Array.prototype.splice.apply(str,[d.start-1,+d.oldlength].concat(d.newlines));
        }

        if (remEOFNL) {
          while (!str[str.length-1]) {
            str.pop();
          }
        } else if (addEOFNL) {
          str.push('');
        }
        return str.join('\n');
      },

      convertChangesToXML: function(changes){
        var ret = [];
        for ( var i = 0; i < changes.length; i++) {
          var change = changes[i];
          if (change.added) {
            ret.push('<ins>');
          } else if (change.removed) {
            ret.push('<del>');
          }

          ret.push(escapeHTML(change.value));

          if (change.added) {
            ret.push('</ins>');
          } else if (change.removed) {
            ret.push('</del>');
          }
        }
        return ret.join('');
      },

      // See: http://code.google.com/p/google-diff-match-patch/wiki/API
      convertChangesToDMP: function(changes){
        var ret = [], change;
        for ( var i = 0; i < changes.length; i++) {
          change = changes[i];
          ret.push([(change.added ? 1 : change.removed ? -1 : 0), change.value]);
        }
        return ret;
      }
    };
  })();

  if (typeof module !== 'undefined') {
      module.exports = JsDiff;
  }
  else if (typeof define === 'function') {
    define([], function() { return JsDiff; });
  }
  else if (typeof global.JsDiff === 'undefined') {
    global.JsDiff = JsDiff;
  }
})(this);

},{}],17:[function(require,module,exports){
// intentionally commented out as it makes it slower...
//'use strict';

var arr = [];

module.exports = function (a, b) {
	if (a === b) {
		return 0;
	}

	var aLen = a.length;
	var bLen = b.length;

	if (aLen === 0) {
		return b.length;
	}

	if (bLen === 0) {
		return a.length;
	}

	var bCharCode;
	var ret;
	var tmp;
	var tmp2;
	var i = 0;
	var j = 0;

	while (i < aLen) {
		arr[i] = ++i;
	}

	while (j < bLen) {
		bCharCode = b.charCodeAt(j);
		tmp = j++;
		ret = j;

		for (i = 0; i < aLen; i++) {
			tmp2 = bCharCode === a.charCodeAt(i) ? tmp : tmp + 1;
			tmp = arr[i];
			ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
		}
	}

	return ret;
};

},{}],18:[function(require,module,exports){
var utils = require(28);
var TextSerializer = require(22);
var colorDiff = require(32);
var rgbRegexp = require(26);
var themeMapper = require(27);

var cacheSize = 0;
var maxColorCacheSize = 1024;

var ansiStyles = utils.extend({}, require(29));
Object.keys(ansiStyles).forEach(function (styleName) {
    ansiStyles[styleName.toLowerCase()] = ansiStyles[styleName];
});

function AnsiSerializer(theme) {
    this.theme = theme;
}

AnsiSerializer.prototype = new TextSerializer();

var colorPalettes = {
    16: {
        '#000000': 'black',
        '#ff0000': 'red',
        '#00ff00': 'green',
        '#ffff00': 'yellow',
        '#0000ff': 'blue',
        '#ff00ff': 'magenta',
        '#00ffff': 'cyan',
        '#ffffff': 'white',
        '#808080': 'gray'
    },
    256: {}
};

var diffPalettes = {};

function convertColorToObject(color) {
    if (color.length < 6) {
        // Allow CSS shorthand
        color = color.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i, '$1$1$2$2$3$3');
    }
    // Split color into red, green, and blue components
    var hexMatch = color.match(/^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i);
    if (hexMatch) {
        return {
            R: parseInt(hexMatch[1], 16),
            G: parseInt(hexMatch[2], 16),
            B: parseInt(hexMatch[3], 16)
        };
    }
}

function toHexColor(colorObject) {
    var hexString = (Math.round(colorObject.R) * 0x10000 + Math.round(colorObject.G) * 0x100 + Math.round(colorObject.B)).toString(16);
    return '#' + ('00000'.substr(0, 6 - hexString.length)) + hexString;
}

function firstUp(text) {
    return text.substring(0, 1).toUpperCase() + text.substring(1);
}

diffPalettes[16] = Object.keys(colorPalettes[16]).map(convertColorToObject);
diffPalettes['bg16'] = Object.keys(colorPalettes[16]).filter(function (color) {
    return color !== "#808080";
}).map(convertColorToObject);
diffPalettes[256] = [].concat(diffPalettes[16]);
var nextAnsiColorNumber = 16;
function registerNext256PaletteEntry(obj) {
    diffPalettes[256].push(obj);
    colorPalettes[256][toHexColor(obj)] = nextAnsiColorNumber;
    nextAnsiColorNumber += 1;
}

for (var r = 0 ; r < 6 ; r += 1) {
    for (var g = 0 ; g < 6 ; g += 1) {
        for (var b = 0 ; b < 6 ; b += 1) {
            registerNext256PaletteEntry({
                R: Math.round(r * 256 / 6),
                G: Math.round(g * 256 / 6),
                B: Math.round(b * 256 / 6)
            });
        }
    }
}

[
    0x08, 0x12, 0x1c, 0x26, 0x30, 0x3a, 0x44, 0x4e, 0x58, 0x60, 0x66, 0x76,
    0x80, 0x8a, 0x94, 0x9e, 0xa8, 0xb2, 0xbc, 0xc6, 0xd0, 0xda, 0xe4, 0xee
].forEach(function (value) {
    registerNext256PaletteEntry({R: value, G: value, B: value});
});

AnsiSerializer.prototype.text = function () {
    var args = themeMapper(this.theme, arguments);

    var content = args[0];
    if (args.length > 1) {
        for (var i = args.length -1; i > 0; i -= 1) {
            var styleName = args[i];

            if (ansiStyles[styleName]) {
                content = ansiStyles[styleName].open + content + ansiStyles[styleName].close;
            } else if (rgbRegexp.test(styleName)) {
                var originalStyleName = styleName;
                var isBackgroundColor = styleName.substring(0, 2) === 'bg';
                var colorName = isBackgroundColor ? styleName.substring(2) : styleName;

                var color16Hex = toHexColor(colorDiff.closest(convertColorToObject(colorName),
                                                              diffPalettes[isBackgroundColor ? 'bg16' : 16]));
                var closestColor16 = colorPalettes[16][color16Hex];

                var color256Hex = toHexColor(colorDiff.closest(convertColorToObject(colorName), diffPalettes[256]));
                var closest256ColorIndex = colorPalettes[256][color256Hex];

                if (isBackgroundColor) {
                    styleName = 'bg' + firstUp(closestColor16);
                } else {
                    styleName = closestColor16;
                }

                var open = ansiStyles[styleName].open;
                var close = ansiStyles[styleName].close;
                if (color16Hex !== color256Hex) {
                    open += '\x1b[' + (isBackgroundColor ? 48 : 38) + ';5;' + closest256ColorIndex + 'm';
                }
                if (cacheSize < maxColorCacheSize) {
                    ansiStyles[originalStyleName] = {open: open, close: close};
                    cacheSize += 1;
                }

                content = open + content + close;
            }
        }
    }

    return content;
};

module.exports = AnsiSerializer;

},{}],19:[function(require,module,exports){
var cssStyles = require(23);
var flattenBlocksInLines = require(25);
var rgbRegexp = require(26);
var themeMapper = require(27);

function ColoredConsoleSerializer(theme) {
    this.theme = theme;
}

ColoredConsoleSerializer.prototype.serialize = function (lines) {
    var formatString = '';
    var styleStrings = [];
    this.serializeLines(flattenBlocksInLines(lines)).forEach(function (entry) {
        if (entry) {
            formatString += entry[0];
            if (entry.length > 1) {
                styleStrings.push(entry[1]);
            }
        }
    });
    return [formatString].concat(styleStrings);
};

ColoredConsoleSerializer.prototype.serializeLines = function (lines) {
    var result = [];
    lines.forEach(function (line, i) {
        if (i > 0) {
            result.push(['%c\n ', '']);
        }
        Array.prototype.push.apply(result, this.serializeLine(line));
    }, this);
    return result;
};

ColoredConsoleSerializer.prototype.serializeLine = function (line) {
    var result = [];
    line.forEach(function (outputEntry) {
        if (this[outputEntry.style]) {
            result.push(this[outputEntry.style].apply(this, outputEntry.args));
        }
    }, this);
    return result;
};

ColoredConsoleSerializer.prototype.block = function (content) {
    return this.serializeLines(content);
};

ColoredConsoleSerializer.prototype.text = function () {
    var args = themeMapper(this.theme, arguments);
    var content = String(args[0]);
    if (content === '') {
        return null;
    }

    var result = ['%c' + content.replace(/%/g, '%%')];
    var styleProperties = [];

    if (args.length > 1) {
        for (var i = 1; i < args.length; i += 1) {
            var styleName = args[i];
            if (rgbRegexp.test(styleName)) {
                if (styleName.substring(0, 2) === 'bg') {
                    styleProperties.push('background-color: ' + styleName.substring(2));
                } else {
                    styleProperties.push('color: ' + styleName);
                }
            } else if (cssStyles[styleName]) {
                styleProperties.push(cssStyles[styleName]);
            }
        }
    }
    result.push(styleProperties.join('; '));
    return result;
};

module.exports = ColoredConsoleSerializer;

},{}],20:[function(require,module,exports){
var cssStyles = require(23);
var rgbRegexp = require(26);
var themeMapper = require(27);

function HtmlSerializer(theme) {
    this.theme = theme;
}

HtmlSerializer.prototype.serialize = function (lines) {
    return '<div style="font-family: monospace; white-space: nowrap">\n' + this.serializeLines(lines) + '\n</div>';
};

HtmlSerializer.prototype.serializeLines = function (lines) {
    return lines.map(function (line) {
        return '  <div>' + (this.serializeLine(line).join('') || '&nbsp;') + '</div>';
    }, this).join('\n');
};

HtmlSerializer.prototype.serializeLine = function (line) {
    return line.map(function (outputEntry) {
        return this[outputEntry.style] ?
            this[outputEntry.style].apply(this, outputEntry.args) :
            '';
    }, this);
};

HtmlSerializer.prototype.block = function (content) {
    return '<div style="display: inline-block; vertical-align: top">\n' +
        this.serializeLines(content) +
        '\n</div>';
};

HtmlSerializer.prototype.text = function () {
    var args = themeMapper(this.theme, arguments);

    var content = String(args[0])
        .replace(/&/g, '&amp;')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    if (args.length > 1) {
        var styleProperties = [];
        for (var j = 1; j < args.length; j += 1) {
            var styleName = args[j];
            if (rgbRegexp.test(styleName)) {
                if (styleName.substring(0, 2) === 'bg') {
                    styleProperties.push('background-color: ' + styleName.substring(2));
                } else {
                    styleProperties.push('color: ' + styleName);
                }
            } else if (cssStyles[styleName]) {
                styleProperties.push(cssStyles[styleName]);
            }

        }

        if (styleProperties.length > 0) {
            content = '<span style="' + styleProperties.join('; ') + '">' + content + '</span>';
        }
    }
    return content;
};

module.exports = HtmlSerializer;

},{}],21:[function(require,module,exports){
/*global window*/
var utils = require(28);
var extend = utils.extend;
var duplicateText = require(24);
var rgbRegexp = require(26);
var cssStyles = require(23);

function MagicPen(options) {
    if (!(this instanceof MagicPen)) {
        return new MagicPen(options);
    }

    options = options || {};

    var indentationWidth = 'indentationWidth' in options ?
        options.indentationWidth : 2;
    this.indentationWidth = Math.max(indentationWidth, 0);

    this.indentationLevel = 0;
    this.output = [[]];
    this.styles = {};
    this.installedPlugins = [];
    this._themes = {};
}

if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    if (window.mochaPhantomJS || (window.__karma__ && window.__karma__.config.captureConsole)) {
        MagicPen.defaultFormat = 'ansi'; // colored console
    } else {
        MagicPen.defaultFormat = 'html'; // Browser
    }
} else if (require(34)) {
    MagicPen.defaultFormat = 'ansi'; // colored console
} else {
    MagicPen.defaultFormat = 'text'; // Plain text
}

MagicPen.prototype.newline = MagicPen.prototype.nl = function (count) {
    if (typeof count === 'undefined') {
        count = 1;
    }

    if (count === 0) {
        return this;
    }

    for (var i = 0; i < count; i += 1) {
        this.output.push([]);
    }
    return this;
};

MagicPen.serializers = {
    text: require(22),
    html: require(20),
    ansi: require(18),
    coloredConsole: require(19)
};

function hasSameTextStyling(a, b) {
    if (!a || !b || a.style !== 'text' || b.style !== 'text') {
        return false;
    }

    return utils.arrayEquals(Array.prototype.slice.call(a.args, 1),
                             Array.prototype.slice.call(b.args, 1));
}

function normalizeLine(line) {
    if (line.length === 0) {
        return line;
    }

    var result = [line[0]];
    for (var i = 1; i < line.length; i += 1) {
        var lastEntry = result[result.length - 1];
        var entry = line[i];
        if (entry.style === 'text' && entry.args[0] === '') {
            continue;
        }

        if (hasSameTextStyling(lastEntry, entry)) {
            result[result.length - 1] = {
                style: entry.style,
                args: [lastEntry.args[0] + entry.args[0]].concat(entry.args.slice(1))
            };
        } else {
            result.push(entry);
        }
    }

    return result;
}

MagicPen.prototype.write = function (options) {
    if (this.styles[options.style]) {
        this.styles[options.style].apply(this, options.args);
        return this;
    }
    var lastLine = this.output[this.output.length - 1];
    var lastEntry = lastLine[lastLine.length - 1];
    if (hasSameTextStyling(lastEntry, options)) {
        options.args[0] = lastEntry.args[0] + options.args[0];
        lastLine[lastLine.length - 1] = options;
    } else {
        lastLine.push(options);
    }

    return this;
};

MagicPen.prototype.indentLines = function () {
    this.indentationLevel += 1;
    return this;
};

MagicPen.prototype.indent = MagicPen.prototype.i = function () {
    for (var i = 0; i < this.indentationLevel; i += 1) {
        this.space(this.indentationWidth);
    }
    return this;
};

MagicPen.prototype.outdentLines = function () {
    this.indentationLevel = Math.max(0, this.indentationLevel - 1);
    return this;
};

MagicPen.prototype.addStyle = function (style, handler, allowRedefinition) {
    if (this[style] && !allowRedefinition) {
        throw new Error('"' + style + '" style is already defined, set 3rd arg (allowRedefinition) to true to define it anyway');
    }
    this.styles[style] = handler;
    this[style] = function () {
        handler.apply(this, arguments);
        return this;
    };
    return this;
};

MagicPen.prototype.toString = function (format) {
    format = format || 'text';
    if (format === 'auto') {
        format = MagicPen.defaultFormat;
    }
    var theme = this._themes[format] || {};
    var serializer = new MagicPen.serializers[format](theme);
    return serializer.serialize(this.output);
};

MagicPen.prototype.text = function () {
    var content = arguments[0];
    if (content === '') {
        return this;
    }

    var args = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i += 1) {
        args[i] = arguments[i];
    }
    content = String(content);
    if (content.indexOf('\n') !== -1) {
        args = args.slice(1);
        var lines = content.split(/\n/);
        lines.forEach(function (lineContent, index) {
            if (lineContent.length) {
                this.write({ style: 'text', args: [lineContent].concat(args) });
            }
            if (index < lines.length - 1) {
                this.nl();
            }
        }, this);
        return this;
    } else {
        return this.write({ style: 'text', args: args });
    }
};

MagicPen.prototype.removeFormatting = function () {
    var result = this.clone();
    this.output.forEach(function (line, index) {
        result.output[index] = normalizeLine(line.map(function (outputEntry) {
            return outputEntry.style === 'text' ?
                { style: 'text', args: [outputEntry.args[0]] } :
                outputEntry;
        }));
    });
    result.indentationLevel = this.indentationLevel;
    return result;
};

MagicPen.prototype.getContentFromArguments = function (args) {
    var clone;
    if (args[0].isMagicPen) {
        return args[0];
    } else if (typeof args[0] === 'function') {
        clone = this.clone();
        args[0].call(clone, clone);
        return clone;
    } else if (typeof args[0] === 'string') {
        clone = this.clone();
        clone[args[0]].apply(clone, Array.prototype.slice.call(args, 1));
        return clone;
    } else {
        throw new Error('Requires the arguments to be:\n' +
                        'a pen or\n' +
                        'a callback append content to a penor\n' +
                        'a style and arguments for that style');
    }
};

MagicPen.prototype.block = function () {
    var pen = this.getContentFromArguments(arguments);

    var blockOutput = pen.output.map(function (line) {
        return [].concat(line);
    });
    return this.write({ style: 'block', args: [blockOutput] });
};

function amend(output, pen) {
    var lastLine = output[output.length - 1].slice();
    var newOutput = output.slice(0, -1);
    var lastEntry = lastLine[lastLine.length - 1];
    if (lastEntry && lastEntry.style === 'block') {
        lastLine[lastLine.length - 1] = {
            style: 'block',
            args: [amend(lastEntry.args[0], pen)]
        };
        newOutput[output.length - 1] = lastLine;
    } else {
        Array.prototype.push.apply(lastLine, pen.output[0]);
        newOutput[output.length - 1] = normalizeLine(lastLine);
        newOutput.push.apply(newOutput, pen.output.slice(1));
    }

    return newOutput;
}

MagicPen.prototype.amend = function () {
    var pen = this.getContentFromArguments(arguments);

    if (pen.isEmpty()) {
        return this;
    }

    this.output = amend(this.output, pen);

    return this;
};

MagicPen.prototype.append = function () {
    var pen = this.getContentFromArguments(arguments);

    if (pen.isEmpty()) {
        return this;
    }

    var lastLine = this.output[this.output.length - 1];
    Array.prototype.push.apply(lastLine, pen.output[0]);
    this.output[this.output.length - 1] = normalizeLine(lastLine);

    this.output.push.apply(this.output, pen.output.slice(1));

    return this;
};

MagicPen.prototype.prependLinesWith = function () {
    var pen = this.getContentFromArguments(arguments);

    if (pen.isEmpty()) {
        return this;
    }

    if (pen.output.length > 1) {
        throw new Error('PrependLinesWith only supports a pen with single line content');
    }

    var height = this.size().height;
    var output = this.clone();
    output.block(function () {
        for (var i = 0; i < height; i += 1) {
            if (0 < i) {
                this.nl();
            }
            this.append(pen);
        }
    });
    output.block(this);

    this.output = output.output;
    return this;
};

MagicPen.prototype.space = MagicPen.prototype.sp = function (count) {
    if (count === 0) {
        return this;
    }

    if (typeof count === 'undefined') {
        count = 1;
    }

    this.text(duplicateText(' ', count));
    return this;
};

[
    'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden',
    'strikeThrough', 'black', 'red', 'green', 'yellow', 'blue',
    'magenta', 'cyan', 'white', 'gray', 'bgBlack', 'bgRed',
    'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan',
    'bgWhite'
].forEach(function (textStyle) {
    MagicPen.prototype[textStyle] = MagicPen.prototype[textStyle.toLowerCase()] = function (content) {
        return this.text.call(this, content, textStyle);
    };
});

MagicPen.prototype.clone = function () {
    function MagicPenClone() {}
    MagicPenClone.prototype = this;
    var clonedPen = new MagicPenClone();
    clonedPen.styles = extend({}, this.styles);
    clonedPen.indentationLevel = 0;
    clonedPen.output = [[]];
    clonedPen.installedPlugins = [].concat(this.installedPlugins);
    clonedPen._themes = this._themes;
    return clonedPen;
};

MagicPen.prototype.isMagicPen = true;

MagicPen.prototype.size = function () {
    return utils.calculateSize(this.output);
};

MagicPen.prototype.installPlugin = function (plugin) {
    var alreadyInstalled = this.installedPlugins.some(function (installedPlugin) {
        return installedPlugin === plugin.name;
    });

    if (alreadyInstalled) {
        return;
    }

    if (typeof plugin !== 'object' ||
        typeof plugin.name !== 'string' ||
        typeof plugin.installInto !== 'function' ||
        (plugin.dependencies && !Array.isArray(plugin.dependencies))) {
        throw new Error('Plugins must adhere to the following interface\n' +
                        '{\n' +
                        '  name: <plugin name>,\n' +
                        '  dependencies: <an optional list of dependencies>,\n' +
                        '  installInto: <a function that will update the given magicpen instance>\n' +
                        '}');
    }

    if (plugin.dependencies) {
        var installedPlugins = this.installedPlugins;
        var unfulfilledDependencies = plugin.dependencies.filter(function (dependency) {
            return !installedPlugins.some(function (plugin) {
                return plugin === dependency;
            });
        });

        if (unfulfilledDependencies.length === 1) {
            throw new Error(plugin.name + ' requires plugin ' + unfulfilledDependencies[0]);
        } else if (unfulfilledDependencies.length > 1) {
            throw new Error(plugin.name + ' requires plugins ' +
                            unfulfilledDependencies.slice(0, -1).join(', ') +
                            ' and ' + unfulfilledDependencies[unfulfilledDependencies.length - 1]);
        }
    }

    this.installedPlugins.push(plugin.name);
    plugin.installInto(this);

    return this; // for chaining
};

function replaceText(output, outputArray, regexp, cb) {
    var replacedOutput = output;
    outputArray.forEach(function (line, i) {
        if (0 < i) {
            replacedOutput.nl();
        }

        line.forEach(function (outputEntry, j) {
            if (outputEntry.style === 'block') {
                return replacedOutput.output[replacedOutput.output.length - 1].push({
                    style: 'block',
                    args: [replaceText(output.clone(), outputEntry.args[0], regexp, cb)]
                });
            } else if (outputEntry.style !== 'text') {
                return replacedOutput.output[replacedOutput.output.length - 1].push(outputEntry);
            }

            if (regexp.global) {
                regexp.lastIndex = 0;
            }
            var styles = outputEntry.args.slice(1);
            var m;
            var first = true;
            var lastIndex = 0;
            var text = outputEntry.args[0];
            while ((m = regexp.exec(text)) !== null && (regexp.global || first)) {
                if (lastIndex < m.index) {
                    replacedOutput.text.apply(replacedOutput, [text.substring(lastIndex, m.index)].concat(styles));
                }

                cb.apply(replacedOutput, [styles].concat(m));
                first = false;
                lastIndex = m.index + m[0].length;
            }

            if (lastIndex === 0) {
                var lastLine;
                if (replacedOutput.output.length === 0) {
                    lastLine = replacedOutput.output[0] = [];
                } else {
                    lastLine = replacedOutput.output[replacedOutput.output.length - 1];
                }

                lastLine.push(outputEntry);
            } else if (lastIndex < text.length) {
                replacedOutput.text.apply(replacedOutput, [text.substring(lastIndex, text.length)].concat(styles));
            }
        }, this);
    }, this);

    return replacedOutput.output.map(normalizeLine);
}

MagicPen.prototype.isEmpty = function () {
    return this.output.length === 1 && this.output[0].length === 0;
};

MagicPen.prototype.replaceText = function (regexp, cb) {
    if (this.isEmpty()) {
        return this;
    }

    if (typeof regexp === 'string') {
        regexp = new RegExp(utils.escapeRegExp(regexp), 'g');
    }

    if (typeof cb === 'string') {
        var text = cb;
        cb = function (styles, _) {
            var args = [text].concat(styles);
            this.text.apply(this, args);
        };
    }


    if (arguments.length === 1) {
        cb = regexp;
        regexp = /.*/;
    }

    this.output = replaceText(this.clone(), this.output, regexp, cb);

    return this;
};

MagicPen.prototype.installTheme = function (formats, theme) {
    var that = this;
    if (arguments.length === 1) {
        theme = formats;
        formats = Object.keys(MagicPen.serializers);
    }

    if (typeof formats === 'string') {
        formats = [formats];
    }

    if (
        typeof theme !== 'object' ||
        !Array.isArray(formats) ||
        formats.some(function (format) {
            return typeof format !== 'string';
        })
    ) {
        throw new Error("Themes must be installed the following way:\n" +
                        "Install theme for all formats: pen.installTheme({ comment: 'gray' })\n" +
                        "Install theme for a specific format: pen.installTheme('ansi', { comment: 'gray' }) or\n" +
                        "Install theme for a list of formats: pen.installTheme(['ansi', 'html'], { comment: 'gray' })");
    }

    Object.keys(theme).forEach(function (themeKey) {
        if (rgbRegexp.test(themeKey) || cssStyles[themeKey]) {
            throw new Error("Invalid theme key: '" + themeKey + "' you can't map build styles.");
        }

        if (!that[themeKey]) {
            that.addStyle(themeKey, function (content) {
                this.text(content, themeKey);
            });
        }
    });

    that._themes = extend({}, that._themes);
    formats.forEach(function (format) {
        that._themes[format] = extend({}, that._themes[format] || {}, theme);
    });


    return this;
};

module.exports = MagicPen;

},{}],22:[function(require,module,exports){
var flattenBlocksInLines = require(25);

function TextSerializer() {}

TextSerializer.prototype.serialize = function (lines) {
    lines = flattenBlocksInLines(lines);
    return lines.map(this.serializeLine, this).join('\n');
};

TextSerializer.prototype.serializeLine = function (line) {
    return line.map(function (outputEntry) {
        return this[outputEntry.style] ?
            String(this[outputEntry.style].apply(this, outputEntry.args)) :
            '';
    }, this).join('');
};

TextSerializer.prototype.text = function (content) {
    return content;
};

TextSerializer.prototype.block = function (content) {
    return this.serialize(content);
};

module.exports = TextSerializer;

},{}],23:[function(require,module,exports){
var cssStyles = {
    bold: 'font-weight: bold',
    dim: 'opacity: 0.7',
    italic: 'font-style: italic',
    underline: 'text-decoration: underline',
    inverse: '-webkit-filter: invert(%100); filter: invert(100%)',
    hidden: 'visibility: hidden',
    strikeThrough: 'text-decoration: line-through',

    black: 'color: black',
    red: 'color: red',
    green: 'color: green',
    yellow: 'color: yellow',
    blue: 'color: blue',
    magenta: 'color: magenta',
    cyan: 'color: cyan',
    white: 'color: white',
    gray: 'color: gray',

    bgBlack: 'background-color: black',
    bgRed: 'background-color: red',
    bgGreen: 'background-color: green',
    bgYellow: 'background-color: yellow',
    bgBlue: 'background-color: blue',
    bgMagenta: 'background-color: magenta',
    bgCyan: 'background-color: cyan',
    bgWhite: 'background-color: white'
};

Object.keys(cssStyles).forEach(function (styleName) {
    cssStyles[styleName.toLowerCase()] = cssStyles[styleName];
});

module.exports = cssStyles;

},{}],24:[function(require,module,exports){
var whitespaceCacheLength = 256;
var whitespaceCache = [''];
for (var i = 1; i <= whitespaceCacheLength; i += 1) {
    whitespaceCache[i] = whitespaceCache[i - 1] + ' ';
}

function duplicateText(content, times) {
    if (times < 0) {
        return '';
    }

    var result = '';

    if (content === ' ') {
        if (times <= whitespaceCacheLength) {
            return whitespaceCache[times];
        }

        var segment = whitespaceCache[whitespaceCacheLength];
        var numberOfSegments = Math.floor(times / whitespaceCacheLength);
        for (var i = 0; i < numberOfSegments; i += 1) {
            result += segment;
        }
        result += whitespaceCache[times % whitespaceCacheLength];
    } else {
        for (var j = 0; j < times; j += 1) {
            result += content;
        }
    }

    return result;
}

module.exports = duplicateText;

},{}],25:[function(require,module,exports){
var utils = require(28);
var duplicateText = require(24);

function createPadding(length) {
    return { style: 'text', args: [duplicateText(' ', length)] };
}

function lineContainsBlocks(line) {
    return line.some(function (outputEntry) {
        return outputEntry.style === 'block' ||
            (outputEntry.style === 'text' && String(outputEntry.args[0]).indexOf('\n') !== -1);
    });
}

function flattenBlocksInOutputEntry(outputEntry) {
    switch (outputEntry.style) {
    case 'text': return String(outputEntry.args[0]).split('\n').map(function (line) {
        if (line === '') {
            return [];
        }

        var args = [line].concat(outputEntry.args.slice(1));
        return [{ style: 'text', args: args }];
    });
    case 'block': return flattenBlocksInLines(outputEntry.args[0]);
    default: return [];
    }
}

function flattenBlocksInLine(line) {
    if (line.length === 0) {
       return [[]];
    }

    if (!lineContainsBlocks(line)) {
        return [line];
    }

    var result = [];
    var linesLengths = [];

    var startIndex = 0;
    line.forEach(function (outputEntry, blockIndex) {
        var blockLines = flattenBlocksInOutputEntry(outputEntry);
        var blockLinesLengths = blockLines.map(function (line) {
            return utils.calculateLineSize(line).width;
        });

        var longestLineLength = Math.max.apply(null, blockLinesLengths);

        blockLines.forEach(function (blockLine, index) {
            var resultLine = result[index];

            if (!resultLine) {
                result[index] = resultLine = [];
                linesLengths[index] = 0;
            }

            if (blockLine.length) {
                var paddingLength = startIndex - linesLengths[index];
                resultLine.push(createPadding(paddingLength));
                Array.prototype.push.apply(resultLine, blockLine);
                linesLengths[index] = startIndex + blockLinesLengths[index];
            }
        });

        startIndex += longestLineLength;
    }, this);
    return result;
}

function flattenBlocksInLines(lines) {
    var result = [];
    lines.forEach(function (line) {
        flattenBlocksInLine(line).forEach(function (line) {
            result.push(line);
        });
    });
    return result;
}

module.exports = flattenBlocksInLines;

},{}],26:[function(require,module,exports){
module.exports =  /^(?:bg)?#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

},{}],27:[function(require,module,exports){
module.exports = function (theme, args) {
    if (args.length === 2) {
        var count = 0;
        var stack = [];
        var themeMapping = args[1];
        while(typeof themeMapping === 'string' && theme[themeMapping]) {
            themeMapping = theme[themeMapping];
            count += 1;
            if (100 < count) {
                var index = stack.indexOf(themeMapping);
                stack.push(themeMapping);
                if (index !== -1) {
                    throw new Error('Your theme contains a loop: ' + stack.slice(index).join(' -> '));
                }
            }
        }

        return [args[0]].concat(themeMapping);
    }

    return args;
};

},{}],28:[function(require,module,exports){
var utils = {
    extend: function (target) {
        for (var i = 1; i < arguments.length; i += 1) {
            var source = arguments[i];
            Object.keys(source).forEach(function (key) {
                target[key] = source[key];
            });
        }
        return target;
    },

    calculateOutputEntrySize: function (outputEntry) {
        switch (outputEntry.style) {
        case 'text':
            return { width: String(outputEntry.args[0]).length, height: 1 };
        case 'block':
            return utils.calculateSize(outputEntry.args[0]);
        default: return { width: 0, height: 0 };
        }
    },

    calculateLineSize: function (line) {
        var size = { height: 1, width: 0 };
        line.forEach(function (outputEntry) {
            var outputEntrySize = utils.calculateOutputEntrySize(outputEntry);
            size.width += outputEntrySize.width;
            size.height = Math.max(outputEntrySize.height, size.height);
        });
        return size;
    },

    calculateSize: function (lines) {
        var size = { height: 0, width: 0 };
        lines.forEach(function (line) {
            var lineSize = utils.calculateLineSize(line);
            size.height += lineSize.height;
            size.width = Math.max(size.width, lineSize.width);
        });
        return size;
    },

    arrayEquals: function (a, b) {
        if (a === b) {
            return true;
        }

        if (!a || a.length !== b.length) {
            return false;
        }

        for (var i = 0; i < a.length; i += 1) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;

    },

    escapeRegExp: function (text){
        return text.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    }
};

module.exports = utils;

},{}],29:[function(require,module,exports){
'use strict';

var styles = module.exports = {
	modifiers: {
		reset: [0, 0],
		bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29]
	},
	colors: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],
		gray: [90, 39]
	},
	bgColors: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49]
	}
};

// fix humans
styles.colors.grey = styles.colors.gray;

Object.keys(styles).forEach(function (groupName) {
	var group = styles[groupName];

	Object.keys(group).forEach(function (styleName) {
		var style = group[styleName];

		styles[styleName] = group[styleName] = {
			open: '\u001b[' + style[0] + 'm',
			close: '\u001b[' + style[1] + 'm'
		};
	});

	Object.defineProperty(styles, groupName, {
		value: group,
		enumerable: false
	});
});

},{}],30:[function(require,module,exports){
/**
 * @author Markus Ekholm
 * @copyright 2012-2015 (c) Markus Ekholm <markus at botten dot org >
 * @license Copyright (c) 2012-2015, Markus Ekholm
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the <organization> nor the
 *      names of its contributors may be used to endorse or promote products
 *      derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MARKUS EKHOLM BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
* EXPORTS
*/
exports.rgb_to_lab = rgb_to_lab;

/**
* IMPORTS
*/
var pow  = Math.pow;
var sqrt = Math.sqrt;

/**
 * API FUNCTIONS
 */

/**
* Returns c converted to labcolor.
* @param {rgbcolor} c should have fields R,G,B
* @return {labcolor} c converted to labcolor
*/
function rgb_to_lab(c)
{
  return xyz_to_lab(rgb_to_xyz(c))
}

/**
* Returns c converted to xyzcolor.
* @param {rgbcolor} c should have fields R,G,B
* @return {xyzcolor} c converted to xyzcolor
*/
function rgb_to_xyz(c)
{
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=02
  var R = ( c.R / 255 );
  var G = ( c.G / 255 );
  var B = ( c.B / 255 );

  if ( R > 0.04045 ) R = pow(( ( R + 0.055 ) / 1.055 ),2.4);
  else               R = R / 12.92;
  if ( G > 0.04045 ) G = pow(( ( G + 0.055 ) / 1.055 ),2.4);
  else               G = G / 12.92;
  if ( B > 0.04045 ) B = pow(( ( B + 0.055 ) / 1.055 ), 2.4);
  else               B = B / 12.92;

  R *= 100;
  G *= 100;
  B *= 100;

  // Observer. = 2°, Illuminant = D65
  var X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  var Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  var Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
  return {'X' : X, 'Y' : Y, 'Z' : Z};
}

/**
* Returns c converted to labcolor.
* @param {xyzcolor} c should have fields X,Y,Z
* @return {labcolor} c converted to labcolor
*/
function xyz_to_lab(c)
{
  // Based on http://www.easyrgb.com/index.php?X=MATH&H=07
  var ref_Y = 100.000;
  var ref_Z = 108.883;
  var ref_X = 95.047; // Observer= 2°, Illuminant= D65
  var Y = c.Y / ref_Y;
  var Z = c.Z / ref_Z;
  var X = c.X / ref_X;
  if ( X > 0.008856 ) X = pow(X, 1/3);
  else                X = ( 7.787 * X ) + ( 16 / 116 );
  if ( Y > 0.008856 ) Y = pow(Y, 1/3);
  else                Y = ( 7.787 * Y ) + ( 16 / 116 );
  if ( Z > 0.008856 ) Z = pow(Z, 1/3);
  else                Z = ( 7.787 * Z ) + ( 16 / 116 );
  var L = ( 116 * Y ) - 16;
  var a = 500 * ( X - Y );
  var b = 200 * ( Y - Z );
  return {'L' : L , 'a' : a, 'b' : b};
}

// Local Variables:
// allout-layout: t
// js-indent-level: 2
// End:

},{}],31:[function(require,module,exports){
/**
 * @author Markus Ekholm
 * @copyright 2012-2015 (c) Markus Ekholm <markus at botten dot org >
 * @license Copyright (c) 2012-2015, Markus Ekholm
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the <organization> nor the
 *      names of its contributors may be used to endorse or promote products
 *      derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MARKUS EKHOLM BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
* EXPORTS
*/
exports.ciede2000 = ciede2000;

/**
* IMPORTS
*/
var sqrt = Math.sqrt;
var pow = Math.pow;
var cos = Math.cos;
var atan2 = Math.atan2;
var sin = Math.sin;
var abs = Math.abs;
var exp = Math.exp;
var PI = Math.PI;

/**
 * API FUNCTIONS
 */

/**
* Returns diff between c1 and c2 using the CIEDE2000 algorithm
* @param {labcolor} c1    Should have fields L,a,b
* @param {labcolor} c2    Should have fields L,a,b
* @return {float}   Difference between c1 and c2
*/
function ciede2000(c1,c2)
{
  /**
   * Implemented as in "The CIEDE2000 Color-Difference Formula:
   * Implementation Notes, Supplementary Test Data, and Mathematical Observations"
   * by Gaurav Sharma, Wencheng Wu and Edul N. Dalal.
   */

  // Get L,a,b values for color 1
  var L1 = c1.L;
  var a1 = c1.a;
  var b1 = c1.b;

  // Get L,a,b values for color 2
  var L2 = c2.L;
  var a2 = c2.a;
  var b2 = c2.b;

  // Weight factors
  var kL = 1;
  var kC = 1;
  var kH = 1;

  /**
   * Step 1: Calculate C1p, C2p, h1p, h2p
   */
  var C1 = sqrt(pow(a1, 2) + pow(b1, 2)) //(2)
  var C2 = sqrt(pow(a2, 2) + pow(b2, 2)) //(2)

  var a_C1_C2 = (C1+C2)/2.0;             //(3)

  var G = 0.5 * (1 - sqrt(pow(a_C1_C2 , 7.0) /
                          (pow(a_C1_C2, 7.0) + pow(25.0, 7.0)))); //(4)

  var a1p = (1.0 + G) * a1; //(5)
  var a2p = (1.0 + G) * a2; //(5)

  var C1p = sqrt(pow(a1p, 2) + pow(b1, 2)); //(6)
  var C2p = sqrt(pow(a2p, 2) + pow(b2, 2)); //(6)

  var hp_f = function(x,y) //(7)
  {
    if(x== 0 && y == 0) return 0;
    else{
      var tmphp = degrees(atan2(x,y));
      if(tmphp >= 0) return tmphp
      else           return tmphp + 360;
    }
  }

  var h1p = hp_f(b1, a1p); //(7)
  var h2p = hp_f(b2, a2p); //(7)

  /**
   * Step 2: Calculate dLp, dCp, dHp
   */
  var dLp = L2 - L1; //(8)
  var dCp = C2p - C1p; //(9)

  var dhp_f = function(C1, C2, h1p, h2p) //(10)
  {
    if(C1*C2 == 0)               return 0;
    else if(abs(h2p-h1p) <= 180) return h2p-h1p;
    else if((h2p-h1p) > 180)     return (h2p-h1p)-360;
    else if((h2p-h1p) < -180)    return (h2p-h1p)+360;
    else                         throw(new Error());
  }
  var dhp = dhp_f(C1,C2, h1p, h2p); //(10)
  var dHp = 2*sqrt(C1p*C2p)*sin(radians(dhp)/2.0); //(11)

  /**
   * Step 3: Calculate CIEDE2000 Color-Difference
   */
  var a_L = (L1 + L2) / 2.0; //(12)
  var a_Cp = (C1p + C2p) / 2.0; //(13)

  var a_hp_f = function(C1, C2, h1p, h2p) { //(14)
    if(C1*C2 == 0)                                      return h1p+h2p
    else if(abs(h1p-h2p)<= 180)                         return (h1p+h2p)/2.0;
    else if((abs(h1p-h2p) > 180) && ((h1p+h2p) < 360))  return (h1p+h2p+360)/2.0;
    else if((abs(h1p-h2p) > 180) && ((h1p+h2p) >= 360)) return (h1p+h2p-360)/2.0;
    else                                                throw(new Error());
  }
  var a_hp = a_hp_f(C1,C2,h1p,h2p); //(14)
  var T = 1-0.17*cos(radians(a_hp-30))+0.24*cos(radians(2*a_hp))+
    0.32*cos(radians(3*a_hp+6))-0.20*cos(radians(4*a_hp-63)); //(15)
  var d_ro = 30 * exp(-(pow((a_hp-275)/25,2))); //(16)
  var RC = sqrt((pow(a_Cp, 7.0)) / (pow(a_Cp, 7.0) + pow(25.0, 7.0)));//(17)
  var SL = 1 + ((0.015 * pow(a_L - 50, 2)) /
                sqrt(20 + pow(a_L - 50, 2.0)));//(18)
  var SC = 1 + 0.045 * a_Cp;//(19)
  var SH = 1 + 0.015 * a_Cp * T;//(20)
  var RT = -2 * RC * sin(radians(2 * d_ro));//(21)
  var dE = sqrt(pow(dLp /(SL * kL), 2) + pow(dCp /(SC * kC), 2) +
                pow(dHp /(SH * kH), 2) + RT * (dCp /(SC * kC)) *
                (dHp / (SH * kH))); //(22)
  return dE;
}

/**
 * INTERNAL FUNCTIONS
 */
function degrees(n) { return n*(180/PI); }
function radians(n) { return n*(PI/180); }

// Local Variables:
// allout-layout: t
// js-indent-level: 2
// End:

},{}],32:[function(require,module,exports){
'use strict';

var diff = require(31);
var convert = require(30);
var palette = require(33);

var color = module.exports = {};

color.diff             = diff.ciede2000;
color.rgb_to_lab       = convert.rgb_to_lab;
color.map_palette      = palette.map_palette;
color.palette_map_key  = palette.palette_map_key;

color.closest = function(target, relative) {
    var key = color.palette_map_key(target);

    var result = color.map_palette([target], relative, 'closest');

    return result[key];
};

color.furthest = function(target, relative) {
    var key = color.palette_map_key(target);

    var result = color.map_palette([target], relative, 'furthest');

    return result[key];
};

},{}],33:[function(require,module,exports){
/**
 * @author Markus Ekholm
 * @copyright 2012-2015 (c) Markus Ekholm <markus at botten dot org >
 * @license Copyright (c) 2012-2015, Markus Ekholm
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the <organization> nor the
 *      names of its contributors may be used to endorse or promote products
 *      derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MARKUS EKHOLM BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
* EXPORTS
*/
exports.map_palette     = map_palette;
exports.palette_map_key = palette_map_key;

/**
* IMPORTS
*/
var color_diff    = require(31);
var color_convert = require(30);

/**
 * API FUNCTIONS
 */

/**
* Returns the hash key used for a {rgbcolor} in a {palettemap}
* @param {rgbcolor} c should have fields R,G,B
* @return {string}
*/
function palette_map_key(c)
{
  return "R" + c.R + "B" + c.B + "G" + c.G;
}

/**
* Returns a mapping from each color in a to the closest color in b
* @param [{rgbcolor}] a each element should have fields R,G,B
* @param [{rgbcolor}] b each element should have fields R,G,B
* @param 'type' should be the string 'closest' or 'furthest'
* @return {palettemap}
*/
function map_palette(a, b, type)
{
  var c = {};
  type = type || 'closest';
  for (var idx1 = 0; idx1 < a.length; idx1 += 1){
    var color1 = a[idx1];
    var best_color      = undefined;
    var best_color_diff = undefined;
    for (var idx2 = 0; idx2 < b.length; idx2 += 1)
    {
      var color2 = b[idx2];
      var current_color_diff = diff(color1,color2);

      if((best_color == undefined) || ((type === 'closest') && (current_color_diff < best_color_diff)))
      {
        best_color      = color2;
        best_color_diff = current_color_diff;
        continue;
      }
      if((type === 'furthest') && (current_color_diff > best_color_diff))
      {
        best_color      = color2;
        best_color_diff = current_color_diff;
        continue;
      }
    }
    c[palette_map_key(color1)] = best_color;
  }
  return c;
}

/**
 * INTERNAL FUNCTIONS
 */

function diff(c1,c2)
{
  c1 = color_convert.rgb_to_lab(c1);
  c2 = color_convert.rgb_to_lab(c2);
  return color_diff.ciede2000(c1,c2);
}

// Local Variables:
// allout-layout: t
// js-indent-level: 2
// End:

},{}],34:[function(require,module,exports){
(function (process){
'use strict';
var argv = process.argv;

module.exports = (function () {
	if (argv.indexOf('--no-color') !== -1 ||
		argv.indexOf('--no-colors') !== -1 ||
		argv.indexOf('--color=false') !== -1) {
		return false;
	}

	if (argv.indexOf('--color') !== -1 ||
		argv.indexOf('--colors') !== -1 ||
		argv.indexOf('--color=true') !== -1 ||
		argv.indexOf('--color=always') !== -1) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

}).call(this,require(15))
},{}]},{},[8])(8)
});