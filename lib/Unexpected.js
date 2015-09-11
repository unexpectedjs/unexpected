var createStandardErrorMessage = require('./createStandardErrorMessage');
var utils = require('./utils');
var magicpen = require('magicpen');
var extend = utils.extend;
var leven = require('leven');
var makePromise = require('./makePromise');
var makeAndMethod = require('./makeAndMethod');
var isPendingPromise = require('./isPendingPromise');
var oathbreaker = require('./oathbreaker');
var UnexpectedError = require('./UnexpectedError');
var testFrameworkPatch = require('./testFrameworkPatch');
var defaultDepth = require('./defaultDepth');
var wrappedExpectProto = require('./wrappedExpectProto');

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
            var isRejected = evaluation.promise.isRejected();
            if (isRejected && !groupFailed) {
                groupFailed = true;
                var err = evaluation.promise.reason();

                if (hasAndClauses || hasOrClauses) {
                    output.error('⨯ ');
                }

                output.block(function (output) {
                    output.append(err.getErrorMessage(output));
                });
            } else {
                var style;
                if (isRejected) {
                    style = 'error';
                    output.error('⨯ ');
                } else {
                    style = 'success';
                    output.success('✓ ');
                }

                var expectation = evaluation.expectation;
                output.block(function (output) {
                    var subject = expectation[0];
                    var subjectOutput = function (output) {
                        output.appendInspected(subject);
                    };
                    var args = expectation.slice(2);
                    var argsOutput = args.map(function (arg) {
                        return function (output) {
                            output.appendInspected(arg);
                        };
                    });
                    var testDescription = expectation[1];
                    createStandardErrorMessage(output, subjectOutput, testDescription, argsOutput, {
                        subject: subject
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

Unexpected.prototype.inspect = function (obj, depth, output) {
    var seen = [];
    var that = this;
    var printOutput = function (obj, currentDepth, output) {
        var objType = that.findTypeOf(obj);
        if (currentDepth <= 0 && objType.is('object') && !objType.is('expect.it')) {
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

    output = output || this.createOutput();
    return printOutput(obj, typeof depth === 'number' ? depth : defaultDepth, output) || output;
};

var placeholderSplitRegexp = /(\{(?:\d+)\})/g;
var placeholderRegexp = /\{(\d+)\}/;
Unexpected.prototype.fail = function (arg) {
    if (arg instanceof UnexpectedError) {
        arg._hasSerializedErrorMessage = false;
        throw arg;
    }

    if (utils.isError(arg)) {
        throw arg;
    }

    var error = new UnexpectedError(this.expect);

    if (typeof arg === 'function') {
        error.output = arg;
    } else if (arg && typeof arg === 'object') {
        error.output = function (output) {
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
        };
        var additionalProperties = {};
        if (arg && typeof arg === 'object') {
            Object.keys(arg).forEach(function (key) {
                var value = arg[key];
                if (key === 'diff') {
                    additionalProperties.createDiff = value;
                } else if (key !== 'message') {
                    additionalProperties[key] = value;
                }
            });
        }

        Object.keys(additionalProperties).forEach(function (key) {
            error[key] = additionalProperties[key];
        });
    } else {
        var placeholderArgs = Array.prototype.slice.call(arguments, 1);
        error.output = function (output) {
            var message = arg ? String(arg) : 'Explicit failure';
            var tokens = message.split(placeholderSplitRegexp);
            tokens.forEach(function (token) {
                var match = placeholderRegexp.exec(token);
                if (match) {
                    var index = match[1];
                    if (index in placeholderArgs) {
                        var placeholderArg = placeholderArgs[index];
                        if (placeholderArg && placeholderArg.isMagicPen) {
                            output.append(placeholderArg);
                        } else {
                            output.appendInspected(placeholderArg);
                        }
                    } else {
                        output.text(match[0]);
                    }

                } else {
                    output.error(token);
                }
            });
        };
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
    if (typeof type.name !== 'string' || !/^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$/i.test(type.name)) {
        throw new Error('A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
    }

    if (this.getType(type.name)) {
        throw new Error('The type with the name ' + type.name + ' already exists');
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

    var extendedBaseType = Object.create(baseType);
    extendedBaseType.inspect = function (value, depth, output) {
        if (!output || !output.isMagicPen) {
            throw new Error('You need to pass the output to baseType.inspect() as the third parameter');
        }

        return baseType.inspect(value, depth, output.clone(), function (value, depth) {
            return output.clone().appendInspected(value, depth);
        });
    };

    extendedBaseType.diff = function (actual, expected, output) {
        if (!output || !output.isMagicPen) {
            throw new Error('You need to pass the output to baseType.diff() as the third parameter');
        }

        return baseType.diff(actual, expected,
                      output.clone(),
                      function (actual, expected) {
                          return that.diff(actual, expected, output.clone());
                      },
                      function (value, depth) {
                          return output.clone().appendInspected(value, depth);
                      },
                      that.equal.bind(that));
    };

    extendedBaseType.equal = function (actual, expected) {
        return baseType.equal(actual, expected, that.equal.bind(that));
    };

    var extendedType = extend({}, baseType, type, { baseType: extendedBaseType });
    var originalInspect = extendedType.inspect;

    extendedType.inspect = function (obj, depth, output, inspect) {
        if (arguments.length < 2) {
            return 'type: ' + type.name;
        } else {
            return originalInspect.call(this, obj, depth, output, inspect);
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

Unexpected.prototype.use = function (plugin) {
    var existingPlugin = utils.findFirst(this.installedPlugins, function (installedPlugin) {
        if (installedPlugin === plugin) {
            return true;
        } else if (typeof plugin === 'function' && typeof installedPlugin === 'function') {
            var pluginName = utils.getFunctionName(plugin);
            return pluginName !== '' && pluginName === utils.getFunctionName(installedPlugin);
        } else {
            return installedPlugin.name === plugin.name;
        }
    });

    if (existingPlugin) {
        if (existingPlugin === plugin || (typeof plugin.version !== 'undefined' && plugin.version === existingPlugin.version)) {
            // No-op
            return this.expect;
        } else {
            throw new Error("Another instance of the plugin '" + plugin.name + "' " +
                            "is already installed" +
                            (typeof existingPlugin.version !== 'undefined' ?
                                ' (version ' + existingPlugin.version +
                                (typeof plugin.version !== 'undefined' ?
                                    ', trying to install ' + plugin.version : '') +
                                ')' : '') +
                            ". Please check your node_modules folder for unmet peerDependencies.");
        }
    }

    if ((typeof plugin !== 'function' && (typeof plugin !== 'object' || typeof plugin.installInto !== 'function')) ||
        (typeof plugin.name !== 'undefined' && typeof plugin.name !== 'string') ||
        (typeof plugin.dependencies !== 'undefined' && !Array.isArray(plugin.dependencies))) {
        throw new Error('Plugins must be functions or adhere to the following interface\n' +
                        '{\n' +
                        '  name: <an optional plugin name>,\n' +
                        '  version: <an optional semver version string>,\n' +
                        '  dependencies: <an optional list of dependencies>,\n' +
                        '  installInto: <a function that will update the given expect instance>\n' +
                        '}');
    }

    if (plugin.name === 'unexpected-promise') {
        throw new Error('The unexpected-promise plugin was pulled into Unexpected as of 8.5.0. This means that the plugin is no longer supported.');
    }

    if (plugin.dependencies) {
        var installedPlugins = this.installedPlugins;
        var unfulfilledDependencies = plugin.dependencies.filter(function (dependency) {
            return !installedPlugins.some(function (plugin) {
                return plugin.name === dependency;
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

    this.installedPlugins.push(plugin);
    if (typeof plugin === 'function') {
        plugin(this.expect);
    } else {
        plugin.installInto(this.expect);
    }

    return this.expect; // for chaining
};

Unexpected.prototype.installPlugin = Unexpected.prototype.use; // Legacy alias

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

    expect.createOutput = unexpected.createOutput.bind(unexpected);
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
    expect.use = expect.installPlugin = unexpected.use.bind(unexpected);
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
    err.serializeMessage(this.outputFormat());
};

Unexpected.prototype.toString = function () {
    return this.message;
};

Unexpected.prototype.expect = function expect(subject, testDescriptionString) {
    var that = this;
    if (arguments.length < 2) {
        throw new Error('The expect function requires at least two parameters.');
    }

    var executionContext = {
        expect: that,
        serializeErrorsFromWrappedExpect: false
    };

    function executeExpect(executionContext, subject, testDescriptionString, args) {
        var assertionRule = that.getAssertionRule(subject, testDescriptionString, args);
        var flags = extend({}, assertionRule.flags);
        var wrappedExpect = function () {
            var subject = arguments[0];
            var testDescriptionString = arguments[1].replace(/\[(!?)([^\]]+)\] ?/g, function (match, negate, flag) {
                return Boolean(flags[flag]) !== Boolean(negate) ? flag + ' ' : '';
            }).trim();

            var args = new Array(arguments.length - 2);
            for (var i = 0; i < arguments.length - 2; i += 1) {
                args[i] = arguments[i + 2];
            }
            return wrappedExpect.callInNestedContext(executionContext, function () {
                return executeExpect(executionContext, subject, testDescriptionString, args);
            });
        };

        utils.setPrototypeOfOrExtend(wrappedExpect, wrappedExpectProto);

        wrappedExpect.equal = that.equal;
        wrappedExpect.inspect = that.inspect;
        wrappedExpect.createOutput = that.createOutput.bind(that);
        wrappedExpect.diff = that.diff;
        wrappedExpect.findTypeOf = that.findTypeOf.bind(that);
        wrappedExpect.findCommonType = that.findCommonType.bind(that);
        wrappedExpect.getType = that.getType;
        wrappedExpect.output = that.output;
        wrappedExpect.outputFormat = that.outputFormat;
        wrappedExpect.format = that.format;
        wrappedExpect.it = that.it.bind(that);
        wrappedExpect.executionContext = executionContext;

        wrappedExpect.errorMode = 'default';
        wrappedExpect.execute = wrappedExpect;
        wrappedExpect.alternations = assertionRule.alternations;
        wrappedExpect.flags = flags;
        wrappedExpect.subject = subject;
        wrappedExpect.testDescription = testDescriptionString;
        wrappedExpect.args = args;

        wrappedExpect.subjectOutput = function (output) {
            output.appendInspected(subject);
        };
        wrappedExpect.argsOutput = args.map(function (arg) {
            return function (output) {
                output.appendInspected(arg);
            };
        });

        var result = assertionRule.handler.apply(wrappedExpect, [wrappedExpect, subject].concat(args));
        return oathbreaker(result);
    }

    var args = Array.prototype.slice.call(arguments, 2);
    try {
        var result = executeExpect(executionContext, subject, testDescriptionString, args);
        if (isPendingPromise(result)) {
            testFrameworkPatch.promiseCreated();
            result = result.then(undefined, function (e) {
                if (e && e._isUnexpected) {
                    that.setErrorMessage(e);
                }
                throw e;
            });
        } else {
            executionContext.serializeErrorsFromWrappedExpect = true;
            if (!result || typeof result.then !== 'function') {
                result = makePromise.resolve(result);
            }
        }
        result.and = makeAndMethod(that.expect, subject);
        return result;
    } catch (e) {
        if (e && e._isUnexpected) {
            var newError = e;
            if (typeof mochaPhantomJS !== 'undefined') {
                newError = e.clone();
            }
            that.setErrorMessage(newError);
            throw newError;
        }
        throw e;
    }
};

Unexpected.prototype.getAssertionRule = function (subject, testDescriptionString, args) {
    var that = this;
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
        return assertionRule;
    } else {
        that.fail({
            message: function (output) {
                var definedForIncompatibleTypes = that.types.filter(function (type) {
                    return that.assertions[type.name][testDescriptionString];
                });
                if (definedForIncompatibleTypes.length > 0) {
                    var subjectOutput = function (output) {
                        output.appendInspected(subject);
                    };
                    var argsOutput = args.map(function (arg) {
                        return function (output) {
                            output.appendInspected(arg);
                        };
                    });
                    output
                        .append(createStandardErrorMessage(output.clone(), subjectOutput, testDescriptionString, argsOutput)).nl()
                        .indentLines()
                        .i().error("The assertion '").jsString(testDescriptionString)
                        .error("' is not defined for the type '").jsString(matchingType.name).error("',").nl()
                        .i().error('but it is defined for ')
                        .outdentLines();
                    if (definedForIncompatibleTypes.length === 1) {
                        output.error("the type '").jsString(definedForIncompatibleTypes[0].name).error("'");
                    } else {
                        output.error('these types: ');

                        definedForIncompatibleTypes.forEach(function (incompatibleType, index) {
                            if (index > 0) {
                                output.error(', ');
                            }
                            output.error("'").jsString(incompatibleType.name).error("'");
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
                    });
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
                    output.error("Unknown assertion '").jsString(testDescriptionString)
                        .error("', did you mean: '").jsString(assertionsWithScore[0].assertion).error("'");
                }
            },
            errorMode: 'bubbleThrough'
        });
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
        }, function (err) {
            that._isAsync = false;
            done(err);
        });
    };
};

Unexpected.prototype.diff = function (a, b, output, recursions, seen) {
    output = output || this.createOutput();
    var that = this;

    var maxRecursions = 100;
    recursions = typeof recursions === 'number' ? recursions : maxRecursions;
    if (recursions <= 0) {
        // detect recursive loops in the structure
        seen = seen || [];
        if (seen.indexOf(a) !== -1) {
            throw new Error('Cannot compare circular structures');
        }
        seen.push(a);
    }

    return this.findCommonType(a, b).diff(a, b, output, function (actual, expected) {
        return that.diff(actual, expected, output.clone(), recursions - 1, seen);
    }, function (v, depth) {
        return output.clone().appendInspected(v, depth);
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

Unexpected.prototype.createOutput = function (format) {
    var that = this;
    var output = this.output.clone(format || 'text');
    output.addStyle('appendInspected', function (value, depth) {
        this.append(that.inspect(value, depth, this.clone()));
    });
    return output;
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
                            // Make sure that an empty alternation doesn't produce two spaces:
                            text: alternation ? alternation + pattern.text : pattern.text.replace(/^ /, ''),
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
        throw new Error("Assertion patterns must be a non-empty string");
    }
    if (/^\(?<[a-z.-]+>/.test(pattern)) {
        throw new Error("Assertion patterns cannot use type signature syntax (reserved for future expansion), ^\\(?<[a-z.-]+>");
    }

    if (pattern.match(/^\s|\s$/)) {
        throw new Error("Assertion patterns can't start or end with whitespace");
    }

    ensureValidUseOfParenthesesOrBrackets(pattern);
}

module.exports = Unexpected;
