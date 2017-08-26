var createStandardErrorMessage = require('./createStandardErrorMessage');
var utils = require('./utils');
var magicpen = require('magicpen');
var extend = utils.extend;
var leven = require('leven');
var makePromise = require('./makePromise');
var addAdditionalPromiseMethods = require('./addAdditionalPromiseMethods');
var isPendingPromise = require('./isPendingPromise');
var oathbreaker = require('./oathbreaker');
var UnexpectedError = require('./UnexpectedError');
var notifyPendingPromise = require('./notifyPendingPromise');
var defaultDepth = require('./defaultDepth');
var createWrappedExpectProto = require('./createWrappedExpectProto');
var AssertionString = require('./AssertionString');
var throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');
var makeDiffResultBackwardsCompatible = require('./makeDiffResultBackwardsCompatible');

function isAssertionArg(arg) {
    return arg.type.is('assertion');
}

function Context(unexpected) {
    this.expect = unexpected;
    this.level = 0;
}

Context.prototype.child = function () {
    var child = Object.create(this);
    child.level++;
    return child;
};

var anyType = {
    _unexpectedType: true,
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
            return 'type: ' + this.name;
        }
    },
    diff: function (actual, expected, output, diff, inspect) {
        return null;
    },
    typeEqualityCache: {},
    is: function (typeOrTypeName) {
        var typeName;
        if (typeof typeOrTypeName === 'string') {
            typeName = typeOrTypeName;
        } else {
            typeName = typeOrTypeName.name;
        }

        var cachedValue = this.typeEqualityCache[typeName];
        if (typeof cachedValue !== 'undefined') {
            return cachedValue;
        }

        var result = false;
        if (this.name === typeName) {
            result = true;
        } else if (this.baseType) {
            result = this.baseType.is(typeName);
        }
        this.typeEqualityCache[typeName] = result;
        return result;
    }
};


