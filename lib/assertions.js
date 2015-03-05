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
                                    valueOutput.text(last ? '' : ',');

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
