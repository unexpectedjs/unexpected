/*global setTimeout*/
var utils = require('./utils');
var arrayChanges = require('array-changes');
var arrayChangesAsync = require('array-changes-async');
var throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');
var objectIs = utils.objectIs;
var isRegExp = utils.isRegExp;
var isArray = utils.isArray;
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
                errorMode: 'nested',
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

    // Alias for common '[not] to be (a|an)' assertions
    expect.addAssertion('<any> [not] to be an (object|array)', function (expect, subject) {
        expect(subject, '[not] to be an', expect.alternations[0]);
    });

    expect.addAssertion('<any> [not] to be a (boolean|number|string|function|regexp|regex|regular expression)', function (expect, subject) {
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
                    return {diff: output};
                }
            });
        });
    });

    expect.addAssertion('<object|function> [not] to have own property <string>', function (expect, subject, key) {
        expect(subject.hasOwnProperty(key), '[not] to be truthy');
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

    expect.addAssertion('<object|function> [not] to have [own] properties <array>', function (expect, subject, properties) {
        properties.forEach(function (property) {
            expect(subject, '[not] to have [own] property', property);
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
                    var result = diff(actual, expected);
                    result.diff = utils.wrapConstructorNameAroundOutput(result.diff, subject);
                    return result;
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

    expect.addAssertion('<string|array-like> to be non-empty', function (expect, subject) {
        expect(subject, 'not to be empty');
    });

    expect.addAssertion('<object> to [not] [only] have keys <array>', function (expect, subject, keys) {
        keys = isArray(keys) ?
            keys :
            Array.prototype.slice.call(arguments, 2);

        var keysInSubject = {};
        var subjectKeys = expect.findTypeOf(subject).getKeys(subject);
        subjectKeys.forEach(function (key) {
            keysInSubject[key] = true;
        });

        if (expect.flags.not && keys.length === 0) {
            return;
        }

        var hasKeys = subject && keys.every(function (key) {
            return keysInSubject[key];
        });

        if (expect.flags.only) {
            expect(hasKeys, 'to be truthy');
            expect(subjectKeys.length === keys.length, '[not] to be truthy');
        } else {
            expect(hasKeys, '[not] to be truthy');
        }
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
                    return {diff: output};
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
                    return {diff: output};
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
                    return {diff: output};
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
            try {
                return subject();
            } catch (e) {
                throw e;
            }
        }).then(function () {
            return expect.promise(function () {
                expect.fail(function (output) {
                    output.text('expected').sp();
                    output.appendInspect(subject).sp().text('to error');
                });
            });
        }, function (error) {
            return error;
        });
    });

    expect.addAssertion('<function> to error [with] <any>', function (expect, subject, arg) {
        return expect(subject, 'to error').then(function (error) {
            expect.errorMode = 'nested';
            if (error.isUnexpected && (typeof arg === 'string' || isRegExp(arg))) {
                return expect(error, 'to have text message', arg);
            } else {
                return expect(error, 'to satisfy', arg);
            }
        });
    });

    expect.addAssertion('<function> not to error', function (expect, subject, arg) {
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
            expect.fail(function (output) {
                output.error(threw ? 'threw' : 'returned promise rejected with').error(': ')
                    .appendErrorMessage(error);
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
            expect.fail(function (output) {
                output.error('threw: ').appendErrorMessage(error);
            });
        }
    });

    expect.addAssertion('<function> to (throw|throw error|throw exception)', function (expect, subject, arg) {
        try {
            subject();
        } catch (e) {
            return e;
        }
        expect.fail();
    });

    expect.addAssertion('<function> to (throw|throw error|throw exception) <any>', function (expect, subject, arg) {
        return expect(subject, 'to throw').then(function (error) {
            var isUnexpected = error && error._isUnexpected;
            // in the presence of a matcher an error must have been thrown.

            expect.errorMode = 'nested';
            if (isUnexpected && (typeof arg === 'string' || isRegExp(arg))) {
                return expect(error.getErrorMessage('text').toString(), 'to satisfy', arg);
            } else {
                return expect(error, 'to satisfy', arg);
            }
        });
    });

    expect.addAssertion('<function> to have arity <number>', function (expect, subject, value) {
        expect(subject.length, 'to equal', value);
    });

    expect.addAssertion([
        '<object> to have values satisfying <any+>',
        '<object> to have values satisfying <assertion>',
        '<object> to be (a map|a hash|an object) whose values satisfy <any+>',
        '<object> to be (a map|a hash|an object) whose values satisfy <assertion>'
    ], function (expect, subject, nextArg) {
        expect.errorMode = 'nested';
        expect(subject, 'not to equal', {});
        expect.errorMode = 'bubble';

        var keys = expect.subjectType.getKeys(subject);
        var expected = {};
        keys.forEach(function (key, index) {
            if (typeof nextArg === 'string') {
                expected[key] = function (s) {
                    return expect.shift(s, 0);
                };
            } else if (typeof nextArg === 'function') {
                expected[key] = function (s) {
                    return nextArg(s, index);
                };
            } else {
                expected[key] = nextArg;
            }
        });
        return expect.withError(function () {
            return expect(subject, 'to satisfy', expected);
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
        '<array-like> to have items satisfying <any+>',
        '<array-like> to have items satisfying <assertion>',
        '<array-like> to be an array whose items satisfy <any+>',
        '<array-like> to be an array whose items satisfy <assertion>'
    ], function (expect, subject) { // ...
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        expect.errorMode = 'nested';
        expect(subject, 'to be non-empty');
        expect.errorMode = 'bubble';

        return expect.withError(function () {
            return expect.apply(expect, [subject, 'to have values satisfying'].concat(extraArgs));
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
        '<object> to have keys satisfying <any+>',
        '<object> to be (a map|a hash|an object) whose (keys|properties) satisfy <any+>'
    ], function (expect, subject) {
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        expect.errorMode = 'nested';
        expect(subject, 'to be an object');
        expect(subject, 'not to equal', {});
        expect.errorMode = 'default';

        var keys = expect.subjectType.getKeys(subject);
        return expect.apply(expect, [keys, 'to have items satisfying'].concat(extraArgs));
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

    expect.addAssertion('<Error> to have (ansi|html|text|) (message|diff) <any>', function (expect, subject, value) {
        expect.errorMode = 'nested';
        var format = expect.alternations[0] || 'text';
        var useDiff = expect.alternations[1] === 'diff';
        if (subject.isUnexpected) {
            var subjectPen;
            if (useDiff) {
                var diffResult = subject.getDiff({ format: format });
                if (diffResult && diffResult.diff) {
                    subjectPen = diffResult.diff;
                } else {
                    expect.fail('The UnexpectedError instance does not have a diff');
                }
            } else {
                subjectPen = subject.getErrorMessage({ format: format });
            }
            var valueType = expect.argTypes[0];
            if (valueType.is('magicpen')) {
                expect(subjectPen, 'to equal', value);
            } else if (valueType.is('function') && !valueType.is('expect.it')) {
                var expectedOutput = expect.createOutput(format);
                var returnValue = value.call(expectedOutput, subjectPen.toString());
                if (!expectedOutput.isEmpty()) {
                    // If the function didn't generate any expected output, assume that it ran assertions based on the serialized message
                    expect(subjectPen, 'to equal', expectedOutput);
                }
                return returnValue;
            } else {
                return expect(subjectPen.toString(), 'to satisfy', value);
            }
        } else {
            if (useDiff) {
                expect.fail('Cannot get the diff from a non-Unexpected error');
            }
            if (format !== 'text') {
                expect.fail('Cannot get the ' + format + ' representation of non-Unexpected error');
            } else {
                return expect(subject.message, 'to satisfy', value);
            }
        }
    });

    expect.addAssertion('<Error> to [exhaustively] satisfy <Error>', function (expect, subject, value) {
        expect(subject.constructor, 'to be', value.constructor);
        expect(subject, 'to have properties', expect.argTypes[0].unwrap(value));
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
            return value(subject);
        }, function (e) {
            expect.fail({
                diff: function (output, diff, inspect, equal) {
                    return {
                        diff: output.appendErrorMessage(e),
                        inline: false
                    };
                }
            });
        });
    });

    expect.addAssertion('<any|Error> to [exhaustively] satisfy <function>', function (expect, subject, value) {
        return expect.promise(function () {
            return value(subject);
        });
    });

    expect.addAssertion('<binaryArray> to [exhaustively] satisfy <binaryArray>', function (expect, subject, value) {
        expect(subject, 'to equal', value);
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
            return value(subject);
        }, function (e) {
            expect.fail({
                diff: function (output) {
                    return {
                        diff: output.appendErrorMessage(e),
                        inline: false
                    };
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
        var keyPromises = new Array(value.length);
        var i;
        var valueKeys = new Array(value.length);
        for (i = 0 ; i < value.length ; i += 1) {
            valueKeys[i] = i;
            keyPromises[i] = expect.promise(function () {
                var valueKeyType = expect.findTypeOf(value[i]);
                if (valueKeyType.is('function')) {
                    return value[i](subject[i]);
                } else {
                    return expect(subject[i], 'to [exhaustively] satisfy', value[i]);
                }
            });
        }
        return expect.promise.all([
            expect.promise(function () {
                expect(subject, 'to only have keys', valueKeys);
            }),
            expect.promise.all(keyPromises)
        ]).caught(function () {
            var subjectType = expect.subjectType;
            return expect.promise.settle(keyPromises).then(function () {
                var toSatisfyMatrix = new Array(subject.length * value.length);
                for (i = 0 ; i < subject.length ; i += 1) {
                    if (i < value.length) {
                        toSatisfyMatrix[i + i * subject.length] = keyPromises[i].isFulfilled() || keyPromises[i].reason();
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
                var changes = arrayChanges(subject, value, function equal(a, b, aIndex, bIndex) {
                    var existingResult = toSatisfyMatrix[aIndex + subject.length * bIndex];
                    if (typeof existingResult !== 'undefined') {
                        return existingResult === true;
                    }
                    var result;
                    try {
                        result = expect(a, 'to [exhaustively] satisfy', b);
                    } catch (err) {
                        throwIfNonUnexpectedError(err);
                        toSatisfyMatrix[aIndex + subject.length * bIndex] = err;
                        return false;
                    }
                    result.then(function () {}, function () {});
                    if (result.isPending()) {
                        isAsync = true;
                        return false;
                    }
                    toSatisfyMatrix[aIndex + subject.length * bIndex] = true;
                    return true;
                }, function (a, b) {
                    return subjectType.similar(a, b);
                });
                if (isAsync) {
                    return expect.promise(function (resolve, reject) {
                        arrayChangesAsync(subject, value, function equal(a, b, aIndex, bIndex, cb) {
                            var existingResult = toSatisfyMatrix[aIndex + subject.length * bIndex];
                            if (typeof existingResult !== 'undefined') {
                                return cb(existingResult === true);
                            }
                            expect.promise(function () {
                                return expect(a, 'to [exhaustively] satisfy', b);
                            }).then(function () {
                                toSatisfyMatrix[aIndex + subject.length * bIndex] = true;
                                cb(true);
                            }, function (err) {
                                toSatisfyMatrix[aIndex + subject.length * bIndex] = err;
                                cb(false);
                            });
                        }, function (a, b, aIndex, bIndex, cb) {
                            cb(subjectType.similar(a, b));
                        }, resolve);
                    }).then(failWithChanges);
                } else {
                    return failWithChanges(changes);
                }

                function failWithChanges(changes) {
                    expect.errorMode = 'default';
                    expect.fail({
                        diff: function (output, diff, inspect, equal) {
                            var result = {
                                diff: output,
                                inline: true
                            };
                            var indexOfLastNonInsert = changes.reduce(function (previousValue, diffItem, index) {
                                return (diffItem.type === 'insert') ? previousValue : index;
                            }, -1);
                            output.append(subjectType.prefix(output.clone(), subject)).nl().indentLines();
                            changes.forEach(function (diffItem, index) {
                                var delimiterOutput = subjectType.delimiter(output.clone(), index, indexOfLastNonInsert + 1);
                                output.i().block(function () {
                                    var type = diffItem.type;
                                    if (type === 'insert') {
                                        this.annotationBlock(function () {
                                            if (expect.findTypeOf(diffItem.value).is('function')) {
                                                this.error('missing: ').block(function () {
                                                    this.omitSubject = undefined;
                                                    this.appendErrorMessage(keyPromises[diffItem.expectedIndex].reason());
                                                });
                                            } else {
                                                this.error('missing ').block(inspect(diffItem.value));
                                            }
                                        });
                                    } else if (type === 'remove') {
                                        this.block(inspect(diffItem.value).amend(delimiterOutput.sp()).error('// should be removed'));
                                    } else if (type === 'equal') {
                                        this.block(inspect(diffItem.value).amend(delimiterOutput));
                                    } else {
                                        var toSatisfyResult = toSatisfyMatrix[diffItem.actualIndex + subject.length * diffItem.expectedIndex];
                                        var valueDiff = toSatisfyResult && toSatisfyResult !== true && toSatisfyResult.getDiff({ output: output.clone() });
                                        if (valueDiff && valueDiff.inline) {
                                            this.block(valueDiff.diff.amend(delimiterOutput));
                                        } else {
                                            this.block(inspect(diffItem.value).amend(delimiterOutput)).sp().annotationBlock(function () {
                                                this.omitSubject = diffItem.value;
                                                var label = toSatisfyResult.getLabel();
                                                if (label) {
                                                    this.error(label).sp()
                                                        .block(inspect(diffItem.expected));
                                                    if (valueDiff) {
                                                        this.nl(2).append(valueDiff.diff);
                                                    }
                                                } else {
                                                    this.appendErrorMessage(toSatisfyResult);
                                                }
                                            });
                                        }
                                    }
                                }).nl();
                            });
                            output.outdentLines().append(subjectType.suffix(output.clone(), subject));
                            return result;
                        }
                    });
                }
            });
        });
    });

    expect.addAssertion('<object> to [exhaustively] satisfy <object>', function (expect, subject, value) {
        var valueType = expect.argTypes[0];
        var subjectType = expect.subjectType;
        if (subject === value) {
            return;
        }
        var promiseByKey = {};
        var keys = valueType.getKeys(value);

        keys.forEach(function (key, index) {
            promiseByKey[key] = expect.promise(function () {
                var valueKeyType = expect.findTypeOf(value[key]);
                if (valueKeyType.is('function')) {
                    return value[key](subject[key]);
                } else {
                    return expect(subject[key], 'to [exhaustively] satisfy', value[key]);
                }
            });
        });

        return expect.promise.all([
            expect.promise(function () {
                if (expect.flags.exhaustively) {
                    expect(subject, 'to only have keys', keys);
                }
            }),
            expect.promise.all(promiseByKey)
        ]).caught(function () {
            return expect.promise.settle(promiseByKey).then(function () {
                expect.fail({
                    diff: function (output, diff, inspect, equal) {
                        var result = {
                            diff: output,
                            inline: true
                        };

                        var keyIndex = {};
                        var subjectIsArrayLike = subjectType.is('array-like');
                        var subjectKeys = subjectType.getKeys(subject);
                        subjectKeys.concat(valueType.getKeys(value)).forEach(function (key) {
                            if (!(key in keyIndex)) {
                                keyIndex[key] = key;
                            }
                        });

                        var keys = Object.keys(keyIndex);

                        subjectType.prefix(output, subject);
                        output.nl().indentLines();

                        keys.forEach(function (key, index) {
                            output.i().block(function () {
                                var valueOutput;
                                var annotation = output.clone();
                                var conflicting;

                                if (promiseByKey[key] && promiseByKey[key].isRejected()) {
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
                                        output.error('// missing:').sp();
                                        valueOutput = output.clone().appendErrorMessage(promiseByKey[key].reason());
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
                                    if (keyDiff && keyDiff.diff && keyDiff.inline) {
                                        valueOutput = keyDiff.diff;
                                    } else if (typeof value[key] === 'function') {
                                        isInlineDiff = false;
                                        annotation.appendErrorMessage(conflicting);
                                    } else if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                        annotation.error((conflicting && conflicting.getLabel()) || 'should satisfy').sp()
                                            .block(inspect(value[key]));

                                        if (keyDiff) {
                                            annotation.nl().append(keyDiff.diff);
                                        }
                                    } else {
                                        valueOutput = keyDiff.diff;
                                    }
                                }

                                if (!valueOutput) {
                                    if (missingArrayIndex) {
                                        valueOutput = output.clone();
                                    } else {
                                        valueOutput = inspect(subject[key]);
                                    }
                                }

                                if (!subjectIsArrayLike) {
                                    this.key(key).text(':');
                                }

                                var omitDelimiter =
                                    missingArrayIndex ||
                                    index >= subjectKeys.length - 1;

                                if (!omitDelimiter) {
                                    valueOutput.amend(subjectType.delimiter(output.clone(), index, keys.length));
                                }

                                if (!subjectIsArrayLike) {
                                    if (valueOutput.isBlock() && valueOutput.isMultiline()) {
                                        this.indentLines();
                                        this.nl().i();
                                    } else {
                                        this.sp();
                                    }
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

                                if (isInlineDiff) {
                                    this.append(valueOutput);
                                } else {
                                    this.block(valueOutput);
                                }
                            }).nl();
                        });

                        output.outdentLines();
                        subjectType.suffix(output, subject);

                        return result;
                    }
                });
            });
        });
    });

    function wrapDiffWithTypePrefixAndSuffix(e, type, subject) {
        var createDiff = e.getDiffMethod();
        if (createDiff) {
            return function (output) { // ...
                type.prefix.call(type, output, subject);
                var result = createDiff.apply(this, arguments);
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
        return expect.shift(subject.apply(subject, args));
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
                args = [].concat(args);
                args.push(run(function (err, result) {
                    expect(err, 'to be falsy');
                    return expect.shift(result);
                }));
                fn.apply(null, args);
            });
        } else {
            return expect.shift(expect.flags.constructor ? instantiate(fn, args) : fn.apply(fn, args));
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
                args = [].concat(args);
                args.push(run(function (err, result) {
                    expect(err, 'to be falsy');
                    return expect.shift(result);
                }));
                fn.apply(null, args);
            });
        } else {
            return expect.shift(expect.flags.constructor ? instantiate(fn, args) : fn.apply(fn, args));
        }
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

    expect.addAssertion('<Promise> to be rejected with <any>', function (expect, subject, value) {
        expect.errorMode = 'nested';
        return expect(subject, 'to be rejected').then(function (err) {
            if (err && err._isUnexpected && (typeof value === 'string' || isRegExp(value))) {
                return expect(err, 'to have text message', value);
            } else {
                return expect(err, 'to satisfy', value);
            }
        });
    });

    expect.addAssertion('<Promise> to be fulfilled', function (expect, subject) {
        expect.errorMode = 'nested';
        return expect.promise(function () {
            return subject;
        }).then(function (fulfillmentValue) {
            return fulfillmentValue;
        }, function (err) {
            expect.fail(function (output) {
                output.appendInspected(subject).sp().text('unexpectedly rejected');
                if (typeof err !== 'undefined') {
                    output.sp().text('with').sp().appendInspected(err);
                }
            });
        });
    });

    expect.addAssertion('<Promise> to be fulfilled with <any>', function (expect, subject, value) {
        expect.errorMode = 'nested';
        return expect(subject, 'to be fulfilled').then(function (fulfillmentValue) {
            return expect(fulfillmentValue, 'to satisfy', value);
        });
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
            return expect.shift(err);
        });
    });

    expect.addAssertion('<Promise> when fulfilled <assertion>', function (expect, subject, nextAssertion) {
        expect.errorMode = 'nested';
        return expect.promise(function () {
            return subject;
        }).then(function (fulfillmentValue) {
            if (expect.findTypeOf(nextAssertion).is('expect.it')) {
                // Force a failing expect.it error message to be properly nested instead of replacing the default error message:
                return expect.promise(function () {
                    return expect.shift(fulfillmentValue, 0);
                }).caught(function (err) {
                    expect.fail(err);
                });
            } else {
                return expect.shift(fulfillmentValue);
            }
        }, function (err) {
            // typeof nextAssertion === 'string' because expect.it is handled by the above (and shift only supports those two):
            expect.argsOutput = function (output) {
                output.error(nextAssertion);
                var rest = expect.args.slice(1);
                if (rest.length > 0) {
                    output.sp().appendItems(rest, ', ');
                }
            };
            expect.fail(function (output) {
                output.appendInspected(subject).sp().text('unexpectedly rejected');
                if (typeof err !== 'undefined') {
                    output.sp().text('with').sp().appendInspected(err);
                }
            });
        });
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
        return expect(subject, 'to call the callback with error').then(function (err) {
            expect.errorMode = 'nested';
            if (err && err._isUnexpected && (typeof value === 'string' || isRegExp(value))) {
                return expect(err, 'to have text message', value).then(function () {
                    return err;
                });
            } else {
                return expect(err, 'to satisfy', value).then(function () {
                    return err;
                });
            }
        });
    });
};
