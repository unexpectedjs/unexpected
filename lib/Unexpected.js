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
var createWrappedExpectProto = require('./createWrappedExpectProto');

var anyType = {
    name: 'any',
    level: 0,
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
    this.assertions = options.assertions || {};
    this.typeByName = options.typeByName || {any: anyType};
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
    this._wrappedExpectProto = createWrappedExpectProto(this);
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

Unexpected.prototype.inspect = function (obj, depth, outputOrFormat) {
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

    var output = typeof outputOrFormat === 'string' ? this.createOutput(outputOrFormat) : outputOrFormat;
    output = output || this.createOutput();
    return printOutput(obj, typeof depth === 'number' ? depth : defaultDepth, output) || output;
};

Unexpected.prototype.parseAssertion = function (assertionString) {
    var that = this;
    var tokens = [];
    var nextIndex = 0;

    function lookupType(typeName) {
        var result = that.typeByName[typeName];
        if (!result) {
            throw new Error('Unknown type: ' + typeName + ' in ' + assertionString);
        }
        return result;
    }

    function parseType(assertionString) {
        return assertionString.split('|').map(function (type) {
            var matchNameAndOperator = type.match(/^([a-z_](?:|[a-z0-9_.-]*[_a-z0-9]))([+*?]|)$/i);
            if (!matchNameAndOperator) {
                throw new SyntaxError('Cannot parse type declaration:' + type);
            }
            var operator = matchNameAndOperator[2];
            return {
                minimum: !operator || operator === '+' ? 1 : 0,
                maximum: operator === '*' || operator === '+' ? Infinity : 1,
                type: lookupType(matchNameAndOperator[1])
            };
        });
    }

    function hasVarargs(types) {
        return types.some(function (type) {
            return type.minimum !== 1 || type.maximum !== 1;
        });
    }
    assertionString.replace(/\s*<((?:[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])[?*+]?)(?:\|(?:[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])[?*+]?))*)>|\s*([^<]+)/ig, function ($0, $1, $2, index) {

        if (index !== nextIndex) {
            throw new SyntaxError('Cannot parse token at index ' + nextIndex + ' in ' + assertionString);
        }
        if ($1) {
            tokens.push(parseType($1));
        } else {
            tokens.push($2.trim());
        }
        nextIndex += $0.length;
    });

    if (tokens.length === 1 && typeof tokens[0] === 'string') {
        return {
            subject: parseType('any'),
            assertion: tokens[0],
            args: [parseType('any*')]
        };
    }

    var result = {
        subject: tokens[0],
        assertion: tokens[1],
        args: tokens.slice(2)
    };
    if (!Array.isArray(result.subject)) {
        throw new SyntaxError('Missing subject type in ' + assertionString);
    }
    if (typeof result.assertion !== 'string')  {
        throw new SyntaxError('Missing assertion in ' + assertionString);
    }
    if (hasVarargs(result.subject)) {
        throw new SyntaxError('The subject type cannot have varargs: ' + assertionString);
    }
    if (result.args.slice(0, -1).some(function (type) { return hasVarargs(type); })) {
        throw new SyntaxError('Only the last argument type can have varargs: ' + assertionString);
    }
    return result;
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
        patterns = (Array.isArray(types) ? types : [types]).map(function (pattern) {
            return '<any> ' + pattern + ' <any*>';
        });
    } else {
        var subjectTypeConstraint = (Array.isArray(types) ? types : [types]).map(function (type) {
            return typeof type === 'string' ? type : type.name;
        }).join('|');

        if (subjectTypeConstraint) {
            subjectTypeConstraint = '<' + subjectTypeConstraint + '> ';
            patterns = (Array.isArray(patterns) ? patterns : [patterns]).map(function (pattern) {
                return subjectTypeConstraint + pattern + ' <any*>';
            });
        }
    }

    var that = this;
    var assertions = this.assertions;
    var isSeenByExpandedPattern = {};

    var defaultValueByFlag = {};
    var assertionHandlers = [];
    patterns.forEach(function (pattern) {
        var assertionDeclaration = that.parseAssertion(pattern);
        ensureValidAssertionPattern(assertionDeclaration.assertion);
        var expandedAssertions = expandAssertion(assertionDeclaration.assertion);
        expandedAssertions.forEach(function (expandedAssertion) {
            if (isSeenByExpandedPattern[expandedAssertion.text]) {
                return;
            }

            Object.keys(expandedAssertion.flags).forEach(function (flag) {
                defaultValueByFlag[flag] = false;
            });

            isSeenByExpandedPattern[expandedAssertion.text] = true;
            assertionHandlers.push({
                handler: handler,
                alternations: expandedAssertion.alternations,
                flags: expandedAssertion.flags,
                subject: assertionDeclaration.subject,
                args: assertionDeclaration.args,
                testDescriptionString: expandedAssertion.text,
                declaration: pattern
            });
        });
    });


    assertionHandlers.forEach(function (handler) {
        // Make sure that all flags are defined.
        handler.flags = extend({}, defaultValueByFlag, handler.flags);

        var assertionHandlers = assertions[handler.testDescriptionString];
        if (!assertionHandlers) {
            assertions[handler.testDescriptionString] = [handler];
        } else {
            // TODO ensure we don't add duplicates
            assertionHandlers.push(handler);
        }
    });

    return this.expect; // for chaining
};

