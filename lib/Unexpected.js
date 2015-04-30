var Assertion = require('./Assertion');
var createStandardErrorMessage = require('./createStandardErrorMessage');
var utils = require('./utils');
var magicpen = require('magicpen');
var truncateStack = utils.truncateStack;
var extend = utils.extend;
var leven = require('leven');
var cloneError = utils.cloneError;
var makePromise = require('./makePromise');
var oathbreaker = require('./oathbreaker');
var throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');

var anyType = {
    name: 'any',
    identify: function () {
        return true;
    },
    equal: utils.objectIs,
    inspect: function (value, depth, output) {
        if (output && output.isMagicPen) {
            return output.text(value);
        } else {
            // Guard against node.js' require('util').inspect eagerly calling .inspect() on objects
            return String(value);
        }
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

    // Make bound versions of these two helpers up front to save a bit when creating wrapped expects:
    var that = this;
    this.getType = function (typeName) {
        return utils.findFirst(that.types, function (type) {
            return type.name === typeName;
        });
    };
    this.findTypeOf = function (obj) {
        return utils.findFirst(that.types || [], function (type) {
            return type.identify(obj);
        });
    };
    this.findCommonType = function (a, b) {
        var aAncestorIndex = {};
        var current = this.findTypeOf(a);
        while (current) {
            aAncestorIndex[current.name] = current;
            current = current.baseType;
        }
        current = this.findTypeOf(b);
        while (current) {
            if (aAncestorIndex[current.name]) {
                return current;
            }
            current = current.baseType;
        }
    };
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
    return orGroup.map(function (expectation) {
        var args = Array.prototype.slice.call(expectation);
        args.unshift(subject);
        return {
            expectation: args,
            promise: makePromise(function () {
                return expect.apply(expect, args);
            })
        };
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

        var groupFailed = false;
        groupEvaluation.forEach(function (evaluation, j) {
            if (j > 0) {
                output.jsComment(' and').nl();
            }
            if (evaluation.promise.isRejected() && !groupFailed) {
                groupFailed = true;
                var err = evaluation.promise.reason();

                if (hasAndClauses || hasOrClauses) {
                    output.error('⨯ ');
                }

                output.block(function (output) {
                    output.append(err.output); // v8: err.getErrorMessage()
                    if (!err._hasSerializedErrorMessage) {
                        var comparison = buildDiff(expect, err);
                        if (comparison) {
                            output.nl(2).append(comparison.diff);
                        }
                    }
                });
            } else {
                var style;
                if (groupFailed) {
                    style = 'text';
                    output.sp(2);
                } else {
                    style = 'success';
                    output.success('✓ ');
                }

                var expectation = evaluation.expectation;
                output.block(function (output) {
                    output[style]('expected ');
                    output.append(expect.inspect(expectation[0])).sp();
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
        var groupEvaluations = [];
        var promises = [];
        orGroups.forEach(function (orGroup) {
            var evaluations = evaluateGroup(expect, subject, orGroup);
            evaluations.forEach(function (evaluation) {
                promises.push(evaluation.promise);
            });
            groupEvaluations.push(evaluations);
        });

        return oathbreaker(expect.promise.settle(promises).then(function () {
            var isSuccessful = groupEvaluations.some(function (groupEvaluation) {
                return groupEvaluation.every(function (evaluation) {
                    return evaluation.promise.isFulfilled();
                });
            });

            if (!isSuccessful) {
                expect.fail(function (output) {
                    writeGroupEvaluationsToOutput(expect, output, groupEvaluations);
                });
            }
        }));
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

    depth = typeof depth === 'number' ? depth : 100;
    if (depth <= 0) {
        // detect recursive loops in the structure
        seen = seen || [];
        if (seen.indexOf(actual) !== -1) {
            throw new Error('Cannot compare circular structures');
        }
        seen.push(actual);
    }

    return this.findCommonType(actual, expected).equal(actual, expected, function (a, b) {
        return that.equal(a, b, depth - 1, seen);
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
    var createDiff = null;
    var label = null;
    if (typeof arg === 'function') {
        arg.call(output, output);
    } else if (arg && typeof arg === 'object') {
        if (typeof arg.message !== 'undefined') {
            if (arg.message.isMagicPen) {
                output.append(arg.message);
            } else if (typeof arg.message === 'function') {
                arg.message.call(output, output);
            } else {
                output.text(String(arg.message));
            }
        } else {
            output.error('Explicit failure');
        }
        if (typeof arg.diff === 'function') {
            createDiff = arg.diff;
        }
        if (typeof arg.label === 'string') {
            label = arg.label;
        }
    } else {
        var that = this;
        var message = arg ? String(arg) : 'Explicit failure';
        var placeHolderArgs = Array.prototype.slice.call(arguments, 1);
        var tokens = message.split(placeholderSplitRegexp);
        tokens.forEach(function (token) {
            var match = placeholderRegexp.exec(token);
            if (match) {
                var index = match[1];
                if (index in placeHolderArgs) {
                    var placeholderArg = placeHolderArgs[index];
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
    if (createDiff) {
        error.createDiff = createDiff;
    }
    if (typeof label === 'string') {
        error.label = label;
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
        patterns.forEach(ensureValidPattern);
        var expandedPatternArrays = patterns.map(expandPattern);
        var defaultValueByFlag = {};
        expandedPatternArrays.forEach(function(expandedPatterns) {
            expandedPatterns.forEach(function (expandedPattern) {
                Object.keys(expandedPattern.flags).forEach(function (flag) {
                    defaultValueByFlag[flag] = false;
                });
            });
        });
        patterns.forEach(function (pattern, i) {
            expandedPatternArrays[i].forEach(function (expandedPattern) {
                if (expandedPattern.text in assertionsForType) {
                    if (!isSeenByExpandedPattern[expandedPattern.text]) {
                        throw new Error('Cannot redefine assertion: ' + expandedPattern.text + (typeName === 'any' ? '' : ' for type ' + typeName));
                    }
                } else {
                    isSeenByExpandedPattern[expandedPattern.text] = true;
                    assertionsForType[expandedPattern.text] = {
                        handler: handler,
                        flags: extend({}, defaultValueByFlag, expandedPattern.flags),
                        alternations: expandedPattern.alternations
                    };
                }
            });
        });
    });

    return this.expect; // for chaining
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
    expect.findTypeOf = unexpected.findTypeOf; // Already bound
    expect.fail = function () {
        try {
            unexpected.fail.apply(unexpected, arguments);
        } catch (e) {
            if (e && e._isUnexpected) {
                unexpected.setErrorMessage(e);
            }
            throw e;
        }
    };

    expect.diff = unexpected.diff.bind(unexpected);
    expect.async = unexpected.async.bind(unexpected);
    expect.promise = makePromise;
    expect.addAssertion = unexpected.addAssertion.bind(unexpected);
    expect.addStyle = unexpected.addStyle.bind(unexpected);
    expect.installTheme = unexpected.installTheme.bind(unexpected);
    expect.addType = unexpected.addType.bind(unexpected);
    expect.getType = unexpected.getType;
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

    var serializeErrorsFromWrappedExpect = false;
    function executeExpect(subject, testDescriptionString, args) {
        if (typeof testDescriptionString !== 'string') {
            throw new Error('The expect function requires the second parameter to be a string.');
        }
        var matchingType = that.findTypeOf(subject);
        var typeWithAssertion = matchingType;
        var assertionRule = that.assertions[typeWithAssertion.name][testDescriptionString];
        while (!assertionRule && typeWithAssertion.name !== anyType.name) {
            // FIXME: Detect cycles?
            typeWithAssertion = typeWithAssertion.baseType;
            assertionRule = that.assertions[typeWithAssertion.name][testDescriptionString];
        }
        if (assertionRule) {
            var flags = extend({}, assertionRule.flags);
            var callInNestedContext = function (callback) {
                try {
                    var result = oathbreaker(callback());
                    if (result && typeof result.then === 'function' && typeof result.caught === 'function') {
                        return result.caught(function (e) {
                            if (e && e._isUnexpected) {
                                truncateStack(e, wrappedExpect);
                                throw handleNestedExpects(wrappedExpect, e, assertion);
                            }
                            throw e;
                        });
                    } else {
                        return result;
                    }
                } catch (e) {
                    if (e && e._isUnexpected) {
                        truncateStack(e, wrappedExpect);
                        var wrappedError = handleNestedExpects(wrappedExpect, e, assertion);
                        if (serializeErrorsFromWrappedExpect) {
                            that.setErrorMessage(wrappedError);
                        }
                        throw wrappedError;
                    }
                    throw e;
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
                return callInNestedContext(function () {
                    return executeExpect(subject, testDescriptionString, args);
                });
            };

            // Not sure this is the right way to go about this:
            wrappedExpect.equal = that.equal;
            wrappedExpect.inspect = that.inspect;
            wrappedExpect.diff = that.diff;
            wrappedExpect.findTypeOf = that.findTypeOf.bind(that);
            wrappedExpect.findCommonType = that.findCommonType.bind(that);
            wrappedExpect.getType = expect.getType;
            wrappedExpect.output = that.output;
            wrappedExpect.outputFormat = that.outputFormat;
            wrappedExpect.fail = function () {
                var args = arguments;
                callInNestedContext(function () {
                    that.fail.apply(that, args);
                });
            };
            wrappedExpect.promise = makePromise;
            wrappedExpect.withError = function (body, handler) {
                return oathbreaker(makePromise(body).caught(function (e) {
                    throwIfNonUnexpectedError(e);
                    return handler(e);
                }));
            };

            wrappedExpect.format = that.format;
            wrappedExpect.it = that.it.bind(that);

            var assertion = new Assertion(wrappedExpect, subject, testDescriptionString,
                                          flags, assertionRule.alternations, args);
            var handler = assertionRule.handler;
            var result = handler.apply(assertion, [wrappedExpect, subject].concat(args));
            return oathbreaker(result);
        } else {
            var errorMessage = that.output.clone();
            var definedForIncompatibleTypes = that.types.filter(function (type) {
                return that.assertions[type.name][testDescriptionString];
            }, that);
            if (definedForIncompatibleTypes.length > 0) {
                errorMessage
                    .append(createStandardErrorMessage(that.expect, subject, testDescriptionString, args)).nl()
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
                [].concat(that.types).reverse().forEach(function (type) {
                    var typeMatchBonus = 0;
                    if (type.identify(subject)) {
                        typeMatchBonus = bonusForNextMatchingType;
                        bonusForNextMatchingType += 0.9;
                    }
                    Object.keys(that.assertions[type.name]).forEach(function (assertion) {
                        assertionsWithScore.push({
                            type: type,
                            assertion: assertion,
                            score: typeMatchBonus - leven(testDescriptionString, assertion)
                        });
                    });
                }, that);
                assertionsWithScore.sort(function (a, b) {
                    var c = b.score - a.score;
                    if (c !== 0) {
                        return c;
                    }

                    if (a.assertion < b.assertion) {
                        return -1;
                    } else if (a.assertion > b.assertion) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                errorMessage.error('Unknown assertion "').jsString(testDescriptionString)
                    .error('", did you mean: "').jsString(assertionsWithScore[0].assertion).error('"');
            }
            var missingAssertionError = new Error();
            missingAssertionError.output = errorMessage;
            missingAssertionError._isUnexpected = true;
            missingAssertionError.errorMode = 'bubble';
            that.fail(missingAssertionError);
        }
    }

    var args = Array.prototype.slice.call(arguments, 2);
    try {
        var promise = executeExpect(subject, testDescriptionString, args);
        if (promise && typeof promise.then === 'function') {
            return promise.caught(function (e) {
                if (e && e._isUnexpected) {
                    // TODO truncate the stack
                    that.setErrorMessage(e);
                }
                throw e;
            });
        } else {
            serializeErrorsFromWrappedExpect = true;
        }
        return promise;
    } catch (e) {
        if (e && e._isUnexpected) {
            var clonedError = cloneError(e);
            truncateStack(clonedError, that.expect);
            that.setErrorMessage(clonedError);
            throw clonedError;
        }
        throw e;
    }
};

Unexpected.prototype.async = function (cb) {
    var that = this;

    function asyncMisusage(message) {
        that._isAsync = false;
        that.expect.fail(function (output) {
            output.error(message).nl()
                  .text("Usage: ").nl()
                  .text("it('test description', expect.async(function () {").nl()
                  .indentLines()
                  .i().text("return expect('test.txt', 'to have content', 'Content read asynchroniously');").nl()
                  .outdentLines()
                  .text("});");
        });
    }

    if (typeof cb !== 'function' || cb.length !== 0) {
        asyncMisusage("expect.async requires a callback without arguments.");
    }

    return function (done) {
        if (that._isAsync) {
            asyncMisusage("expect.async can't be within a expect.async context.");
        }
        that._isAsync = true;

        if (typeof done !== 'function') {
            asyncMisusage("expect.async should be called in the context of an it-block\n" +
                          "and the it-block should supply a done callback.");
        }
        var result;
        try {
            result = cb();
        } finally {
            that._isAsync = false;
        }
        if (!result || typeof result.then !== 'function') {
            asyncMisusage("expect.async requires the block to return a promise or throw an exception.");
        }
        result.then(function () {
            that._isAsync = false;
            done();
        }).caught(function (err) {
            that._isAsync = false;
            done(err);
        });
    };
};

Unexpected.prototype.diff = function (a, b, depth, seen) {
    var output = this.output.clone();
    var that = this;

    depth = typeof depth === 'number' ? depth : 100;
    if (depth <= 0) {
        // detect recursive loops in the structure
        seen = seen || [];
        if (seen.indexOf(a) !== -1) {
            throw new Error('Cannot compare circular structures');
        }
        seen.push(a);
    }

    return this.findCommonType(a, b).diff(a, b, output, function (actual, expected) {
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