function Unexpected(options) {
    options = options || {};
    this.assertions = options.assertions || {};
    this.typeByName = options.typeByName || {any: anyType};
    this.types = options.types || [anyType];
    if (options.output) {
        this.output = options.output;
    } else {
        this.output = magicpen();
        this.output.inline = false;
        this.output.diff = false;
    }
    this._outputFormat = options.format || magicpen.defaultFormat;
    this.installedPlugins = options.installedPlugins || [];

    // Make bound versions of these two helpers up front to save a bit when creating wrapped expects:
    var that = this;
    this.getType = function (typeName) {
        return that.typeByName[typeName] || (that.parent && that.parent.getType(typeName));
    };
    this.findTypeOf = function (obj) {
        return utils.findFirst(that.types || [], function (type) {
            return type.identify && type.identify(obj);
        }) || (that.parent && that.parent.findTypeOf(obj));
    };
    this.findTypeOfWithParentType = function (obj, requiredParentType) {
        return utils.findFirst(that.types || [], function (type) {
            return type.identify && type.identify(obj) && (!requiredParentType || type.is(requiredParentType));
        }) || (that.parent && that.parent.findTypeOfWithParentType(obj, requiredParentType));
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

function evaluateGroup(unexpected, context, subject, orGroup) {
    return orGroup.map(function (expectation) {
        var args = Array.prototype.slice.call(expectation);
        args.unshift(subject);
        return {
            expectation: args,
            promise: makePromise(function () {
                if (typeof args[1] === 'function') {
                    if (args.length > 2) {
                        throw new Error('expect.it(<function>) does not accept additional arguments');
                    } else {
                        // expect.it(function (value) { ... })
                        return args[1](args[0]);
                    }
                } else {
                    return unexpected._expect(context.child(), args);
                }
            })
        };
    });
}

function writeGroupEvaluationsToOutput(output, groupEvaluations) {
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
                if (isRejected) {
                    output.error('⨯ ');
                } else {
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

function createExpectIt(unexpected, expectations) {
    var orGroups = getOrGroups(expectations);

    function expectIt(subject, context) {
        context = (
            context &&
            typeof context === 'object' &&
            context instanceof Context
        ) ? context : new Context(unexpected);

        var groupEvaluations = [];
        var promises = [];
        orGroups.forEach(function (orGroup) {
            var evaluations = evaluateGroup(unexpected, context, subject, orGroup);
            evaluations.forEach(function (evaluation) {
                promises.push(evaluation.promise);
            });
            groupEvaluations.push(evaluations);
        });

        return oathbreaker(makePromise.settle(promises).then(function () {
            groupEvaluations.forEach(function (groupEvaluation) {
                groupEvaluation.forEach(function (evaluation) {
                    if (evaluation.promise.isRejected() && evaluation.promise.reason().errorMode === 'bubbleThrough') {
                        throw evaluation.promise.reason();
                    }
                });
            });

            if (!groupEvaluations.some(function (groupEvaluation) {
                return groupEvaluation.every(function (evaluation) {
                    return evaluation.promise.isFulfilled();
                });
            })) {
                unexpected.fail(function (output) {
                    writeGroupEvaluationsToOutput(output, groupEvaluations);
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
        return createExpectIt(unexpected, copiedExpectations);
    };
    expectIt.or = function () {
        var copiedExpectations = expectations.slice();
        copiedExpectations.push(OR, arguments);
        return createExpectIt(unexpected, copiedExpectations);
    };
    return expectIt;
}

Unexpected.prototype.it = function () { // ...
    return createExpectIt(this, [arguments]);
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
    function printOutput(obj, currentDepth, output) {
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
            output = printOutput(v, childDepth, output) || output;
            seen.pop();
            return output;
        });
    };

    var output = typeof outputOrFormat === 'string' ? this.createOutput(outputOrFormat) : outputOrFormat;
    output = output || this.createOutput();
    return printOutput(obj, typeof depth === 'number' ? depth : defaultDepth, output) || output;
};

Unexpected.prototype.expandTypeAlternations = function (assertion) {
    var that = this;
    function createPermutations(args, i) {
        if (i === args.length) {
            return [];
        }

        var result = [];
        args[i].forEach(function (arg) {
            var tails = createPermutations(args, i + 1);
            if (tails.length) {
                tails.forEach(function (tail) {
                    result.push([arg].concat(tail));
                });
            } else if (arg.type.is('assertion')) {
                result.push([
                    { type: arg.type, minimum: 1, maximum: 1 },
                    { type: that.getType('any'), minimum: 0, maximum: Infinity }
                ]);
                result.push([
                    { type: that.getType('expect.it'), minimum: 1, maximum: 1 }
                ]);
                if (arg.minimum === 0) { // <assertion?>
                    result.push([]);
                }
            } else {
                result.push([arg]);
            }
        });
        return result;
    }
    var result = [];
    assertion.subject.forEach(function (subjectRequirement) {
        if (assertion.args.length) {
            createPermutations(assertion.args, 0).forEach(function (args) {
                result.push(extend({}, assertion, {
                    subject: subjectRequirement,
                    args: args
                }));
            });
        } else {
            result.push(extend({}, assertion, {
                subject: subjectRequirement,
                args: []
            }));
        }
    });
    return result;
};

Unexpected.prototype.parseAssertion = function (assertionString) {
    var that = this;
    var tokens = [];
    var nextIndex = 0;

    function parseTypeToken(typeToken) {
        return typeToken.split('|').map(function (typeDeclaration) {
            var matchNameAndOperator = typeDeclaration.match(/^([a-z_](?:|[a-z0-9_.-]*[_a-z0-9]))([+*?]|)$/i);
            if (!matchNameAndOperator) {
                throw new SyntaxError('Cannot parse type declaration:' + typeDeclaration);
            }
            var type = that.getType(matchNameAndOperator[1]);
            if (!type) {
                throw new Error('Unknown type: ' + matchNameAndOperator[1] + ' in ' + assertionString);
            }
            var operator = matchNameAndOperator[2];
            return {
                minimum: !operator || operator === '+' ? 1 : 0,
                maximum: operator === '*' || operator === '+' ? Infinity : 1,
                type: type
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
            tokens.push(parseTypeToken($1));
        } else {
            tokens.push($2.trim());
        }
        nextIndex += $0.length;
    });

    var assertion;
    if (tokens.length === 1 && typeof tokens[0] === 'string') {
        assertion = {
            subject: parseTypeToken('any'),
            assertion: tokens[0],
            args: [parseTypeToken('any*')]
        };
    } else {
        assertion = {
            subject: tokens[0],
            assertion: tokens[1],
            args: tokens.slice(2)
        };
    }

    if (!Array.isArray(assertion.subject)) {
        throw new SyntaxError('Missing subject type in ' + assertionString);
    }
    if (typeof assertion.assertion !== 'string')  {
        throw new SyntaxError('Missing assertion in ' + assertionString);
    }
    if (hasVarargs(assertion.subject)) {
        throw new SyntaxError('The subject type cannot have varargs: ' + assertionString);
    }
    if (assertion.args.some(function (arg) { return typeof arg === 'string'; })) {
        throw new SyntaxError('Only one assertion string is supported (see #225)');
    }

    if (assertion.args.slice(0, -1).some(hasVarargs)) {
        throw new SyntaxError('Only the last argument type can have varargs: ' + assertionString);
    }
    if ([assertion.subject].concat(assertion.args.slice(0, -1)).some(function (argRequirements) {
        return argRequirements.some(function (argRequirement) {
            return argRequirement.type.is('assertion');
        });
    })) {
        throw new SyntaxError('Only the last argument type can be <assertion>: ' + assertionString);
    }

    var lastArgRequirements = assertion.args[assertion.args.length - 1] || [];
    var assertionRequirements = lastArgRequirements.filter(function (argRequirement) {
        return argRequirement.type.is('assertion');
    });

    if (assertionRequirements.length > 0 && lastArgRequirements.length > 1) {
        throw new SyntaxError('<assertion> cannot be alternated with other types: ' + assertionString);
    }

    if (assertionRequirements.some(function (argRequirement) {
        return argRequirement.maximum !== 1;
    })) {
        throw new SyntaxError('<assertion+> and <assertion*> are not allowed: ' + assertionString);
    }
    return this.expandTypeAlternations(assertion);
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
        error.errorMode = 'bubble';
        error.output = arg;
    } else if (arg && typeof arg === 'object') {
        if (typeof arg.message !== 'undefined') {
            error.errorMode = 'bubble';
        }
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
        var expect = this.expect;
        Object.keys(arg).forEach(function (key) {
            var value = arg[key];
            if (key === 'diff') {
                if (typeof value === 'function' && this.parent) {
                    error.createDiff = function (output, diff, inspect, equal) {
                        var childOutput = expect.createOutput(output.format);
                        childOutput.inline = output.inline;
                        childOutput.output = output.output;
                        return value(childOutput, function diff(actual, expected) {
                            return expect.diff(actual, expected, childOutput.clone());
                        }, function inspect(v, depth) {
                            return childOutput.clone().appendInspected(v, (depth || defaultDepth) - 1);
                        }, function (actual, expected) {
                            return expect.equal(actual, expected);
                        });
                    };
                } else {
                    error.createDiff = value;
                }
            } else if (key !== 'message') {
                error[key] = value;
            }
        }, this);
    } else {
        var placeholderArgs;
        if (arguments.length > 0) {
            placeholderArgs = new Array(arguments.length - 1);
            for (var i = 1 ; i < arguments.length ; i += 1) {
                placeholderArgs[i - 1] = arguments[i];
            }
        }
        error.errorMode = 'bubble';
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

function compareSpecificities(a, b) {
    for (var i = 0; i < Math.min(a.length, b.length); i += 1) {
        var c = b[i] - a[i];
        if (c !== 0) {
            return c;
        }
    }
    return b.length - a.length;
}

function calculateAssertionSpecificity(assertion) {
    return [assertion.subject.type.level].concat(assertion.args.map(function (argRequirement) {
        var bonus = argRequirement.minimum === 1 && argRequirement.maximum === 1 ?
            0.5 : 0;
        return bonus + argRequirement.type.level;
    }));
}

Unexpected.prototype.addAssertion = function (patternOrPatterns, handler, childUnexpected) {
    var maxArguments;
    if (typeof childUnexpected === 'object') {
        maxArguments = 3;
    } else {
        maxArguments = 2;
    }
    if (arguments.length > maxArguments || typeof handler !== 'function' || (typeof patternOrPatterns !== 'string' && !Array.isArray(patternOrPatterns))) {
        var errorMessage = "Syntax: expect.addAssertion(<string|array[string]>, function (expect, subject, ...) { ... });";
        if ((typeof handler === 'string' || Array.isArray(handler)) && typeof arguments[2] === 'function') {
            errorMessage +=
                '\nAs of Unexpected 10, the syntax for adding assertions that apply only to specific\n' +
                'types has changed. See http://unexpected.js.org/api/addAssertion/';
        }
        throw new Error(errorMessage);
    }
    var patterns = (Array.isArray(patternOrPatterns) ? patternOrPatterns : [patternOrPatterns]);
    patterns.forEach(function (pattern) {
        if (typeof pattern !== 'string' || pattern === '') {
            throw new Error('Assertion patterns must be a non-empty string');
        } else {
            if (pattern !== pattern.trim()) {
                throw new Error("Assertion patterns can't start or end with whitespace:\n\n    " + JSON.stringify(pattern));
            }
        }
    });

    var that = this;
    var assertions = this.assertions;

    var defaultValueByFlag = {};
    var assertionHandlers = [];
    var maxNumberOfArgs = 0;
    patterns.forEach(function (pattern) {
        var assertionDeclarations = that.parseAssertion(pattern);
        assertionDeclarations.forEach(function (assertionDeclaration) {
            ensureValidUseOfParenthesesOrBrackets(assertionDeclaration.assertion);
            var expandedAssertions = expandAssertion(assertionDeclaration.assertion);
            expandedAssertions.forEach(function (expandedAssertion) {
                Object.keys(expandedAssertion.flags).forEach(function (flag) {
                    defaultValueByFlag[flag] = false;
                });
                maxNumberOfArgs = Math.max(maxNumberOfArgs, assertionDeclaration.args.reduce(function (previous, argDefinition) {
                    return previous + (argDefinition.maximum === null ? Infinity : argDefinition.maximum);
                }, 0));
                assertionHandlers.push({
                    handler: handler,
                    alternations: expandedAssertion.alternations,
                    flags: expandedAssertion.flags,
                    subject: assertionDeclaration.subject,
                    args: assertionDeclaration.args,
                    testDescriptionString: expandedAssertion.text,
                    declaration: pattern,
                    unexpected: childUnexpected
                });
            });
        });
    });
    if (handler.length - 2 > maxNumberOfArgs) {
        throw new Error('The provided assertion handler takes ' + (handler.length - 2) + ' parameters, but the type signature specifies a maximum of ' + maxNumberOfArgs + ':\n\n    ' + JSON.stringify(patterns));
    }

    assertionHandlers.forEach(function (handler) {
        // Make sure that all flags are defined.
        handler.flags = extend({}, defaultValueByFlag, handler.flags);

        var assertionHandlers = assertions[handler.testDescriptionString];
        handler.specificity = calculateAssertionSpecificity(handler);
        if (!assertionHandlers) {
            assertions[handler.testDescriptionString] = [handler];
        } else {
            var i = 0;
            while (i < assertionHandlers.length && compareSpecificities(handler.specificity, assertionHandlers[i].specificity) > 0) {
                i += 1;
            }
            assertionHandlers.splice(i, 0, handler);
        }
    });

    return this.expect; // for chaining
};

Unexpected.prototype.addType = function (type, childUnexpected) {
    var that = this;
    var baseType;
    if (typeof type.name !== 'string' || !/^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$/i.test(type.name)) {
        throw new Error('A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
    }

    if (typeof type.identify !== 'function' && type.identify !== false) {
        throw new Error('Type ' + type.name + ' must specify an identify function or be declared abstract by setting identify to false');
    }

    if (this.typeByName[type.name]) {
        throw new Error('The type with the name ' + type.name + ' already exists');
    }

    if (type.base) {
        baseType = this.getType(type.base);

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

        return baseType.inspect(value, depth, output, function (value, depth) {
            return output.clone().appendInspected(value, depth);
        });
    };

    extendedBaseType.diff = function (actual, expected, output) {
        if (!output || !output.isMagicPen) {
            throw new Error('You need to pass the output to baseType.diff() as the third parameter');
        }

        return makeDiffResultBackwardsCompatible(baseType.diff(actual, expected,
                      output.clone(),
                      function (actual, expected) {
                          return that.diff(actual, expected, output.clone());
                      },
                      function (value, depth) {
                          return output.clone().appendInspected(value, depth);
                      },
                      that.equal.bind(that)));
    };

    extendedBaseType.equal = function (actual, expected) {
        return baseType.equal(actual, expected, that.equal.bind(that));
    };

    var extendedType = extend({}, baseType, type, { baseType: extendedBaseType });
    var originalInspect = extendedType.inspect;

    extendedType.inspect = function (obj, depth, output, inspect) {
        if (arguments.length < 2 || (!output || !output.isMagicPen)) {
            return 'type: ' + type.name;
        } else if (childUnexpected) {
            var childOutput = childUnexpected.createOutput(output.format);
            return originalInspect.call(this, obj, depth, childOutput, inspect) || childOutput;
        } else {
            return originalInspect.call(this, obj, depth, output, inspect) || output;
        }
    };

    if (childUnexpected) {
        extendedType.childUnexpected = childUnexpected;
        var originalDiff = extendedType.diff;
        extendedType.diff = function (actual, expected, output, inspect, diff, equal) {
            var childOutput = childUnexpected.createOutput(output.format);
            // Make sure that already buffered up output is preserved:
            childOutput.output = output.output;
            return originalDiff.call(this, actual, expected, childOutput, inspect, diff, equal) || output;
        };
    }

    if (extendedType.identify === false) {
        this.types.push(extendedType);
    } else {
        this.types.unshift(extendedType);
    }

    extendedType.level = baseType.level + 1;
    extendedType.typeEqualityCache = {};
    this.typeByName[extendedType.name] = extendedType;

    return this.expect;
};

Unexpected.prototype.addStyle = function (...args) {
    this.output.addStyle(...args);
    return this.expect;
};

Unexpected.prototype.installTheme = function (...args) {
    this.output.installTheme(...args);
    return this.expect;
};

function getPluginName(plugin) {
    if (typeof plugin === 'function') {
        return utils.getFunctionName(plugin);
    } else {
        return plugin.name;
    }
}

Unexpected.prototype.use = function (plugin) {
    if ((typeof plugin !== 'function' && (typeof plugin !== 'object' || typeof plugin.installInto !== 'function')) ||
        (typeof plugin.name !== 'undefined' && typeof plugin.name !== 'string')) {
        throw new Error(
            'Plugins must be functions or adhere to the following interface\n' +
            '{\n' +
            '  name: <an optional plugin name>,\n' +
            '  version: <an optional semver version string>,\n' +
            '  installInto: <a function that will update the given expect instance>\n' +
            '}'
        );
    }


    var pluginName = getPluginName(plugin);

    var existingPlugin = utils.findFirst(this.installedPlugins, function (installedPlugin) {
        if (installedPlugin === plugin) {
            return true;
        } else {
            return pluginName && pluginName === getPluginName(installedPlugin);
        }
    });

    if (existingPlugin) {
        if (existingPlugin === plugin || (typeof plugin.version !== 'undefined' && plugin.version === existingPlugin.version)) {
            // No-op
            return this.expect;
        } else {
            throw new Error("Another instance of the plugin '" + pluginName + "' " +
                            "is already installed" +
                            (typeof existingPlugin.version !== 'undefined' ?
                                ' (version ' + existingPlugin.version +
                                (typeof plugin.version !== 'undefined' ?
                                    ', trying to install ' + plugin.version : '') +
                                ')' : '') +
                            ". Please check your node_modules folder for unmet peerDependencies.");
        }
    }

    if (pluginName === 'unexpected-promise') {
        throw new Error('The unexpected-promise plugin was pulled into Unexpected as of 8.5.0. This means that the plugin is no longer supported.');
    }

    this.installedPlugins.push(plugin);
    if (typeof plugin === 'function') {
        plugin(this.expect);
    } else {
        plugin.installInto(this.expect);
    }

    return this.expect; // for chaining
};

Unexpected.prototype.withError = function (body, handler) {
    return oathbreaker(makePromise(body).caught(function (e) {
        throwIfNonUnexpectedError(e);
        return handler(e);
    }));
};

Unexpected.prototype.installPlugin = Unexpected.prototype.use; // Legacy alias

function installExpectMethods(unexpected) {
    var expect = function () { /// ...
        return unexpected._expect(new Context(unexpected), arguments);
    };
    expect.it = unexpected.it.bind(unexpected);
    expect.equal = unexpected.equal.bind(unexpected);
    expect.inspect = unexpected.inspect.bind(unexpected);
    expect.findTypeOf = unexpected.findTypeOf; // Already bound
    expect.fail = function (...args) {
        try {
            unexpected.fail(...args);
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
    expect.withError = unexpected.withError;
    expect.addAssertion = unexpected.addAssertion.bind(unexpected);
    expect.addStyle = unexpected.addStyle.bind(unexpected);
    expect.installTheme = unexpected.installTheme.bind(unexpected);
    expect.addType = unexpected.addType.bind(unexpected);
    expect.getType = unexpected.getType;
    expect.clone = unexpected.clone.bind(unexpected);
    expect.child = unexpected.child.bind(unexpected);
    expect.toString = unexpected.toString.bind(unexpected);
    expect.assertions = unexpected.assertions;
    expect.use = expect.installPlugin = unexpected.use.bind(unexpected);
    expect.output = unexpected.output;
    expect.outputFormat = unexpected.outputFormat.bind(unexpected);
    expect.notifyPendingPromise = notifyPendingPromise;
    expect.hook = function (fn) {
        unexpected._expect = fn(unexpected._expect.bind(unexpected));
    };
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
    var candidateHandlers = this.assertions[testDescriptionString];
    var that = this;
    if (candidateHandlers) {
        this.fail({
            message: function (output) {
                var subjectOutput = function (output) {
                    output.appendInspected(subject);
                };
                var argsOutput = function (output) {
                    output.appendItems(args, ', ');
                };
                output.append(createStandardErrorMessage(output.clone(), subjectOutput, testDescriptionString, argsOutput)).nl()
                    .indentLines();
                output.i().error('The assertion does not have a matching signature for:').nl()
                    .indentLines().i().text('<').text(that.findTypeOf(subject).name).text('>').sp().text(testDescriptionString);

                args.forEach(function (arg, i) {
                    output.sp().text('<').text(that.findTypeOf(arg).name).text('>');
                });

                output
                    .outdentLines()
                    .nl()
                    .i().text('did you mean:')
                    .indentLines()
                    .nl();
                var assertionDeclarations = Object.keys(candidateHandlers.reduce(function (result, handler) {
                    result[handler.declaration] = true;
                    return result;
                }, {})).sort();
                assertionDeclarations.forEach(function (declaration, i) {
                    output.nl(i > 0 ? 1 : 0).i().text(declaration);
                });
                output.outdentLines();
            }
        });
    }

    var assertionsWithScore = [];
    var assertionStrings = [];
    var instance = this;
    while (instance) {
        assertionStrings.push(...Object.keys(instance.assertions));
        instance = instance.parent;
    }

    function compareAssertions(a, b) {
        var aAssertion = that.lookupAssertionRule(subject, a, args);
        var bAssertion = that.lookupAssertionRule(subject, b, args);
        if (!aAssertion && !bAssertion) {
            return 0;
        }
        if (aAssertion && !bAssertion) {
            return -1;
        }
        if (!aAssertion && bAssertion) {
            return 1;
        }

        return compareSpecificities(aAssertion.specificity, bAssertion.specificity);
    }

    assertionStrings.forEach(function (assertionString) {
        var score = leven(testDescriptionString, assertionString);

        assertionsWithScore.push({
            assertion: assertionString,
            score: score
        });
    }, this);

    var bestMatch = assertionsWithScore.sort(function (a, b) {
        var c = a.score - b.score;
        if (c !== 0) {
            return c;
        }

        if (a.assertion < b.assertion) {
            return -1;
        } else {
            return 1;
        }
    }).slice(0, 10).filter(function (assertionsWithScore, i, arr) {
        return Math.abs(assertionsWithScore.score - arr[0].score) <= 2;
    }).sort(function (a, b) {
        var c = compareAssertions(a.assertion, b.assertion);
        if (c !== 0) {
            return c;
        }

        return a.score - b.score;
    })[0];

    this.fail({
        errorMode: 'bubbleThrough',
        message: function (output) {
            output.error("Unknown assertion '").jsString(testDescriptionString)
                .error("', did you mean: '").jsString(bestMatch.assertion).error("'");
        }
    });
};

Unexpected.prototype.lookupAssertionRule = function (subject, testDescriptionString, args, requireAssertionSuffix) {
    var that = this;
    if (typeof testDescriptionString !== 'string') {
        throw new Error('The expect function requires the second parameter to be a string or an expect.it.');
    }
    var handlers;
    var instance = this;
    while (instance) {
        var instanceHandlers = instance.assertions[testDescriptionString];
        if (instanceHandlers) {
            handlers = handlers ? handlers.concat(instanceHandlers) : instanceHandlers;
        }
        instance = instance.parent;
    }
    if (!handlers) {
        return null;
    }
    var cachedTypes = {};

    function findTypeOf(value, key) {
        var type = cachedTypes[key];
        if (!type) {
            type = that.findTypeOf(value);
            cachedTypes[key] = type;
        }
        return type;
    }

    function matches(value, assertionType, key, relaxed) {
        if (assertionType.is('assertion') && typeof value === 'string') {
            return true;
        }

        if (relaxed) {
            if (assertionType.identify === false) {
                return that.types.some(function (type) {
                    return type.identify && type.is(assertionType) && type.identify(value);
                });
            }
            return assertionType.identify(value);
        } else {
            return findTypeOf(value, key).is(assertionType);
        }
    }

    function matchesHandler(handler, relaxed) {
        if (!matches(subject, handler.subject.type, 'subject', relaxed)) {
            return false;
        }
        if (requireAssertionSuffix && !handler.args.some(isAssertionArg)) {
            return false;
        }

        var requireArgumentsLength = calculateLimits(handler.args);

        if (args.length < requireArgumentsLength.minimum || requireArgumentsLength.maximum < args.length) {
            return false;
        } else if (args.length === 0 && requireArgumentsLength.maximum === 0) {
            return true;
        }

        var lastRequirement = handler.args[handler.args.length - 1];
        return args.every(function (arg, i) {
            if (i < handler.args.length - 1) {
                return matches(arg, handler.args[i].type, i, relaxed);
            } else {
                return matches(arg, lastRequirement.type, i, relaxed);
            }
        });
    }

    var j, handler;
    for (j = 0; j < handlers.length; j += 1) {
        handler = handlers[j];
        if (matchesHandler(handler)) {
            return handler;
        }
    }
    for (j = 0; j < handlers.length; j += 1) {
        handler = handlers[j];
        if (matchesHandler(handler, true)) {
            return handler;
        }
    }

    return null;
};

function makeExpectFunction(unexpected) {
    var expect = installExpectMethods(unexpected);
    unexpected.expect = expect;
    return expect;
}

Unexpected.prototype.setErrorMessage = function (err) {
    err.serializeMessage(this.outputFormat());
};

Unexpected.prototype._expect = function expect(context, args) {
    var that = this;
    var subject = args[0];
    var testDescriptionString = args[1];

    if (args.length < 2) {
        throw new Error('The expect function requires at least two parameters.');
    } else if (testDescriptionString && testDescriptionString._expectIt) {
        return that.expect.withError(function () {
            return testDescriptionString(subject);
        }, function (err) {
            that.fail(err);
        });
    }

    function executeExpect(context, subject, testDescriptionString, args) {
        var assertionRule = that.lookupAssertionRule(subject, testDescriptionString, args);

        if (!assertionRule) {
            var tokens = testDescriptionString.split(' ');
            OUTER: for (var n = tokens.length - 1; n > 0 ; n -= 1) {
                var prefix = tokens.slice(0, n).join(' ');
                var remainingTokens = tokens.slice(n);
                var argsWithAssertionPrepended = [ remainingTokens.join(' ') ].concat(args);
                assertionRule = that.lookupAssertionRule(subject, prefix, argsWithAssertionPrepended, true);
                if (assertionRule) {
                    // Found the longest prefix of the string that yielded a suitable assertion for the given subject and args
                    // To avoid bogus error messages when shifting later (#394) we require some prefix of the remaining tokens
                    // to be a valid assertion name:
                    for (var i = 1 ; i < remainingTokens.length ; i += 1) {
                        if (that.assertions.hasOwnProperty(remainingTokens.slice(0, i + 1).join(' '))) {
                            testDescriptionString = prefix;
                            args = argsWithAssertionPrepended;
                            break OUTER;
                        }
                    }
                }
            }
            if (!assertionRule) {
                that.throwAssertionNotFoundError(subject, testDescriptionString, args);
            }
        }
        if (assertionRule && assertionRule.unexpected && assertionRule.unexpected !== that) {
            return assertionRule.unexpected.expect(subject, testDescriptionString, ...args);
        }

        var flags = extend({}, assertionRule.flags);
        var wrappedExpect = function (subject, testDescriptionString) {
            if (arguments.length === 0) {
                throw new Error('The expect function requires at least one parameter.');
            } else if (arguments.length === 1) {
                return addAdditionalPromiseMethods(makePromise.resolve(subject), wrappedExpect, subject);
            } else if (testDescriptionString && testDescriptionString._expectIt) {
                wrappedExpect.errorMode = 'nested';
                return wrappedExpect.withError(function () {
                    return testDescriptionString(subject);
                }, function (err) {
                    wrappedExpect.fail(err);
                });
            }
            testDescriptionString = utils.forwardFlags(testDescriptionString, flags);

            var args = new Array(arguments.length - 2);
            for (var i = 2 ; i < arguments.length ; i += 1) {
                args[i - 2] = arguments[i];
            }
            return wrappedExpect.callInNestedContext(function () {
                return executeExpect(context.child(), subject, testDescriptionString, args);
            });
        };

        utils.setPrototypeOfOrExtend(wrappedExpect, that._wrappedExpectProto);

        wrappedExpect.context = context;
        wrappedExpect.execute = wrappedExpect;
        wrappedExpect.alternations = assertionRule.alternations;
        wrappedExpect.flags = flags;
        wrappedExpect.subject = subject;
        wrappedExpect.testDescription = testDescriptionString;
        wrappedExpect.args = args;
        wrappedExpect.assertionRule = assertionRule;

        wrappedExpect.subjectOutput = function (output) {
            output.appendInspected(subject);
        };
        wrappedExpect.argsOutput = args.map(function (arg, i) {
            var argRule = wrappedExpect.assertionRule.args[i];
            if (typeof arg === 'string' && (argRule && argRule.type.is('assertion') || wrappedExpect._getAssertionIndices().indexOf(i) >= 0)) {
                return new AssertionString(arg);
            }

            return function (output) {
                output.appendInspected(arg);
            };
        });

        // Eager-compute these properties in browsers that don't support getters
        // (Object.defineProperty might be polyfilled by es5-sham):
        if (!Object.__defineGetter__) {
            wrappedExpect.subjectType = wrappedExpect._getSubjectType();
            wrappedExpect.argTypes = wrappedExpect._getArgTypes();
        }

        return oathbreaker(assertionRule.handler.call(wrappedExpect, wrappedExpect, subject, ...args));
    }

    try {
        var result = executeExpect(context, subject, testDescriptionString, Array.prototype.slice.call(args, 2));
        if (isPendingPromise(result)) {
            that.expect.notifyPendingPromise(result);
            result = result.then(undefined, function (e) {
                if (e && e._isUnexpected && context.level === 0) {
                    that.setErrorMessage(e);
                }
                throw e;
            });
        } else {
            if (!result || typeof result.then !== 'function') {
                result = makePromise.resolve(result);
            }
        }
        return addAdditionalPromiseMethods(result, that.expect, subject);
    } catch (e) {
        if (e && e._isUnexpected) {
            var newError = e;
            if (typeof mochaPhantomJS !== 'undefined') {
                newError = e.clone();
            }
            if (context.level === 0) {
                that.setErrorMessage(newError);
            }
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

    return makeDiffResultBackwardsCompatible(this.findCommonType(a, b).diff(a, b, output, function (actual, expected) {
        return that.diff(actual, expected, output.clone(), recursions - 1, seen);
    }, function (v, depth) {
        return output.clone().appendInspected(v, depth);
    }, function (actual, expected) {
        return that.equal(actual, expected);
    }));
};

Unexpected.prototype.toString = function () {
    var assertions = this.assertions;

    var seen = {};
    var declarations = [];
    var pen = magicpen();
    Object.keys(assertions).sort().forEach(function (key) {
        assertions[key].forEach(function (assertion) {
            if (!seen[assertion.declaration]) {
                declarations.push(assertion.declaration);
                seen[assertion.declaration] = true;
            }
        });
    });

    declarations.forEach(function (declaration) {
        pen.text(declaration).nl();
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
    // Install the hooks:
    unexpected._expect = this._expect;
    return makeExpectFunction(unexpected);
};

Unexpected.prototype.child = function () {
    var childUnexpected = new Unexpected({
        assertions: {},
        types: [],
        typeByName: {},
        output: this.output.clone(),
        format: this.outputFormat(),
        installedPlugins: []
    });
    var parent = childUnexpected.parent = this;
    var childExpect = makeExpectFunction(childUnexpected);

    childExpect.exportAssertion = function (testDescription, handler) {
        parent.addAssertion(testDescription, handler, childUnexpected);
        return this;
    };
    childExpect.exportType = function (type) {
        parent.addType(type, childUnexpected);
        return this;
    };
    childExpect.exportStyle = function (name, handler) {
        parent.addStyle(name, function (...args) {
            var childOutput = childExpect.createOutput(this.format);
            this.append(handler.call(childOutput, ...args) || childOutput);
        });
        return this;
    };
    return childExpect;
};

Unexpected.prototype.outputFormat = function (format) {
    if (typeof format === 'undefined') {
        return this._outputFormat;
    } else {
        this._outputFormat = format;
        return this.expect;
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

module.exports = Unexpected;