Unexpected.prototype.addType = function (type) {
    var that = this;
    var baseType;
    if (typeof type.name !== 'string' || !/^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$/i.test(type.name)) {
        throw new Error('A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
    }

    if (typeof type.identify !== 'function' && type.identify !== false) {
        throw new Error('Type ' + type.name + ' must specify an identify function or be declared abstract by setting identify to false');
    }

    if (this.getType(type.name)) {
        throw new Error('The type with the name ' + type.name + ' already exists');
    }

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
        this.types.push(extendedType);
    } else {
        this.types.unshift(extendedType);
    }

    extendedType.level += 1;
    this.typeByName[extendedType.name] = extendedType;


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
    // TODO For testing purpose while we don't have all the pieces yet
    expect.parseAssertion = unexpected.parseAssertion.bind(unexpected);

    return expect;
}

function calculateLimits(items) {
    return items.reduce(function (result, item) {
        result.minimum += item.minimum;
        result.maximum += item.maximum;
        return result;
    }, { minimum: 0, maximum: 0 });
}

Unexpected.prototype.throwAssertionNotFoundError = function (subject, testDescriptionString, args) {
    var assertionsWithScore = [];
    var assertionStrings = Object.keys(this.assertions);

    assertionStrings.forEach(function (assertionString) {
        var typeMatchBonus = 0;
        try {
            if (this.lookupAssertionRule(subject, assertionString, args)) {
                typeMatchBonus += 0.9;
            }
        } catch (e) {
            // Ignore
        }

        assertionsWithScore.push({
            assertion: assertionString,
            score: typeMatchBonus - leven(testDescriptionString, assertionString)
        });
    }, this);

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
    this.fail({
        errorMode: 'bubbleThrough',
        message: function (output) {

            output.error("Unknown assertion '").jsString(testDescriptionString)
                .error("', did you mean: '").jsString(assertionsWithScore[0].assertion).error("'");
        }
    });
};

