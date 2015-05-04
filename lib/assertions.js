var ansiRegex = require('ansi-regex')();
var utils = require('./utils');
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

        var testDescription = this.testDescription;
        expect.withError(function () {
            expect(Math.abs(subject - value), '[not] to be less than or equal to', epsilon);
        }, function (e) {
            expect.fail(function (output) {
                output.error('expected ')
                    .append(expect.inspect(subject)).sp()
                    .error(testDescription).sp()
                    .append(expect.inspect(value)).sp()
                    .text('(epsilon: ')
                    .jsNumber(epsilon.toExponential())
                    .text(')');
            });
        });
    });

    expect.addAssertion('[not] to be (a|an)', function (expect, subject, type) {
        if ('string' === typeof type) {
            var subjectType = expect.findTypeOf(subject);
            type = /^reg(?:exp?|ular expression)$/.test(type) ? 'regexp' : type;
            this.args[0] = expect.output.clone().jsString(type);
            expect(subjectType.is(type), '[not] to be truthy');
        } else if ('function' === typeof type) {
            var functionName = utils.getFunctionName(type);
            if (functionName) {
                this.args[0] = expect.output.clone().text(functionName);
            }
            expect(subject instanceof type, '[not] to be truthy');
        } else if ('object' === typeof type && type) {
            if (typeof type.identify !== 'function' || typeof type.name !== 'string') {
                throw new Error("The '" + this.testDescription + "' assertion requires either a string (type name), a type object, or function argument");
            }
            this.args[0] = expect.output.clone().text(type.name);
            expect(type.identify(subject), '[not] to be true');
        } else {
            throw new Error("The '" + this.testDescription + "' assertion requires either a string (type name), a type object, or function argument");
        }
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
        var flags = this.flags;
        subject = String(subject);
        expect.withError(function () {
            expect(String(subject).match(regexp), '[not] to be truthy');
        }, function (e) {
            expect.fail({
                label: 'should match',
                diff: flags.not && function (output) {
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
                }
            });
        });
    });

    expect.addAssertion('object', '[not] to have [own] property', function (expect, subject, key, value) {
        if (arguments.length === 4) {
            if (this.flags.not) {
                throw new Error("The 'not to have property' assertion does not with a value argument");
            }

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
                    }
                });
            });
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
            expect(expect.findTypeOf(subject).getKeys(subject).length === keys.length, '[not] to be truthy');
        } else {
            expect(hasKeys, '[not] to be truthy');
        }
    });

    expect.addAssertion('string', '[not] to contain', function (expect, subject) {
        var flags = this.flags;
        var args = Array.prototype.slice.call(arguments, 2);
        expect.withError(function () {
            args.forEach(function (arg) {
                expect(subject.indexOf(arg) !== -1, '[not] to be truthy');
            });
        }, function (e) {
            expect.fail({
                diff: flags.not && function (output) {
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
                }
            });
        });
    });

    expect.addAssertion('array-like', '[not] to contain', function (expect, subject) {
        var flags = this.flags;
        var args = Array.prototype.slice.call(arguments, 2);
        expect.withError(function () {
            args.forEach(function (arg) {
                expect(subject && Array.prototype.some.call(subject, function (item) {
                    return expect.equal(item, arg);
                }), '[not] to be truthy');
            });
        }, function (e) {
            expect.fail({
                diff: flags.not && function (output, diff, inspect, equal) {
                    return diff(subject, Array.prototype.filter.call(subject, function (item) {
                        return !args.some(function (arg) {
                            return equal(item, arg);
                        });
                    }));
                }
            });
        });
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
        var flags = this.flags;
        expect.withError(function () {
            expect(expect.equal(value, subject), '[not] to be truthy');
        }, function (e) {
            expect.fail({
                label: 'should equal',
                diff: !flags.not && function (output, diff) {
                    return diff(subject, value);
                }
            });
        });
    });

    expect.addAssertion('function', '[not] to (throw|throw error|throw exception)', function (expect, subject, arg) {
        var thrown = false;
        var error;
        var hasArg = arguments.length > 2;

        if (this.flags.not && hasArg) {
            throw new Error("The 'not to throw' assertion does not support arguments");
        }

        try {
            subject();
        } catch (e) {
            error = e;
            thrown = true;
        }

        var isUnexpected = error && error._isUnexpected;
        if (hasArg) {
            // in the presence of a matcher an error must have been thrown.
            expect(thrown, 'to be truthy');

            this.errorMode = 'nested';
            if (isUnexpected && (typeof arg === 'string' || isRegExp(arg))) {
                expect(error.output.toString(), 'to satisfy', arg);
            } else {
                expect(error, 'to satisfy', arg);
            }
        } else if (this.flags.not && thrown) {
            this.errorMode = 'nested';
            expect.fail('threw: {0}', isUnexpected ? error.output : expect.inspect(error));
        } else {
            expect(thrown, '[not] to be truthy');
        }
    });

    expect.addAssertion('function', 'to have arity', function (expect, subject, value) {
        expect(subject.length, 'to equal', value);
    });

    expect.addAssertion('object', [
        'to have values satisfying',
        'to be (a map|a hash|an object) whose values satisfy'
    ], function (expect, subject) {
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'not to equal', {});
        this.errorMode = 'bubble';

        var promiseByKey = {};
        expect.findTypeOf(subject).getKeys(subject).forEach(function (key, index) {
            promiseByKey[key] = expect.promise(function () {
                if (typeof extraArgs[0] === 'function') {
                    return extraArgs[0](subject[key], index);
                } else {
                    return expect.apply(expect, [subject[key], 'to satisfy assertion'].concat(extraArgs));
                }
            });
        });

        return expect.promise.all(promiseByKey).caught(function () {
            return expect.promise.settle(promiseByKey).then(function () {
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

                    var seenFirstRejected = false;
                    Object.keys(promiseByKey).forEach(function (key) {
                        var promise = promiseByKey[key];
                        if (promise.isRejected()) {
                            var error = promise.reason();
                            if (seenFirstRejected) {
                                output.nl();
                            } else {
                                seenFirstRejected = true;
                            }
                            output.i().text(key).text(': ').block(error.output);
                        }
                    });
                });
            });
        });
    });

    expect.addAssertion('array-like', [
        'to have items satisfying',
        'to be an array whose items satisfy'
    ], function (expect, subject) { // ...
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be non-empty');
        this.errorMode = 'bubble';
        return expect.apply(expect, [subject, 'to have values satisfying'].concat(extraArgs));
    });

    expect.addAssertion('object', [
        'to have keys satisfying',
        'to be (a map|a hash|an object) whose (keys|properties) satisfy'
    ], function (expect, subject) {
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an object');
        expect(subject, 'not to equal', {});
        this.errorMode = 'bubble';

        var subjectKeys = expect.findTypeOf(subject).getKeys(subject),
            promiseByKey = {};
        subjectKeys.forEach(function (key) {
            promiseByKey[key] = expect.promise(function () {
                if (typeof extraArgs[0] === 'function') {
                    return extraArgs[0](key, subject[key]);
                } else {
                    return expect.apply(expect, [key, 'to satisfy assertion'].concat(extraArgs));
                }
            });
        }, this);

        return expect.promise.all(promiseByKey).caught(function () {
            return expect.promise.settle(promiseByKey).then(function () {
                expect.fail(function (output) {
                    output.error('failed expectation on keys ')
                          .text(subjectKeys.join(', '))
                          .error(':').nl()
                          .indentLines();

                    var seenFirstRejected = false;
                    Object.keys(promiseByKey).forEach(function (key) {
                        var promise = promiseByKey[key];
                        if (promise.isRejected()) {
                            var error = promise.reason();
                            if (seenFirstRejected) {
                                output.nl();
                            } else {
                                seenFirstRejected = true;
                            }
                            output.i().text(key).text(': ').block(error.output);
                        }
                    });
                });
            });
        });
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

    expect.addAssertion('Error', 'to have message', function (expect, subject, value) {
        this.errorMode = 'nested';
        if (subject._isUnexpected) {
            return expect.promise(function () {
                return expect(subject.output.toString('text'), 'to satisfy', value);
            }).then(function () {
                return expect(subject.message.replace(ansiRegex, '').replace(/^\n/, ''), 'to satisfy', value);
            });
        } else {
            return expect(subject.message, 'to satisfy', value);
        }
    });

    expect.addAssertion('Error', 'to [exhaustively] satisfy', function (expect, subject, value) {
        var valueType = expect.findTypeOf(value);
        if (valueType.is('Error')) {
            expect(subject.constructor, 'to be', value.constructor);
            expect(subject, 'to have properties', valueType.unwrap(value));
        } else if (typeof value === 'function') {
            value(subject);
        } else if (valueType.is('object')) {
            var keys = valueType.getKeys(value);
            keys.forEach(function (key) {
                expect(subject[key], 'to [exhaustively] satisfy', value[key]);
            });
            if (this.flags.exhaustively) {
                expect(expect.findTypeOf(subject).getKeys(subject).filter(function (key) {
                    return typeof subject[key] !== 'undefined';
                }), 'to have length', keys.filter(function (key) {
                    return typeof value[key] !== 'undefined';
                }).length);
            }
        } else {
            return expect(subject.message, 'to [exhaustively] satisfy', value);
        }
    });

    expect.addAssertion('binaryArray', 'to [exhaustively] satisfy', function (expect, subject, value) {
        if (typeof value === 'function') {
            if (value._expectIt) {
                return expect.withError(function () {
                    return value(subject);
                }, function (e) {
                    expect.fail({
                        diff: function (output, diff, inspect, equal) {
                            return {
                                diff: output.append(e.output),
                                inline: false
                            };
                        }
                    });
                });
            } else {
                return value(subject);
            }
        } else {
            expect(subject, 'to equal', value);
        }
    });

    if (typeof Buffer !== 'undefined') {
        expect.addAssertion('Buffer', 'when decoded as', function (expect, subject, value) {
            return this.shift(subject.toString(value), 1);
        });
    }

    expect.addAssertion('[not] to [exhaustively] satisfy [assertion]', function (expect, subject, value) {
        if (this.flags.not) {
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
        } else if (this.flags.assertion) {
            this.errorMode = 'bubble'; // to satisfy assertion 'to be a number' => to be a number
            if (typeof value === 'string') {
                return expect.apply(expect, Array.prototype.slice.call(arguments, 1));
            } else {
                return expect.apply(expect, [subject, this.flags.exhaustively ? 'to exhaustively satisfy' : 'to satisfy'].concat(Array.prototype.slice.call(arguments, 2)));
            }
        } else if (value && value._expectIt) {
            return expect.withError(function () {
                return value(subject);
            }, function (e) {
                expect.fail({
                    diff: function (output, diff, inspect, equal) {
                        return {
                            diff: output.append(e.output),
                            inline: false
                        };
                    }
                });
            });
        } else if (typeof value === 'function') {
            return expect.promise(function () {
                return value(subject);
            });
        } else if (isRegExp(value)) {
            expect(subject, 'to match', value);
        } else {
            var subjectType = expect.findTypeOf(subject),
                commonType = expect.findCommonType(subject, value),
                valueType = expect.findTypeOf(value),
                bothAreArrays = commonType.is('array-like');
            if (commonType.is('array-like') || commonType.is('object')) {
                expect(subject, 'to be an object');
                var promiseByKey = {};
                var keys = valueType.getKeys(value);
                keys.forEach(function (key, index) {
                    promiseByKey[key] = expect.promise(function () {
                        if (typeof value[key] === 'function') {
                            return value[key](subject[key]);
                        } else {
                            return expect(subject[key], 'to [exhaustively] satisfy', value[key]);
                        }
                    });
                });

                var flags = this.flags;

                return expect.promise.all([
                    expect.promise(function () {
                        if (commonType.is('array-like') || flags.exhaustively) {
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

                                var valueType = expect.findTypeOf(value),
                                    keyIndex = {};
                                subjectType.getKeys(subject).concat(valueType.getKeys(value)).forEach(function (key) {
                                    if (!(key in keyIndex)) {
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

                                        if (promiseByKey[key] && promiseByKey[key].isRejected()) {
                                            conflicting = promiseByKey[key].reason();
                                        }
                                        var arrayItemOutOfRange = bothAreArrays && (index >= subject.length || index >= value.length);

                                        var isInlineDiff = true;

                                        if (!(key in value)) {
                                            if (commonType.is('array-like') || flags.exhaustively) {
                                                annotation.error('should be removed');
                                            } else {
                                                conflicting = null;
                                            }
                                        } else if (conflicting || arrayItemOutOfRange) {
                                            var keyDiff = conflicting && conflicting.createDiff && conflicting.createDiff(output.clone(), diff, inspect, equal);
                                            isInlineDiff = !keyDiff || keyDiff.inline ;
                                            if (typeof value[key] === 'function') {
                                                isInlineDiff = false;
                                                annotation.append(conflicting.output);
                                            } else if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                                annotation.error((conflicting && conflicting.label) || 'should satisfy').sp()
                                                    .block(inspect(value[key]));

                                                if (keyDiff) {
                                                    annotation.nl().append(keyDiff.diff);
                                                }
                                            } else {
                                                valueOutput = keyDiff.diff;
                                            }
                                        }

                                        var last = index === keys.length - 1;
                                        if (!valueOutput) {
                                            if (bothAreArrays && key >= subject.length) {
                                                valueOutput = output.clone();
                                            } else {
                                                valueOutput = inspect(subject[key], conflicting ? Infinity : 1);
                                            }
                                        }

                                        if (!bothAreArrays) {
                                            this.key(key).text(':');
                                        }
                                        valueOutput.amend('text', last ? '' : ',');


                                        if (!bothAreArrays) {
                                            if (valueOutput.isBlock() && valueOutput.isMultiline()) {
                                                this.indentLines();
                                                this.nl().i();
                                            } else {
                                                this.sp();
                                            }
                                        }

                                        if (isInlineDiff) {
                                            this.append(valueOutput);
                                        } else {
                                            this.block(valueOutput);
                                        }
                                        if (!annotation.isEmpty()) {
                                            this.sp(valueOutput.isEmpty() ? 0 : 1).annotationBlock(annotation);
                                        }
                                    }).nl();
                                });

                                output.outdentLines().text(bothAreArrays ? ']' : '}');

                                if (!bothAreArrays) {
                                    result.diff = utils.wrapConstructorNameAroundOutput(result.diff, subject);
                                }

                                return result;
                            }
                        });
                    });
                });
            } else {
                expect(subject, 'to equal', value);
            }
        }
    });

    function wrapDiffWithTypePrefixAndSuffix(e, type) {
        var createDiff = e.createDiff;
        if (createDiff) {
            return function (output) { // ...
                type.prefix.call(e, output);
                var result = createDiff.apply(this, arguments);
                type.suffix.call(e, output);
                return result;
            };
        }
    }

    expect.addAssertion('wrapperObject', 'to [exhaustively] satisfy', function (expect, subject, value) {
        var valueType = expect.findTypeOf(value);
        if (valueType.is('wrapperObject')) {
            var type = expect.findCommonType(subject, value);
            expect(type.is('wrapperObject'), 'to be truthy');
            return expect.withError(function () {
                return expect(type.unwrap(subject), 'to [exhaustively] satisfy', type.unwrap(value));
            }, function (e) {
                expect.fail({
                    label: e.label,
                    diff: wrapDiffWithTypePrefixAndSuffix(e, type)
                });
            });
        } else {
            var subjectType = expect.findTypeOf(subject);
            expect(subjectType.is('wrapperObject'), 'to be truthy');

            return expect.withError(function () {
                return expect(subjectType.unwrap(subject), 'to [exhaustively] satisfy', value);
            }, function (e) {
                expect.fail({
                    label: 'should satisfy',
                    diff: wrapDiffWithTypePrefixAndSuffix(e, subjectType)
                });
            });
        }
    });

    expect.addAssertion('function', 'when called with', function (expect, subject, args) { // ...
        this.errorMode = 'nested';
        return this.shift(subject.apply(subject, args), 1);
    });

    function instantiate(Constructor, args) {
        function ProxyConstructor() {
            return Constructor.apply(this, args);
        }
        ProxyConstructor.prototype = Constructor.prototype;
        return new ProxyConstructor();
    }

    expect.addAssertion('array-like', [
        'when passed as parameters to [async]',
        'when passed as parameters to [constructor]'
    ], function (expect, subject, fn) { // ...
        this.errorMode = 'nested';
        var that = this,
            args = subject;
        if (that.flags.async) {
            return expect.promise(function (run) {
                args = [].concat(args);
                args.push(run(function (err, result) {
                    expect(err, 'to be falsy');
                    return that.shift(result, 1);
                }));
                fn.apply(null, args);
            });
        } else {
            subject = that.flags.constructor ? instantiate(fn, args) : fn.apply(fn, args);
            return that.shift(subject, 1);
        }
    });

    expect.addAssertion([
        'when passed as parameter to [async]',
        'when passed as parameter to [constructor]'
    ], function (expect, subject) {
        this.errorMode = 'bubble';
        return expect.apply(expect, [[subject], 'when passed as parameters to [async] [constructor]'].concat(this.args));
    });
};
