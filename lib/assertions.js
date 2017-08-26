/*global setTimeout*/
var utils = require('./utils');
var arrayChanges = require('array-changes');
var arrayChangesAsync = require('array-changes-async');
var throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');
var objectIs = utils.objectIs;
var isRegExp = utils.isRegExp;
var extend = utils.extend;

module.exports = function (expect) {
    expect.addAssertion('<any> [not] to be (ok|truthy)', function (expect, subject) {
        var not = !!expect.flags.not;
        var condition = !!subject;
        if (condition === not) {
            expect.fail();
        }
    });

    expect.addAssertion('<any> [not] to be (ok|truthy) <string>', function (expect, subject, message) {
        var not = !!expect.flags.not;
        var condition = !!subject;
        if (condition === not) {
            expect.fail({
                errorMode: 'bubble',
                message: message
            });
        }
    });

    expect.addAssertion('<any> [not] to be <any>', function (expect, subject, value) {
        expect(objectIs(subject, value), '[not] to be truthy');
    });

    expect.addAssertion('<string> [not] to be <string>', function (expect, subject, value) {
        expect(subject, '[not] to equal', value);
    });

    expect.addAssertion('<boolean> [not] to be true', function (expect, subject) {
        expect(subject, '[not] to be', true);
    });

    expect.addAssertion('<boolean> [not] to be false', function (expect, subject) {
        expect(subject, '[not] to be', false);
    });

    expect.addAssertion('<any> [not] to be falsy', function (expect, subject) {
        expect(subject, '[!not] to be truthy');
    });

    expect.addAssertion('<any> [not] to be falsy <string>', function (expect, subject, message) {
        var not = !!expect.flags.not;
        var condition = !!subject;
        if (condition !== not) {
            expect.fail({
                errorMode: 'bubble',
                message: message
            });
        }
    });

    expect.addAssertion('<any> [not] to be null', function (expect, subject) {
        expect(subject, '[not] to be', null);
    });

    expect.addAssertion('<any> [not] to be undefined', function (expect, subject) {
        expect(typeof subject === 'undefined', '[not] to be truthy');
    });

    expect.addAssertion('<any> to be defined', function (expect, subject) {
        expect(subject, 'not to be undefined');
    });

    expect.addAssertion('<number|NaN> [not] to be NaN', function (expect, subject) {
        expect(isNaN(subject), '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be close to <number> <number?>', function (expect, subject, value, epsilon) {
        expect.errorMode = 'bubble';
        if (typeof epsilon !== 'number') {
            epsilon = 1e-9;
        }

        expect.withError(function () {
            expect(Math.abs(subject - value), '[not] to be less than or equal to', epsilon);
        }, function (e) {
            expect.fail(function (output) {
                output.error('expected ')
                    .appendInspected(subject).sp()
                    .error(expect.testDescription).sp()
                    .appendInspected(value).sp()
                    .text('(epsilon: ')
                    .jsNumber(epsilon.toExponential())
                    .text(')');
            });
        });
    });

    expect.addAssertion('<any> [not] to be (a|an) <type>', function (expect, subject, type) {
        expect.argsOutput[0] = function (output) {
            output.text(type.name);
        };
        expect(type.identify(subject), '[not] to be true');
    });

    expect.addAssertion('<any> [not] to be (a|an) <string>', function (expect, subject, typeName) {
        typeName = /^reg(?:exp?|ular expression)$/.test(typeName) ? 'regexp' : typeName;
        expect.argsOutput[0] = function (output) {
            output.jsString(typeName);
        };
        if (!expect.getType(typeName)) {
            expect.errorMode = 'nested';
            expect.fail(function (output) {
                output.error('Unknown type:').sp().jsString(typeName);
            });
        }
        expect(expect.subjectType.is(typeName), '[not] to be truthy');
    });

    expect.addAssertion('<any> [not] to be (a|an) <function>', function (expect, subject, Constructor) {
        var className = utils.getFunctionName(Constructor);
        if (className) {
            expect.argsOutput[0] = function (output) {
                output.text(className);
            };
        }
        expect(subject instanceof Constructor, '[not] to be truthy');
    });

    expect.addAssertion('<any> [not] to be one of <array>', function (expect, subject, superset) {
        var found = false;

        for (var i = 0; i < superset.length; i += 1) {
            found = found || objectIs(subject, superset[i]);
        }

        if (found === expect.flags.not) { expect.fail(); }
    });

    // Alias for common '[not] to be (a|an)' assertions
    expect.addAssertion('<any> [not] to be an (object|array)', function (expect, subject) {
        expect(subject, '[not] to be an', expect.alternations[0]);
    });

    expect.addAssertion('<any> [not] to be a (boolean|number|string|function|regexp|regex|regular expression|date)', function (expect, subject) {
        expect(subject, '[not] to be a', expect.alternations[0]);
    });

    expect.addAssertion('<string> to be (the empty|an empty|a non-empty) string', function (expect, subject) {
        expect(subject, expect.alternations[0] === 'a non-empty' ? 'not to be empty' : 'to be empty');
    });

    expect.addAssertion('<array-like> to be (the empty|an empty|a non-empty) array', function (expect, subject) {
        expect(subject, expect.alternations[0] === 'a non-empty' ? 'not to be empty' : 'to be empty');
    });

    expect.addAssertion('<string> to match <regexp>', function (expect, subject, regexp) {
        return expect.withError(function () {
            var captures = subject.match(regexp);
            expect(captures, 'to be truthy');
            return captures;
        }, function (e) {
            e.label = 'should match';
            expect.fail(e);
        });
    });

    expect.addAssertion('<string> not to match <regexp>', function (expect, subject, regexp) {
        return expect.withError(function () {
            expect(regexp.test(subject), 'to be false');
        }, function (e) {
            expect.fail({
                label: 'should not match',
                diff: function (output) {
                    output.inline = false;
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
                        output.removedHighlight($0);
                    });
                    flushUntilIndex(subject.length);
                    return output;
                }
            });
        });
    });

    expect.addAssertion('<object|function> [not] to have own property <string>', function (expect, subject, key) {
        expect(subject.hasOwnProperty(key), '[not] to be truthy');
        return subject[key];
    });

    expect.addAssertion('<object|function> [not] to have (enumerable|configurable|writable) property <string>', function (expect, subject, key) {
        var descriptor = expect.alternations[0];
        expect(Object.getOwnPropertyDescriptor(subject, key)[descriptor], '[not] to be truthy');
        return subject[key];
    });

    expect.addAssertion('<object|function> [not] to have property <string>', function (expect, subject, key) {
        expect(subject[key], '[!not] to be undefined');
        return subject[key];
    });

    expect.addAssertion('<object|function> to have [own] property <string> <any>', function (expect, subject, key, expectedPropertyValue) {
        return expect(subject, 'to have [own] property', key).then(function (actualPropertyValue) {
            expect.argsOutput = function () {
                this.appendInspected(key).sp().error('with a value of').sp().appendInspected(expectedPropertyValue);
            };
            expect(actualPropertyValue, 'to equal', expectedPropertyValue);
            return actualPropertyValue;
        });
    });

    expect.addAssertion('<object|function> [not] to have [own] properties <array>', function (expect, subject, propertyNames) {
        var unsupportedPropertyNames = [];
        propertyNames.forEach(function (propertyName) {
            if (typeof propertyName !== 'string' && typeof propertyName !== 'number') {
                unsupportedPropertyNames.push(propertyName);
            }
        });
        if (unsupportedPropertyNames.length > 0) {
            expect.errorMode = 'nested';
            expect.fail(function () {
                this.error('All expected properties must be passed as strings or numbers, but these are not:')
                    .indentLines();
                unsupportedPropertyNames.forEach(function (propertyName) {
                    this.nl().i().appendInspected(propertyName);
                }, this);
                this.outdentLines();
            });
        }
        propertyNames.forEach(function (propertyName) {
            expect(subject, '[not] to have [own] property', String(propertyName));
        });
    });

    expect.addAssertion('<object|function> to have [own] properties <object>', function (expect, subject, properties) {
        expect.withError(function () {
            Object.keys(properties).forEach(function (property) {
                var value = properties[property];
                if (typeof value === 'undefined') {
                    expect(subject, 'not to have [own] property', property);
                } else {
                    expect(subject, 'to have [own] property', property, value);
                }
            });
        }, function (e) {
            expect.fail({
                diff: function (output, diff) {
                    output.inline = false;
                    var expected = extend({}, properties);
                    var actual = {};
                    var propertyNames = expect.findTypeOf(subject).getKeys(subject);
                    // Might put duplicates into propertyNames, but that does not matter:
                    for (var propertyName in subject) {
                        if (!subject.hasOwnProperty(propertyName)) {
                            propertyNames.push(propertyName);
                        }
                    }
                    propertyNames.forEach(function (propertyName) {
                        if ((!expect.flags.own || subject.hasOwnProperty(propertyName)) && !(propertyName in properties)) {
                            expected[propertyName] = subject[propertyName];
                        }
                        if ((!expect.flags.own || subject.hasOwnProperty(propertyName)) && !(propertyName in actual)) {
                            actual[propertyName] = subject[propertyName];
                        }
                    });
                    return utils.wrapConstructorNameAroundOutput(diff(actual, expected), subject);
                }
            });
        });
    });

    expect.addAssertion('<string|array-like> [not] to have length <number>', function (expect, subject, length) {
        if (!expect.flags.not) {
            expect.errorMode = 'nested';
        }
        expect(subject.length, '[not] to be', length);
    });

    expect.addAssertion('<string|array-like> [not] to be empty', function (expect, subject) {
        expect(subject, '[not] to have length', 0);
    });

    expect.addAssertion('<string|array-like|object> to be non-empty', function (expect, subject) {
        expect(subject, 'not to be empty');
    });

    expect.addAssertion('<object> to [not] [only] have keys <array>', function (expect, subject, keys) {
        var keysInSubject = {};
        var subjectKeys = expect.findTypeOf(subject).getKeys(subject);
        subjectKeys.forEach(function (key) {
            keysInSubject[key] = true;
        });

        if (expect.flags.not && keys.length === 0) {
            return;
        }

        var hasKeys = keys.every(function (key) {
            return keysInSubject[key];
        });

        if (expect.flags.only) {
            expect(hasKeys, 'to be truthy');
            expect.withError(function () {
                expect(subjectKeys.length === keys.length, '[not] to be truthy');
            }, function (err) {
                expect.fail({
                    diff: !expect.flags.not && function (output, diff, inspect, equal) {
                        output.inline = true;
                        var keyInValue = {};
                        keys.forEach(function (key) {
                            keyInValue[key] = true;
                        });
                        var subjectType = expect.findTypeOf(subject);
                        var subjectIsArrayLike = subjectType.is('array-like');

                        subjectType.prefix(output, subject);
                        output.nl().indentLines();

                        subjectKeys.forEach(function (key, index) {
                            output.i().block(function () {
                                this.property(key, inspect(subject[key]), subjectIsArrayLike);
                                subjectType.delimiter(this, index, subjectKeys.length);
                                if (!keyInValue[key]) {
                                    this.sp().annotationBlock(function () {
                                        this.error('should be removed');
                                    });
                                }
                            }).nl();
                        });

                        output.outdentLines();
                        subjectType.suffix(output, subject);

                        return output;
                    }
                });
            });
        } else {
            expect(hasKeys, '[not] to be truthy');
        }
    });

    expect.addAssertion('<object> [not] to be empty', function (expect, subject) {
        if (expect.flags.not && !expect.findTypeOf(subject).getKeys(subject).length) {
            return expect.fail();
        }
        expect(subject, 'to [not] only have keys', []);
    });

    expect.addAssertion('<object> not to have keys <array>', function (expect, subject, keys) {
        expect(subject, 'to not have keys', keys);
    });

    expect.addAssertion('<object> not to have key <string>', function (expect, subject, value) {
        expect(subject, 'to not have keys', [ value ]);
    });

    expect.addAssertion('<object> not to have keys <string+>', function (expect, subject, value) {
        expect(subject, 'to not have keys', Array.prototype.slice.call(arguments, 2));
    });

    expect.addAssertion('<object> to [not] [only] have key <string>', function (expect, subject, value) {
        expect(subject, 'to [not] [only] have keys', [ value ]);
    });

    expect.addAssertion('<object> to [not] [only] have keys <string+>', function (expect, subject) {
        expect(subject, 'to [not] [only] have keys', Array.prototype.slice.call(arguments, 2));
    });

    expect.addAssertion('<string> [not] to contain <string+>', function (expect, subject) {
        var args = Array.prototype.slice.call(arguments, 2);
        args.forEach(function (arg) {
            if (arg === '') {
                throw new Error("The '" + expect.testDescription + "' assertion does not support the empty string");
            }
        });
        expect.withError(function () {
            args.forEach(function (arg) {
                expect(subject.indexOf(arg) !== -1, '[not] to be truthy');
            });
        }, function (e) {
            expect.fail({
                diff: function (output) {
                    output.inline = false;
                    var lastIndex = 0;
                    function flushUntilIndex(i) {
                        if (i > lastIndex) {
                            output.text(subject.substring(lastIndex, i));
                            lastIndex = i;
                        }
                    }
                    if (expect.flags.not) {
                        subject.replace(new RegExp(args.map(function (arg) {
                            return utils.escapeRegExpMetaChars(arg);
                        }).join('|'), 'g'), function ($0, index) {
                            flushUntilIndex(index);
                            lastIndex += $0.length;
                            output.removedHighlight($0);
                        });
                        flushUntilIndex(subject.length);
                    } else {
                        var ranges = [];
                        args.forEach(function (arg) {
                            var needle = arg;
                            var partial = false;
                            while (needle.length > 1) {
                                var found = false;
                                lastIndex = -1;
                                var index;
                                do {
                                    index = subject.indexOf(needle, lastIndex + 1);
                                    if (index !== -1) {
                                        found = true;
                                        ranges.push({
                                            startIndex: index,
                                            endIndex: index + needle.length,
                                            partial: partial
                                        });
                                    }
                                    lastIndex = index;
                                } while (lastIndex !== -1);
                                if (found) {
                                    break;
                                }
                                needle = arg.substr(0, needle.length - 1);
                                partial = true;
                            }
                        });
                        lastIndex = 0;
                        ranges.sort(function (a, b) {
                            return a.startIndex - b.startIndex;
                        }).forEach(function (range) {
                            flushUntilIndex(range.startIndex);
                            var firstUncoveredIndex = Math.max(range.startIndex, lastIndex);
                            if (range.endIndex > firstUncoveredIndex) {
                                if (range.partial) {
                                    output.partialMatch(subject.substring(firstUncoveredIndex, range.endIndex));
                                } else {
                                    output.match(subject.substring(firstUncoveredIndex, range.endIndex));
                                }
                                lastIndex = range.endIndex;
                            }
                        });
                        flushUntilIndex(subject.length);
                    }
                    return output;
                }
            });
        });
    });

    expect.addAssertion('<array-like> [not] to contain <any+>', function (expect, subject) {
        var args = Array.prototype.slice.call(arguments, 2);
        expect.withError(function () {
            args.forEach(function (arg) {
                expect(subject && Array.prototype.some.call(subject, function (item) {
                    return expect.equal(item, arg);
                }), '[not] to be truthy');
            });
        }, function (e) {
            expect.fail({
                diff: expect.flags.not && function (output, diff, inspect, equal) {
                    return diff(subject, Array.prototype.filter.call(subject, function (item) {
                        return !args.some(function (arg) {
                            return equal(item, arg);
                        });
                    }));
                }
            });
        });
    });

    expect.addAssertion('<string> [not] to begin with <string>', function (expect, subject, value) {
        if (value === '') {
            throw new Error("The '" + expect.testDescription + "' assertion does not support a prefix of the empty string");
        }
        expect.withError(function () {
            expect(subject.substr(0, value.length), '[not] to equal', value);
        }, function (err) {
            expect.fail({
                diff: function (output) {
                    output.inline = false;
                    if (expect.flags.not) {
                        output.removedHighlight(value).text(subject.substr(value.length));
                    } else {
                        var i = 0;
                        while (subject[i] === value[i]) {
                            i += 1;
                        }
                        if (i === 0) {
                            // No common prefix, omit diff
                            return null;
                        } else {
                            output
                                .partialMatch(subject.substr(0, i))
                                .text(subject.substr(i));
                        }
                    }
                    return output;
                }
            });
        });
    });

    expect.addAssertion('<string> [not] to end with <string>', function (expect, subject, value) {
        if (value === '') {
            throw new Error("The '" + expect.testDescription + "' assertion does not support a suffix of the empty string");
        }
        expect.withError(function () {
            expect(subject.substr(-value.length), '[not] to equal', value);
        }, function (err) {
            expect.fail({
                diff: function (output) {
                    output.inline = false;
                    if (expect.flags.not) {
                        output.text(subject.substr(0, subject.length - value.length)).removedHighlight(value);
                    } else {
                        var i = 0;
                        while (subject[subject.length - 1 - i] === value[value.length - 1 - i]) {
                            i += 1;
                        }
                        if (i === 0) {
                            // No common suffix, omit diff
                            return null;
                        }
                        output
                            .text(subject.substr(0, subject.length - i))
                            .partialMatch(subject.substr(subject.length - i, subject.length));
                    }
                    return output;
                }
            });
        });
    });

    expect.addAssertion('<number> [not] to be finite', function (expect, subject) {
        expect(isFinite(subject), '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be infinite', function (expect, subject) {
        expect(!isNaN(subject) && !isFinite(subject), '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be within <number> <number>', function (expect, subject, start, finish) {
        expect.argsOutput = function (output) {
            output.appendInspected(start).text('..').appendInspected(finish);
        };
        expect(subject >= start && subject <= finish, '[not] to be truthy');
    });

    expect.addAssertion('<string> [not] to be within <string> <string>', function (expect, subject, start, finish) {
        expect.argsOutput = function (output) {
            output.appendInspected(start).text('..').appendInspected(finish);
        };
        expect(subject >= start && subject <= finish, '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be (less than|below) <number>', function (expect, subject, value) {
        expect(subject < value, '[not] to be truthy');
    });

    expect.addAssertion('<string> [not] to be (less than|below) <string>', function (expect, subject, value) {
        expect(subject < value, '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be less than or equal to <number>', function (expect, subject, value) {
        expect(subject <= value, '[not] to be truthy');
    });

    expect.addAssertion('<string> [not] to be less than or equal to <string>', function (expect, subject, value) {
        expect(subject <= value, '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be (greater than|above) <number>', function (expect, subject, value) {
        expect(subject > value, '[not] to be truthy');
    });

    expect.addAssertion('<string> [not] to be (greater than|above) <string>', function (expect, subject, value) {
        expect(subject > value, '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be greater than or equal to <number>', function (expect, subject, value) {
        expect(subject >= value, '[not] to be truthy');
    });

    expect.addAssertion('<string> [not] to be greater than or equal to <string>', function (expect, subject, value) {
        expect(subject >= value, '[not] to be truthy');
    });

    expect.addAssertion('<number> [not] to be positive', function (expect, subject) {
        expect(subject, '[not] to be greater than', 0);
    });

    expect.addAssertion('<number> [not] to be negative', function (expect, subject) {
        expect(subject, '[not] to be less than', 0);
    });

    expect.addAssertion('<any> to equal <any>', function (expect, subject, value) {
        expect.withError(function () {
            expect(expect.equal(value, subject), 'to be truthy');
        }, function (e) {
            expect.fail({
                label: 'should equal',
                diff: function (output, diff) {
                    return diff(subject, value);
                }
            });
        });
    });

    expect.addAssertion('<any> not to equal <any>', function (expect, subject, value) {
        expect(expect.equal(value, subject), 'to be falsy');
    });

    expect.addAssertion('<function> to error', function (expect, subject) {
        return expect.promise(function () {
            return subject();
        }).then(function () {
            expect.fail();
        }, function (error) {
            return error;
        });
    });

    expect.addAssertion('<function> to error [with] <any>', function (expect, subject, arg) {
        return expect(subject, 'to error').then(function (error) {
            expect.errorMode = 'nested';
            return expect.withError(function () {
                if (error.isUnexpected && (typeof arg === 'string' || isRegExp(arg))) {
                    return expect(error, 'to have message', arg);
                } else {
                    return expect(error, 'to satisfy', arg);
                }
            }, function (e) {
                e.originalError = error;
                throw e;
            });
        });
    });

    expect.addAssertion('<function> not to error', function (expect, subject) {
        var threw = false;
        return expect.promise(function () {
            try {
                return subject();
            } catch (e) {
                threw = true;
                throw e;
            }
        }).caught(function (error) {
            expect.errorMode = 'nested';
            expect.fail({
                output: function (output) {
                    output.error(threw ? 'threw' : 'returned promise rejected with').error(': ')
                        .appendErrorMessage(error);
                },
                originalError: error
            });
        });
    });

    expect.addAssertion('<function> not to throw', function (expect, subject) {
        var threw = false;
        var error;

        try {
            subject();
        } catch (e) {
            error = e;
            threw = true;
        }

        if (threw) {
            expect.errorMode = 'nested';
            expect.fail({
                output: function (output) {
                    output.error('threw: ').appendErrorMessage(error);
                },
                originalError: error
            });
        }
    });

    expect.addAssertion('<function> to (throw|throw error|throw exception)', function (expect, subject) {
        try {
            subject();
        } catch (e) {
            return e;
        }
        expect.errorMode = 'nested';
        expect.fail('did not throw');
    });

    expect.addAssertion('<function> to throw (a|an) <function>', function (expect, subject, value) {
        var constructorName = utils.getFunctionName(value);
        if (constructorName) {
            expect.argsOutput[0] = function (output) {
                output.jsFunctionName(constructorName);
            };
        }
        expect.errorMode = 'nested';
        return expect(subject, 'to throw').then(function (error) {
            expect(error, 'to be a', value);
        });
    });

    expect.addAssertion('<function> to (throw|throw error|throw exception) <any>', function (expect, subject, arg) {
        expect.errorMode = 'nested';
        return expect(subject, 'to throw').then(function (error) {
            var isUnexpected = error && error._isUnexpected;
            // in the presence of a matcher an error must have been thrown.

            expect.errorMode = 'nested';
            return expect.withError(function () {
                if (isUnexpected && (typeof arg === 'string' || isRegExp(arg))) {
                    return expect(error.getErrorMessage('text').toString(), 'to satisfy', arg);
                } else {
                    return expect(error, 'to satisfy', arg);
                }
            }, function (err) {
                err.originalError = error;
                throw err;
            });
        });
    });

    expect.addAssertion('<function> to have arity <number>', function (expect, subject, value) {
        expect(subject.length, 'to equal', value);
    });

    expect.addAssertion([
        '<object> to have values [exhaustively] satisfying <any>',
        '<object> to have values [exhaustively] satisfying <assertion>',
        '<object> to be (a map|a hash|an object) whose values [exhaustively] satisfy <any>',
        '<object> to be (a map|a hash|an object) whose values [exhaustively] satisfy <assertion>'
    ], function (expect, subject, nextArg) {
        expect.errorMode = 'nested';
        expect(subject, 'not to be empty');
        expect.errorMode = 'bubble';

        var keys = expect.subjectType.getKeys(subject);
        var expected = {};
        keys.forEach(function (key, index) {
            if (typeof nextArg === 'string') {
                expected[key] = function (s) {
                    return expect.shift(s);
                };
            } else if (typeof nextArg === 'function') {
                expected[key] = function (s) {
                    return nextArg._expectIt
                      ? nextArg(s, expect.context)
                      : nextArg(s, index);
                };
            } else {
                expected[key] = nextArg;
            }
        });
        return expect.withError(function () {
            return expect(subject, 'to [exhaustively] satisfy', expected);
        }, function (err) {
            expect.fail({
                message: function (output) {
                    output.append(expect.standardErrorMessage(output.clone(), { compact: true }));
                },
                diff: function (output) {
                    var diff = err.getDiff({ output: output });
                    diff.inline = true;
                    return diff;
                }
            });
        });
    });

    expect.addAssertion([
        '<array-like> to have items [exhaustively] satisfying <any>',
        '<array-like> to have items [exhaustively] satisfying <assertion>',
        '<array-like> to be an array whose items [exhaustively] satisfy <any>',
        '<array-like> to be an array whose items [exhaustively] satisfy <assertion>'
    ], function (expect, subject, ...rest) { // ...
        expect.errorMode = 'nested';
        expect(subject, 'not to be empty');
        expect.errorMode = 'bubble';

        return expect.withError(function () {
            return expect(subject, 'to have values [exhaustively] satisfying', ...rest);
        }, function (err) {
            expect.fail({
                message: function (output) {
                    output.append(expect.standardErrorMessage(output.clone(), { compact: true }));
                },
                diff: function (output) {
                    var diff = err.getDiff({ output: output });
                    diff.inline = true;
                    return diff;
                }
            });
        });
    });

    expect.addAssertion([
        '<object> to have keys satisfying <any>',
        '<object> to have keys satisfying <assertion>',
        '<object> to be (a map|a hash|an object) whose (keys|properties) satisfy <any>',
        '<object> to be (a map|a hash|an object) whose (keys|properties) satisfy <assertion>'
    ], function (expect, subject, ...rest) {
        expect.errorMode = 'nested';
        expect(subject, 'not to be empty');
        expect.errorMode = 'default';

        var keys = expect.subjectType.getKeys(subject);
        return expect(keys, 'to have items satisfying', ...rest);
    });

    expect.addAssertion([
        '<object> to have a value [exhaustively] satisfying <any>',
        '<object> to have a value [exhaustively] satisfying <assertion>'
    ], function (expect, subject, nextArg) {
        expect.errorMode = 'nested';
        expect(subject, 'not to be empty');
        expect.errorMode = 'bubble';

        var keys = expect.subjectType.getKeys(subject);
        return expect.promise.any(keys.map(function (key, index) {
            var expected;
            if (typeof nextArg === 'string') {
                expected = function (s) {
                    return expect.shift(s);
                };
            } else if (typeof nextArg === 'function') {
                expected = function (s) {
                    return nextArg(s, index);
                };
            } else {
                expected = nextArg;
            }
            return expect.promise(function () {
                return expect(subject[key], 'to [exhaustively] satisfy', expected);
            });
        })).catch(function (e) {
            return expect.fail(function (output) {
                output.append(expect.standardErrorMessage(output.clone(), { compact: true }));
            });
        });
    });

    expect.addAssertion([
        '<array-like> to have an item [exhaustively] satisfying <any>',
        '<array-like> to have an item [exhaustively] satisfying <assertion>'
    ], function (expect, subject, ...rest) {
        expect.errorMode = 'nested';
        expect(subject, 'not to be empty');
        expect.errorMode = 'bubble';

        return expect.withError(function () {
            return expect(subject, 'to have a value [exhaustively] satisfying', ...rest);
        }, function (err) {
            expect.fail(function (output) {
                output.append(expect.standardErrorMessage(output.clone(), { compact: true }));
            });
        });
    });

    expect.addAssertion('<object> to be canonical', function (expect, subject) {
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

    expect.addAssertion('<Error> to have message <any>', function (expect, subject, value) {
        expect.errorMode = 'nested';
        return expect(subject.isUnexpected ? subject.getErrorMessage('text').toString() : subject.message, 'to satisfy', value);
    });

    expect.addAssertion('<Error> to [exhaustively] satisfy <Error>', function (expect, subject, value) {
        expect(subject.constructor, 'to be', value.constructor);

        var unwrappedValue = expect.argTypes[0].unwrap(value);
        return expect.withError(function () {
            return expect(subject, 'to [exhaustively] satisfy', unwrappedValue);
        }, function (e) {
            expect.fail({
                diff: function (output, diff) {
                    output.inline = false;
                    var unwrappedSubject = expect.subjectType.unwrap(subject);
                    return utils.wrapConstructorNameAroundOutput(
                        diff(unwrappedSubject, unwrappedValue),
                        subject
                    );
                }
            });
        });
    });

    expect.addAssertion('<Error> to [exhaustively] satisfy <object>', function (expect, subject, value) {
        var valueType = expect.argTypes[0];
        var subjectKeys = expect.subjectType.getKeys(subject);
        var valueKeys = valueType.getKeys(value);
        var convertedSubject = {};
        subjectKeys.concat(valueKeys).forEach(function (key) {
            convertedSubject[key] = subject[key];
        });
        return expect(convertedSubject, 'to [exhaustively] satisfy', value);
    });

    expect.addAssertion('<Error> to [exhaustively] satisfy <regexp|string>', function (expect, subject, value) {
        return expect(subject.message, 'to [exhaustively] satisfy', value);
    });

    expect.addAssertion('<Error> to [exhaustively] satisfy <any>', function (expect, subject, value) {
        return expect(subject.message, 'to [exhaustively] satisfy', value);
    });

    expect.addAssertion('<binaryArray> to [exhaustively] satisfy <expect.it>', function (expect, subject, value) {
        return expect.withError(function () {
            return value(subject, expect.context);
        }, function (e) {
            expect.fail({
                diff: function (output, diff, inspect, equal) {
                    output.inline = false;
                    return output.appendErrorMessage(e);
                }
            });
        });
    });

    expect.addAssertion('<UnexpectedError> to [exhaustively] satisfy <function>', function (expect, subject, value) {
        return expect.promise(function () {
            subject.serializeMessage(expect.outputFormat());
            return value(subject);
        });
    });

    expect.addAssertion('<any|Error> to [exhaustively] satisfy <function>', function (expect, subject, value) {
        return expect.promise(function () {
            return value(subject);
        });
    });

    if (typeof Buffer !== 'undefined') {
        expect.addAssertion('<Buffer> [when] decoded as <string> <assertion?>', function (expect, subject, value) {
            return expect.shift(subject.toString(value));
        });
    }

    expect.addAssertion('<any> not to [exhaustively] satisfy [assertion] <any>', function (expect, subject, value) {
        return expect.promise(function (resolve, reject) {
            return expect.promise(function () {
                return expect(subject, 'to [exhaustively] satisfy [assertion]', value);
            }).then(function () {
                try {
                    expect.fail();
                } catch (e) {
                    reject(e);
                }
            }).caught(function (e) {
                if (!e || !e._isUnexpected) {
                    reject(e);
                } else {
                    resolve();
                }
            });
        });
    });

    expect.addAssertion('<any> to [exhaustively] satisfy assertion <any>', function (expect, subject, value) {
        expect.errorMode = 'bubble'; // to satisfy assertion 'to be a number' => to be a number
        return expect(subject, 'to [exhaustively] satisfy', value);
    });

    expect.addAssertion('<any> to [exhaustively] satisfy assertion <assertion>', function (expect, subject) {
        expect.errorMode = 'bubble'; // to satisfy assertion 'to be a number' => to be a number
        return expect.shift();
    });

    expect.addAssertion('<any> to [exhaustively] satisfy [assertion] <expect.it>', function (expect, subject, value) {
        return expect.withError(function () {
            return value(subject, expect.context);
        }, function (e) {
            expect.fail({
                diff: function (output) {
                    output.inline = false;
                    return output.appendErrorMessage(e);
                }
            });
        });
    });

    expect.addAssertion('<regexp> to [exhaustively] satisfy <regexp>', function (expect, subject, value) {
        expect(subject, 'to equal', value);
    });

    expect.addAssertion('<string> to [exhaustively] satisfy <regexp>', function (expect, subject, value) {
        expect.errorMode = 'bubble';
        return expect(subject, 'to match', value);
    });

    expect.addAssertion('<function> to [exhaustively] satisfy <function>', function (expect, subject, value) {
        expect.errorMode = 'bubble';
        expect(subject, 'to equal', value);
    });

    expect.addAssertion('<binaryArray> to [exhaustively] satisfy <binaryArray>', function (expect, subject, value) {
        expect.errorMode = 'bubble';
        expect(subject, 'to equal', value);
    });

    expect.addAssertion('<any> to [exhaustively] satisfy <any>', function (expect, subject, value) {
        expect.errorMode = 'bubble';
        expect(subject, 'to equal', value);
    });

    expect.addAssertion('<array-like> to [exhaustively] satisfy <array-like>', function (expect, subject, value) {
        expect.errorMode = 'bubble';
        var i;
        var valueType = expect.argTypes[0];
        var valueKeys = valueType.getKeys(value);
        var keyPromises = {};
        valueKeys.forEach(function (valueKey) {
            keyPromises[valueKey] = expect.promise(function () {
                var valueKeyType = expect.findTypeOf(value[valueKey]);
                if (valueKeyType.is('function')) {
                    return value[valueKey](subject[valueKey]);
                } else {
                    return expect(subject[valueKey], 'to [exhaustively] satisfy', value[valueKey]);
                }
            });
        });
        return expect.promise.all([
            expect.promise(function () {
                expect(subject, 'to only have keys', valueKeys);
            }),
            expect.promise.all(keyPromises)
        ]).caught(function () {
            var subjectType = expect.subjectType;
            return expect.promise.settle(keyPromises).then(function () {
                var toSatisfyMatrix = new Array(subject.length);
                for (i = 0 ; i < subject.length ; i += 1) {
                    toSatisfyMatrix[i] = new Array(value.length);
                    if (i < value.length) {
                        toSatisfyMatrix[i][i] = keyPromises[i].isFulfilled() || keyPromises[i].reason();
                    }
                }
                if (subject.length > 10 || value.length > 10) {
                    var indexByIndexChanges = [];
                    for (i = 0 ; i < subject.length ; i += 1) {
                        var promise = keyPromises[i];
                        if (i < value.length) {
                            indexByIndexChanges.push({
                                type: promise.isFulfilled() ? 'equal' : 'similar',
                                value: subject[i],
                                expected: value[i],
                                actualIndex: i,
                                expectedIndex: i,
                                last: i === Math.max(subject.length, value.length) - 1
                            });
                        } else {
                            indexByIndexChanges.push({
                                type: 'remove',
                                value: subject[i],
                                actualIndex: i,
                                last: i === subject.length - 1
                            });
                        }
                    }
                    for (i = subject.length ; i < value.length ; i += 1) {
                        indexByIndexChanges.push({
                            type: 'insert',
                            value: value[i],
                            expectedIndex: i
                        });
                    }
                    return failWithChanges(indexByIndexChanges);
                }

                var isAsync = false;
                var nonNumericalKeysAndSymbols = !subjectType.numericalPropertiesOnly &&
                    utils.uniqueNonNumericalStringsAndSymbols(subjectType.getKeys(subject), valueType.getKeys(value));

                var changes = arrayChanges(subject, value, function equal(a, b, aIndex, bIndex) {
                    toSatisfyMatrix[aIndex] = toSatisfyMatrix[aIndex] || [];
                    var existingResult = toSatisfyMatrix[aIndex][bIndex];
                    if (typeof existingResult !== 'undefined') {
                        return existingResult === true;
                    }
                    var result;
                    try {
                        result = expect(a, 'to [exhaustively] satisfy', b);
                    } catch (err) {
                        throwIfNonUnexpectedError(err);
                        toSatisfyMatrix[aIndex][bIndex] = err;
                        return false;
                    }
                    result.then(function () {}, function () {});
                    if (result.isPending()) {
                        isAsync = true;
                        return false;
                    }
                    toSatisfyMatrix[aIndex][bIndex] = true;
                    return true;
                }, function (a, b) {
                    return subjectType.similar(a, b);
                }, nonNumericalKeysAndSymbols);
                if (isAsync) {
                    return expect.promise(function (resolve, reject) {
                        arrayChangesAsync(subject, value, function equal(a, b, aIndex, bIndex, cb) {
                            toSatisfyMatrix[aIndex] = toSatisfyMatrix[aIndex] || [];
                            var existingResult = toSatisfyMatrix[aIndex][bIndex];
                            if (typeof existingResult !== 'undefined') {
                                return cb(existingResult === true);
                            }
                            expect.promise(function () {
                                return expect(a, 'to [exhaustively] satisfy', b);
                            }).then(function () {
                                toSatisfyMatrix[aIndex][bIndex] = true;
                                cb(true);
                            }, function (err) {
                                toSatisfyMatrix[aIndex][bIndex] = err;
                                cb(false);
                            });
                        }, function (a, b, aIndex, bIndex, cb) {
                            cb(subjectType.similar(a, b));
                        }, nonNumericalKeysAndSymbols, resolve);
                    }).then(failWithChanges);
                } else {
                    return failWithChanges(changes);
                }

                function failWithChanges(changes) {
                    expect.errorMode = 'default';
                    expect.fail({
                        diff: function (output, diff, inspect, equal) {
                            output.inline = true;
                            var indexOfLastNonInsert = changes.reduce(function (previousValue, diffItem, index) {
                                return (diffItem.type === 'insert') ? previousValue : index;
                            }, -1);
                            var prefixOutput = subjectType.prefix(output.clone(), subject);
                            output
                                .append(prefixOutput)
                                .nl(prefixOutput.isEmpty() ? 0 : 1);

                            if (subjectType.indent) {
                                output.indentLines();
                            }
                            var packing = utils.packArrows(changes); // NOTE: Will have side effects in changes if the packing results in too many arrow lanes
                            output.arrowsAlongsideChangeOutputs(packing, changes.map(function (diffItem, index) {
                                var delimiterOutput = subjectType.delimiter(output.clone(), index, indexOfLastNonInsert + 1);
                                var type = diffItem.type;
                                if (type === 'moveTarget') {
                                    return output.clone();
                                } else {
                                    return output.clone().block(function () {
                                        if (type === 'moveSource') {
                                            this.property(diffItem.actualIndex, inspect(diffItem.value), true)
                                                .amend(delimiterOutput.sp()).error('// should be moved');
                                        } else if (type === 'insert') {
                                            this.annotationBlock(function () {
                                                var index = typeof diffItem.actualIndex !== 'undefined' ? diffItem.actualIndex : diffItem.expectedIndex;
                                                if (expect.findTypeOf(diffItem.value).is('function')) {
                                                    this.error('missing: ')
                                                        .property(index, output.clone().block(function () {
                                                            this.omitSubject = undefined;
                                                            var promise = keyPromises[diffItem.expectedIndex];
                                                            if (promise.isRejected()) {
                                                                this.appendErrorMessage(promise.reason());
                                                            } else {
                                                                this.appendInspected(diffItem.value);
                                                            }
                                                        }), true);
                                                } else {
                                                    this.error('missing ').property(index, inspect(diffItem.value), true);
                                                }
                                            });
                                        } else {
                                            this.property(diffItem.actualIndex, output.clone().block(function () {
                                                if (type === 'remove') {
                                                    this.append(inspect(diffItem.value).amend(delimiterOutput.sp()).error('// should be removed'));
                                                } else if (type === 'equal') {
                                                    this.append(inspect(diffItem.value).amend(delimiterOutput));
                                                } else {
                                                    var toSatisfyResult = toSatisfyMatrix[diffItem.actualIndex][diffItem.expectedIndex];
                                                    var valueDiff = toSatisfyResult && toSatisfyResult !== true && toSatisfyResult.getDiff({ output: output.clone() });
                                                    if (valueDiff && valueDiff.inline) {
                                                        this.append(valueDiff.amend(delimiterOutput));
                                                    } else {
                                                        this.append(inspect(diffItem.value).amend(delimiterOutput)).sp().annotationBlock(function () {
                                                            this.omitSubject = diffItem.value;
                                                            var label = toSatisfyResult.getLabel();
                                                            if (label) {
                                                                this.error(label).sp()
                                                                    .block(inspect(diffItem.expected));
                                                                if (valueDiff) {
                                                                    this.nl(2).append(valueDiff);
                                                                }
                                                            } else {
                                                                this.appendErrorMessage(toSatisfyResult);
                                                            }
                                                        });
                                                    }
                                                }
                                            }), true);
                                        }
                                    });
                                }
                            }));

                            if (subjectType.indent) {
                                output.outdentLines();
                            }
                            var suffixOutput = subjectType.suffix(output.clone(), subject);
                            output
                                .nl(suffixOutput.isEmpty() ? 0 : 1)
                                .append(suffixOutput);

                            return output;
                        }
                    });
                }
            });
        });
    });

    expect.addAssertion('<object> to [exhaustively] satisfy <object>', function (expect, subject, value) {
        var valueType = expect.argTypes[0];
        var subjectType = expect.subjectType;
        var subjectIsArrayLike = subjectType.is('array-like');
        if (subject === value) {
            return;
        }
        if (valueType.is('array-like') && !subjectIsArrayLike) {
            expect.fail();
        }
        var promiseByKey = {};
        var keys = valueType.getKeys(value);
        var subjectKeys = subjectType.getKeys(subject);

        if (!subjectIsArrayLike) {
            // Find all non-enumerable subject keys present in value, but not returned by subjectType.getKeys:
            keys.forEach(function (key) {
                if (Object.prototype.hasOwnProperty.call(subject, key) && subjectKeys.indexOf(key) === -1) {
                    subjectKeys.push(key);
                }
            });
        }

        keys.forEach(function (key, index) {
            promiseByKey[key] = expect.promise(function () {
                var valueKeyType = expect.findTypeOf(value[key]);
                if (valueKeyType.is('expect.it')) {
                    expect.context.thisObject = subject;
                    return value[key](subject[key], expect.context);
                } else if (valueKeyType.is('function')) {
                    return value[key](subject[key]);
                } else {
                    return expect(subject[key], 'to [exhaustively] satisfy', value[key]);
                }
            });
        });

        return expect.promise.all([
            expect.promise(function () {
                if (expect.flags.exhaustively) {
                    var nonOwnKeysWithDefinedValues = keys.filter(function (key) {
                        return !Object.prototype.hasOwnProperty.call(subject, key) && typeof subject[key] !== 'undefined';
                    });
                    var valueKeysWithDefinedValues = keys.filter(function (key) {
                        return typeof value[key] !== 'undefined';
                    });
                    var subjectKeysWithDefinedValues = subjectKeys.filter(function (key) {
                        return typeof subject[key] !== 'undefined';
                    });
                    expect(valueKeysWithDefinedValues.length - nonOwnKeysWithDefinedValues.length, 'to equal', subjectKeysWithDefinedValues.length);
                }
            }),
            expect.promise.all(promiseByKey)
        ]).caught(function () {
            return expect.promise.settle(promiseByKey).then(function () {
                expect.fail({
                    diff: function (output, diff, inspect, equal) {
                        output.inline = true;
                        var subjectIsArrayLike = subjectType.is('array-like');
                        var keys = utils.uniqueStringsAndSymbols(subjectKeys, valueType.getKeys(value)).filter(function (key) {
                            // Skip missing keys expected to be missing so they don't get rendered in the diff
                            return key in subject || typeof value[key] !== 'undefined';
                        });
                        var prefixOutput = subjectType.prefix(output.clone(), subject);
                        output
                            .append(prefixOutput)
                            .nl(prefixOutput.isEmpty() ? 0 : 1);

                        if (subjectType.indent) {
                            output.indentLines();
                        }
                        keys.forEach(function (key, index) {
                            output.nl(index > 0 ? 1 : 0).i().block(function () {
                                var valueOutput;
                                var annotation = output.clone();
                                var conflicting;

                                if (Object.prototype.hasOwnProperty.call(promiseByKey, key) && promiseByKey[key].isRejected()) {
                                    conflicting = promiseByKey[key].reason();
                                }

                                var missingArrayIndex = subjectType.is('array-like') && !(key in subject);

                                var isInlineDiff = true;

                                output.omitSubject = subject[key];
                                if (!(key in value)) {
                                    if (expect.flags.exhaustively) {
                                        annotation.error('should be removed');
                                    } else {
                                        conflicting = null;
                                    }
                                } else if (!(key in subject)) {
                                    if (expect.findTypeOf(value[key]).is('function')) {
                                        if (promiseByKey[key].isRejected()) {
                                            output.error('// missing:').sp();
                                            valueOutput = output.clone().appendErrorMessage(promiseByKey[key].reason());
                                        } else {
                                            output.error('// missing').sp();
                                            valueOutput = output.clone().error('should satisfy').sp().block(inspect(value[key]));
                                        }
                                    } else {
                                        output.error('// missing').sp();
                                        valueOutput = inspect(value[key]);
                                    }
                                } else if (conflicting || missingArrayIndex) {
                                    var keyDiff = conflicting && conflicting.getDiff({ output: output });
                                    isInlineDiff = !keyDiff || keyDiff.inline ;
                                    if (missingArrayIndex) {
                                        output.error('// missing').sp();
                                    }
                                    if (keyDiff && keyDiff.inline) {
                                        valueOutput = keyDiff;
                                    } else if (typeof value[key] === 'function') {
                                        isInlineDiff = false;
                                        annotation.appendErrorMessage(conflicting);
                                    } else if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                        annotation.error((conflicting && conflicting.getLabel()) || 'should satisfy').sp()
                                            .block(inspect(value[key]));

                                        if (keyDiff) {
                                            annotation.nl(2).append(keyDiff);
                                        }
                                    } else {
                                        valueOutput = keyDiff;
                                    }
                                }

                                if (!valueOutput) {
                                    if (missingArrayIndex || !(key in subject)) {
                                        valueOutput = output.clone();
                                    } else {
                                        valueOutput = inspect(subject[key]);
                                    }
                                }

                                var omitDelimiter =
                                    missingArrayIndex ||
                                    index >= subjectKeys.length - 1;

                                if (!omitDelimiter) {
                                    valueOutput.amend(subjectType.delimiter(output.clone(), index, keys.length));
                                }

                                var annotationOnNextLine = !isInlineDiff &&
                                    output.preferredWidth < this.size().width + valueOutput.size().width + annotation.size().width;

                                if (!annotation.isEmpty()) {
                                    if (!valueOutput.isEmpty()) {
                                        if (annotationOnNextLine) {
                                            valueOutput.nl();
                                        } else {
                                            valueOutput.sp();
                                        }
                                    }

                                    valueOutput.annotationBlock(function () {
                                        this.append(annotation);
                                    });
                                }

                                if (!isInlineDiff) {
                                    valueOutput = output.clone().block(valueOutput);
                                }

                                this.property(key, valueOutput, subjectIsArrayLike);
                            });
                        });

                        if (subjectType.indent) {
                            output.outdentLines();
                        }
                        var suffixOutput = subjectType.suffix(output.clone(), subject);
                        return output
                            .nl(suffixOutput.isEmpty() ? 0 : 1)
                            .append(suffixOutput);
                    }
                });
            });
        });
    });

    function wrapDiffWithTypePrefixAndSuffix(e, type, subject) {
        var createDiff = e.getDiffMethod();
        if (createDiff) {
            return function (output, ...rest) {
                type.prefix.call(type, output, subject);
                var result = createDiff.call(this, output, ...rest);
                type.suffix.call(type, output, subject);
                return result;
            };
        }
    }

    expect.addAssertion('<wrapperObject> to [exhaustively] satisfy <wrapperObject>', function (expect, subject, value) {
        var type = expect.findCommonType(subject, value);
        expect(type.is('wrapperObject'), 'to be truthy');
        return expect.withError(function () {
            return expect(type.unwrap(subject), 'to [exhaustively] satisfy', type.unwrap(value));
        }, function (e) {
            expect.fail({
                label: e.getLabel(),
                diff: wrapDiffWithTypePrefixAndSuffix(e, type, subject)
            });
        });
    });

    expect.addAssertion('<wrapperObject> to [exhaustively] satisfy <any>', function (expect, subject, value) {
        var subjectType = expect.subjectType;

        return expect.withError(function () {
            return expect(subjectType.unwrap(subject), 'to [exhaustively] satisfy', value);
        }, function (e) {
            expect.fail({
                label: e.getLabel(),
                diff: wrapDiffWithTypePrefixAndSuffix(e, subjectType, subject)
            });
        });
    });

    expect.addAssertion('<function> [when] called with <array-like> <assertion?>', function (expect, subject, args) { // ...
        expect.errorMode = 'nested';
        expect.argsOutput[0] = function (output) {
            output.appendItems(args, ', ');
        };

        var thisObject = expect.context.thisObject || null;

        return expect.shift(subject.apply(thisObject, args));
    });

    expect.addAssertion('<function> [when] called <assertion?>', function (expect, subject) {
        expect.errorMode = 'nested';

        var thisObject = expect.context.thisObject || null;

        return expect.shift(subject.call(thisObject));
    });

    function instantiate(Constructor, args) {
        function ProxyConstructor() {
            return Constructor.apply(this, args);
        }
        ProxyConstructor.prototype = Constructor.prototype;
        return new ProxyConstructor();
    }

    expect.addAssertion([
        '<array-like> [when] passed as parameters to [async] <function> <assertion?>',
        '<array-like> [when] passed as parameters to [constructor] <function> <assertion?>'
    ], function (expect, subject, fn) { // ...
        expect.errorMode = 'nested';
        var args = subject;
        if (expect.flags.async) {
            return expect.promise(function (run) {
                args = [
                    ...args,
                    run(function (err, result) {
                        expect(err, 'to be falsy');
                        return expect.shift(result);
                    })
                ];
                fn(...args);
            });
        } else {
            return expect.shift(expect.flags.constructor ? instantiate(fn, args) : fn(...args));
        }
    });

    expect.addAssertion([
        '<any> [when] passed as parameter to [async] <function> <assertion?>',
        '<any> [when] passed as parameter to [constructor] <function> <assertion?>'
    ], function (expect, subject, fn) { // ...
        expect.errorMode = 'nested';
        var args = [subject];
        if (expect.flags.async) {
            return expect.promise(function (run) {
                args = [
                    ...args,
                    run(function (err, result) {
                        expect(err, 'to be falsy');
                        return expect.shift(result);
                    })
                ];
                fn(...args);
            });
        } else {
            return expect.shift(expect.flags.constructor ? instantiate(fn, args) : fn(...args));
        }
    });

    expect.addAssertion([
        '<array-like> [when] sorted [numerically] <assertion?>',
        '<array-like> [when] sorted by <function> <assertion?>'
    ], function (expect, subject, compareFunction) {
        if (expect.flags.numerically) {
            compareFunction = function (a, b) {
                return a - b;
            };
        }
        return expect.shift(Array.prototype.slice.call(subject).sort(
            typeof compareFunction === 'function' ? compareFunction : undefined
        ));
    });

    expect.addAssertion('<Promise> to be rejected', function (expect, subject) {
        expect.errorMode = 'nested';
        return expect.promise(function () {
            return subject;
        }).then(function (obj) {
            expect.fail(function (output) {
                output.appendInspected(subject).sp().text('unexpectedly fulfilled');
                if (typeof obj !== 'undefined') {
                    output.sp().text('with').sp().appendInspected(obj);
                }
            });
        }, function (err) {
            return err;
        });
    });

    expect.addAssertion('<function> to be rejected', function (expect, subject) {
        expect.errorMode = 'nested';
        return expect(expect.promise(function () {
            return subject();
        }), 'to be rejected');
    });

    expect.addAssertion([
        '<Promise> to be rejected with <any>',
        '<Promise> to be rejected with error [exhaustively] satisfying <any>'
    ], function (expect, subject, value) {
        expect.errorMode = 'nested';
        return expect(subject, 'to be rejected').tap(function (err) {
            return expect.withError(function () {
                if (err && err._isUnexpected && (typeof value === 'string' || isRegExp(value))) {
                    return expect(err, 'to have message', value);
                } else {
                    return expect(err, 'to [exhaustively] satisfy', value);
                }
            }, function (e) {
                e.originalError = err;
                throw e;
            });
        });
    });

    expect.addAssertion([
        '<function> to be rejected with <any>',
        '<function> to be rejected with error [exhaustively] satisfying <any>'
    ], function (expect, subject, value) {
        expect.errorMode = 'nested';
        return expect(expect.promise(function () {
            return subject();
        }), 'to be rejected with error [exhaustively] satisfying', value);
    });

    expect.addAssertion('<Promise> to be fulfilled', function (expect, subject) {
        expect.errorMode = 'nested';
        return expect.promise(function () {
            return subject;
        }).caught(function (err) {
            expect.fail({
                output: function (output) {
                    output.appendInspected(subject).sp().text('unexpectedly rejected');
                    if (typeof err !== 'undefined') {
                        output.sp().text('with').sp().appendInspected(err);
                    }
                },
                originalError: err
            });
        });
    });

    expect.addAssertion('<function> to be fulfilled', function (expect, subject) {
        expect.errorMode = 'nested';
        return expect(expect.promise(function () {
            return subject();
        }), 'to be fulfilled');
    });

    expect.addAssertion([
        '<Promise> to be fulfilled with <any>',
        '<Promise> to be fulfilled with value [exhaustively] satisfying <any>'
    ], function (expect, subject, value) {
        expect.errorMode = 'nested';
        return expect(subject, 'to be fulfilled').tap(function (fulfillmentValue) {
            return expect(fulfillmentValue, 'to [exhaustively] satisfy', value);
        });
    });

    expect.addAssertion([
        '<function> to be fulfilled with <any>',
        '<function> to be fulfilled with value [exhaustively] satisfying <any>'
    ], function (expect, subject, value) {
        expect.errorMode = 'nested';
        return expect(expect.promise(function () {
            return subject();
        }), 'to be fulfilled with value [exhaustively] satisfying', value);
    });

    expect.addAssertion('<Promise> when rejected <assertion>', function (expect, subject, nextAssertion) {
        expect.errorMode = 'nested';
        return expect.promise(function () {
            return subject;
        }).then(function (fulfillmentValue) {
            if (typeof nextAssertion === 'string') {
                expect.argsOutput = function (output) {
                    output.error(nextAssertion);
                    var rest = expect.args.slice(1);
                    if (rest.length > 0) {
                        output.sp().appendItems(rest, ', ');
                    }
                };
            }
            expect.fail(function (output) {
                output.appendInspected(subject).sp().text('unexpectedly fulfilled');
                if (typeof fulfillmentValue !== 'undefined') {
                    output.sp().text('with').sp().appendInspected(fulfillmentValue);
                }
            });
        }, function (err) {
            return expect.withError(function () {
                return expect.shift(err);
            }, function (e) {
                e.originalError = err;
                throw e;
            });
        });
    });

    expect.addAssertion('<function> when rejected <assertion>', function (expect, subject, ...rest) {
        expect.errorMode = 'nested';
        return expect(expect.promise(function () {
            return subject();
        }), 'when rejected', ...rest);
    });

    expect.addAssertion('<Promise> when fulfilled <assertion>', function (expect, subject, nextAssertion) {
        expect.errorMode = 'nested';
        return expect.promise(function () {
            return subject;
        }).then(function (fulfillmentValue) {
            return expect.shift(fulfillmentValue);
        }, function (err) {
            // typeof nextAssertion === 'string' because expect.it is handled by the above (and shift only supports those two):
            expect.argsOutput = function (output) {
                output.error(nextAssertion);
                var rest = expect.args.slice(1);
                if (rest.length > 0) {
                    output.sp().appendItems(rest, ', ');
                }
            };
            expect.fail({
                output: function (output) {
                    output.appendInspected(subject).sp().text('unexpectedly rejected');
                    if (typeof err !== 'undefined') {
                        output.sp().text('with').sp().appendInspected(err);
                    }
                },
                originalError: err
            });
        });
    });

    expect.addAssertion('<function> when fulfilled <assertion>', function (expect, subject, ...rest) {
        expect.errorMode = 'nested';
        return expect(expect.promise(function () {
            return subject();
        }), 'when fulfilled', ...rest);
    });

    expect.addAssertion('<function> to call the callback', function (expect, subject) {
        expect.errorMode = 'nested';
        return expect.promise(function (run) {
            var async = false;
            var calledTwice = false;
            var callbackArgs;
            function cb() {
                if (callbackArgs) {
                    calledTwice = true;
                } else {
                    callbackArgs = Array.prototype.slice.call(arguments);
                }
                if (async) {
                    setTimeout(assert, 0);
                }
            }

            var assert = run(function () {
                if (calledTwice) {
                    expect.fail(function () {
                        this.error('The callback was called twice');
                    });
                }
                return callbackArgs;
            });

            subject(cb);
            async = true;
            if (callbackArgs) {
                return assert();
            }
        });
    });

    expect.addAssertion('<function> to call the callback without error', function (expect, subject) {
        return expect(subject, 'to call the callback').then(function (callbackArgs) {
            var err = callbackArgs[0];
            if (err) {
                expect.errorMode = 'nested';
                expect.fail({
                    message: function (output) {
                        output.error('called the callback with: ');
                        if (err.getErrorMessage) {
                            output.appendErrorMessage(err);
                        } else {
                            output.appendInspected(err);
                        }
                    }
                });
            } else {
                return callbackArgs.slice(1);
            }
        });
    });

    expect.addAssertion('<function> to call the callback with error', function (expect, subject) {
        return expect(subject, 'to call the callback').spread(function (err) {
            expect(err, 'to be truthy');
            return err;
        });
    });

    expect.addAssertion('<function> to call the callback with error <any>', function (expect, subject, value) {
        return expect(subject, 'to call the callback with error').tap(function (err) {
            expect.errorMode = 'nested';
            if (err && err._isUnexpected && (typeof value === 'string' || isRegExp(value))) {
                return expect(err, 'to have message', value);
            } else {
                return expect(err, 'to satisfy', value);
            }
        });
    });
};
