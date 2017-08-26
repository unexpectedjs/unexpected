var createStandardErrorMessage = require('./createStandardErrorMessage');
var makePromise = require('./makePromise');
var isPendingPromise = require('./isPendingPromise');
var oathbreaker = require('./oathbreaker');
var UnexpectedError = require('./UnexpectedError');
var addAdditionalPromiseMethods = require('./addAdditionalPromiseMethods');
var utils = require('./utils');

function isAssertionArg(arg) {
    return arg.type.is('assertion');
}

function lookupAssertionsInParentChain(assertionString, unexpected) {
    var assertions = [];
    for (var instance = unexpected ; instance ; instance = instance.parent) {
        if (instance.assertions[assertionString]) {
            assertions.push(...instance.assertions[assertionString]);
        }
    }
    return assertions;
}

function findSuffixAssertions(assertionString, unexpected) {
    if (typeof assertionString !== 'string') {
        return null;
    }
    var straightforwardAssertions = lookupAssertionsInParentChain(assertionString, unexpected);
    if (straightforwardAssertions.length > 0) {
        return straightforwardAssertions;
    }
    var tokens = assertionString.split(' ');
    for (var n = tokens.length - 1 ; n > 0 ; n -= 1) {
        var suffix = tokens.slice(n).join(' ');
        var suffixAssertions = lookupAssertionsInParentChain(suffix, unexpected);
        if (findSuffixAssertions(tokens.slice(0, n).join(' '), unexpected) && suffixAssertions.length > 0) {
            return suffixAssertions;
        }
    }
    return null;
}

