var createStandardErrorMessage = require('./createStandardErrorMessage');
var throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');
var makePromise = require('./makePromise');
var isPendingPromise = require('./isPendingPromise');
var oathbreaker = require('./oathbreaker');
var UnexpectedError = require('./UnexpectedError');
var testFrameworkPatch = require('./testFrameworkPatch');
var makeAndMethod = require('./makeAndMethod');
var utils = require('./utils');

var wrappedExpectProto = {
    promise: makePromise,

    fail: function () {
        var args = arguments;
        var expect = this.executionContext.expect;
        this.callInNestedContext(this.executionContext, function () {
            expect.fail.apply(expect, args);
        });
    },
    withError: function (body, handler) {
        return oathbreaker(makePromise(body).caught(function (e) {
            throwIfNonUnexpectedError(e);
            return handler(e);
        }));
    },
    standardErrorMessage: function (output, options) {
        var that = this;
        options = typeof options === 'object' ? options : {};

        if ('omitSubject' in output) {
            options.subject = this.subject;
        }

        if (options && options.compact) {
            options.compactSubject = function (output) {
                var subjectType = that.findTypeOf(that.subject);
                output.jsFunctionName(subjectType.name);
            };
        }

        return createStandardErrorMessage(output, that.subjectOutput, that.testDescription, that.argsOutput, options);
    },
    callInNestedContext: function (executionContext, callback) {
        var that = this;
        var expect = executionContext.expect;
        try {
            var result = oathbreaker(callback());
            if (isPendingPromise(result)) {
                testFrameworkPatch.promiseCreated();
                result = result.then(undefined, function (e) {
                    if (e && e._isUnexpected) {
                        throw new UnexpectedError(that, e);
                    }
                    throw e;
                });
            } else if (!result || typeof result.then !== 'function') {
                result = makePromise.resolve(result);
            }
            result.and = makeAndMethod(that.execute, that.subject);
            return result;
        } catch (e) {
            if (e && e._isUnexpected) {
                var wrappedError = new UnexpectedError(that, e);
                if (this.executionContext.serializeErrorsFromWrappedExpect) {
                    expect.setErrorMessage(wrappedError);
                }
                throw wrappedError;
            }
            throw e;
        }
    },
    shift: function (subject, assertionIndex) {
        if (arguments.length === 3) {
            // The 3-argument syntax for wrappedExpect.shift is deprecated, please omit the first (expect) arg
            subject = arguments[1];
            assertionIndex = arguments[2];
        }

        var args = this.args.slice(0, assertionIndex);
        var rest = this.args.slice(assertionIndex);
        var nextArgumentType = this.findTypeOf(rest[0]);
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
            } else {
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
        if (nextArgumentType.is('expect.it')) {
            return rest[0](subject);
        } else if (nextArgumentType.is('string')) {
            return this.execute.apply(this.execute, [subject].concat(rest));
        } else {
            throw new Error('The "' + this.testDescription + '" assertion requires parameter #' + (assertionIndex + 2) +
                            ' to be an expect.it function or a string specifying an assertion to delegate to');
        }
    }
};

utils.setPrototypeOfOrExtend(wrappedExpectProto, Function.prototype);

module.exports = wrappedExpectProto;