Unexpected.prototype.lookupAssertionRule = function (subject, testDescriptionString, args) {
    if (typeof testDescriptionString !== 'string') {
        throw new Error('The expect function requires the second parameter to be a string.');
    }

    var cachedTypes = {};

    var that = this;
    function matchesType(type, value, key) {
        if (type.identify === false) {
            var valueType = cachedTypes[key];
            if (!valueType) {
                cachedTypes[key] = valueType = that.findTypeOf(value);
            }
            return valueType.is(type);
        } else {
            return type.identify(value);
        }
    }

    var assertions = this.assertions[testDescriptionString];
    if (!assertions) {
        this.throwAssertionNotFoundError(subject, testDescriptionString, args);
    }

    var machingAssertions = assertions.filter(function (assertion) {
        var matchingSubject = assertion.subject.some(function (subjectRequirement) {
            return matchesType(subjectRequirement.type, subject, 'subject');
        });

        if (!matchingSubject) {
            return false;
        }

        var requireArgumentsLength = calculateLimits(assertion.args.map(calculateLimits));

        if (args.length < requireArgumentsLength.minimum && requireArgumentsLength.maximum < args.length) {
            return false;
        }

        return args.every(function (arg, i) {
            if (i < assertion.args.length) {
                return assertion.args[i].some(function (argRequirement) {
                    return matchesType(argRequirement.type, arg);
                });
            } else {
                return assertion.args[assertion.args.length - 1].some(function (argRequirement) {
                    if (i > argRequirement.maximum - assertion.args.length) {
                        return false;
                    }

                    return matchesType(argRequirement.type, arg, i);
                });
            }
        });
    });

    if (machingAssertions.length === 1) {
        return machingAssertions[0];
    }

    if (machingAssertions.length === 0) {
        that.fail({
            errorMode: 'bubbleThrough',
            message: function (output) {
                var subjectOutput = function (output) {
                    output.appendInspected(subject);
                };
                var argsOutput = function (output) {
                    output.appendItems(args, ', ');
                };
                output.append(createStandardErrorMessage(output.clone(), subjectOutput, testDescriptionString, argsOutput)).nl()
                    .indentLines();
                output.i().error('No matching assertion, did you mean:').nl();
                assertions.forEach(function (assertion, i) {
                    output.nl(i > 0 ? 1 : 0).i().text(assertion.declaration);
                });
            }
        });
    }

    function calculateRequrementsScore(requireArguments) {
        // TODO handle varargs and optional parameters
        return requireArguments.reduce(function (score, requirement) {
            return Math.max(score, requirement.type.level);
        }, 0);
    }

    function calculateAssertionScope(assertion) {
        return assertion.args.reduce(function (result, requirements) {
            return result + calculateRequrementsScore(requirements);
        }, calculateRequrementsScore(assertion.subject));
    }

    if (machingAssertions.length > 1) {
        // multiple matching assertions

        var perfectMatch;
        var bestMatch = { score: -Infinity };

        machingAssertions.forEach(function (assertion) {
            var score = calculateAssertionScope(assertion);
            if (!bestMatch || bestMatch.score <= score) {
                perfectMatch = bestMatch.score !== score;
                bestMatch = { score: score, assertion: assertion };
            }
        });

        if (perfectMatch) {
            return bestMatch.assertion;
        }

        var ambiguousAssertions = machingAssertions.map(function (assertion) {
            return { score: calculateAssertionScope(assertion), assertion: assertion };
        }).sort(function (a, b) {
            return b.score - a.score;
        }).filter(function (assertionWithScore, i, arr) {
            return assertionWithScore.score === arr[0].score;
        }).map(function (assertionWithScore) {
            return assertionWithScore.assertion.declaration;
        });

        that.fail({
            errorMode: 'bubbleThrough',
            message: function (output) {
                var subjectOutput = function (output) {
                    output.appendInspected(subject);
                };
                var argsOutput = function (output) {
                    output.appendItems(args, ', ');
                };
                output.append(createStandardErrorMessage(output.clone(), subjectOutput, testDescriptionString, argsOutput)).nl(2);
                output.error('Ambiguous assertions:').nl();
                output.appendItems(ambiguousAssertions, '\n');
            }
        });
    }
};

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

    function executeExpect(subject, testDescriptionString, args) {
        var assertionRule = that.lookupAssertionRule(subject, testDescriptionString, args);
        var flags = extend({}, assertionRule.flags);
        var wrappedExpect = function () {
            var subject = arguments[0];
            var testDescriptionString = arguments[1].replace(/\[(!?)([^\]]+)\] ?/g, function (match, negate, flag) {
                return Boolean(flags[flag]) !== Boolean(negate) ? flag + ' ' : '';
            }).trim();

            var args = Array.prototype.slice.call(arguments, 2);
            return wrappedExpect.callInNestedContext(function () {
                return executeExpect(subject, testDescriptionString, args);
            });
        };

        utils.setPrototypeOfOrExtend(wrappedExpect, that._wrappedExpectProto);

        wrappedExpect._context = executionContext;
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

        return oathbreaker(assertionRule.handler.apply(wrappedExpect, [wrappedExpect, subject].concat(args)));
    }

    var args = Array.prototype.slice.call(arguments, 2);
    try {
        var result = executeExpect(subject, testDescriptionString, args);
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
    Object.keys(this.assertions).forEach(function (assertion) {
        clonedAssertions[assertion] = [].concat(this.assertions[assertion]);
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

var expandAssertion = (function () {
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

function ensureValidAssertionPattern(pattern) {
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