module.exports = function createWrappedExpectProto(unexpected) {
    var wrappedExpectProto = {
        promise: makePromise,
        errorMode: 'default',

        equal: unexpected.equal,
        inspect: unexpected.inspect,
        createOutput: unexpected.createOutput.bind(unexpected),
        findTypeOf: unexpected.findTypeOf.bind(unexpected),
        findTypeOfWithParentType: unexpected.findTypeOfWithParentType.bind(unexpected),
        findCommonType: unexpected.findCommonType.bind(unexpected),
        it: function (...args) {
            if (typeof args[0] === 'string') {
                args[0] = utils.forwardFlags(args[0], this.flags);
            }
            return unexpected.it.call(unexpected, ...args);
        },
        diff: unexpected.diff,
        getType: unexpected.getType,
        output: unexpected.output,
        outputFormat: unexpected.outputFormat.bind(unexpected),
        format: unexpected.format,
        withError: unexpected.withError,

        fail: function (...args) {
            var expect = this.context.expect;
            this.callInNestedContext(function () {
                expect.fail.call(expect, ...args);
            });
        },
        standardErrorMessage: function (output, options) {
            var that = this;
            options = typeof options === 'object' ? options : {};

            if ('omitSubject' in output) {
                options.subject = this.subject;
            }

            if (options && options.compact) {
                options.compactSubject = function (output) {
                    output.jsFunctionName(that.subjectType.name);
                };
            }
            return createStandardErrorMessage(output, that.subjectOutput, that.testDescription, that.argsOutput, options);
        },
        callInNestedContext: function (callback) {
            var that = this;

            try {
                var result = oathbreaker(callback());
                if (isPendingPromise(result)) {
                    result = result.then(undefined, function (e) {
                        if (e && e._isUnexpected) {
                            var wrappedError = new UnexpectedError(that, e);
                            wrappedError.originalError = e.originalError;
                            throw wrappedError;
                        }
                        throw e;
                    });
                } else if (!result || typeof result.then !== 'function') {
                    result = makePromise.resolve(result);
                }
                return addAdditionalPromiseMethods(result, that.execute, that.subject);
            } catch (e) {
                if (e && e._isUnexpected) {
                    var wrappedError = new UnexpectedError(that, e);
                    wrappedError.originalError = e.originalError;
                    throw wrappedError;
                }
                throw e;
            }
        },
        shift: function (subject, assertionIndex) {
            if (arguments.length <= 1) {
                if (arguments.length === 0) {
                    subject = this.subject;
                }
                assertionIndex = -1;
                for (var i = 0 ; i < this.assertionRule.args.length ; i += 1) {
                    var type = this.assertionRule.args[i].type;
                    if (type.is('assertion') || type.is('expect.it')) {
                        assertionIndex = i;
                        break;
                    }
                }
            } else if (arguments.length === 3) {
                // The 3-argument syntax for wrappedExpect.shift is deprecated, please omit the first (expect) arg
                subject = arguments[1];
                assertionIndex = arguments[2];
            }

            if (assertionIndex !== -1) {
                var args = this.args.slice(0, assertionIndex);
                var rest = this.args.slice(assertionIndex);
                var nextArgumentType = this.findTypeOf(rest[0]);
                if (arguments.length > 1) {
                    // Legacy
                    this.argsOutput = function (output) {
                        args.forEach(function (arg, index) {
                            if (0 < index) {
                                output.text(', ');
                            }
                            output.appendInspected(arg);
                        });

                        if (args.length > 0) {
                            output.sp();
                        }
                        if (nextArgumentType.is('string')) {
                            output.error(rest[0]);
                        } else if (rest.length > 0) {
                            output.appendInspected(rest[0]);
                        }
                        if (rest.length > 1) {
                            output.sp();
                        }
                        rest.slice(1).forEach(function (arg, index) {
                            if (0 < index)  {
                                output.text(', ');
                            }
                            output.appendInspected(arg);
                        });
                    };
                }
                if (nextArgumentType.is('expect.it')) {
                    var that = this;
                    return this.withError(function () {
                        return rest[0](subject);
                    }, function (err) {
                        that.fail(err);
                    });
                } else if (nextArgumentType.is('string')) {
                    return this.execute(subject, ...rest);
                } else {
                    return subject;
                }
            } else {
                // No assertion to delegate to. Provide the new subject as the fulfillment value:
                return subject;
            }
        },
        _getSubjectType: function () {
            return this.findTypeOfWithParentType(this.subject, this.assertionRule.subject.type);
        },
        _getArgTypes: function (index) {
            var lastIndex = this.assertionRule.args.length - 1;
            return this.args.map(function (arg, index) {
                return this.findTypeOfWithParentType(arg, this.assertionRule.args[Math.min(index, lastIndex)].type);
            }, this);
        },
        _getAssertionIndices: function () {
            if (!this._assertionIndices) {
                var assertionIndices = [];
                var args = this.args;
                var currentAssertionRule = this.assertionRule;
                var offset = 0;
                OUTER: while (true) {
                    if (currentAssertionRule.args.length > 1 && isAssertionArg(currentAssertionRule.args[currentAssertionRule.args.length - 2])) {
                        assertionIndices.push(offset + currentAssertionRule.args.length - 2);
                        var suffixAssertions = findSuffixAssertions(args[offset + currentAssertionRule.args.length - 2], unexpected);
                        if (suffixAssertions) {
                            for (var i = 0 ; i < suffixAssertions.length ; i += 1) {
                                if (suffixAssertions[i].args.some(isAssertionArg)) {
                                    offset += currentAssertionRule.args.length - 1;
                                    currentAssertionRule = suffixAssertions[i];
                                    continue OUTER;
                                }
                            }
                        }
                    }
                    // No further assertions found,
                    break;
                }
                this._assertionIndices = assertionIndices;
            }
            return this._assertionIndices;
        }
    };

    if (Object.__defineGetter__) {
        Object.defineProperty(wrappedExpectProto, 'subjectType', {
            enumerable: true,
            get: function () {
                return this.assertionRule && this._getSubjectType();
            }
        });

        Object.defineProperty(wrappedExpectProto, 'argTypes', {
            enumerable: true,
            get: function () {
                return this.assertionRule && this._getArgTypes();
            }
        });
    }


    utils.setPrototypeOfOrExtend(wrappedExpectProto, Function.prototype);
    return wrappedExpectProto;
};
