var shim = require('./shim');
var forEach = shim.forEach;
var getKeys = shim.getKeys;
var every = shim.every;
var indexOf = shim.indexOf;

var utils = require('./utils');
var isRegExp = utils.isRegExp;
var isArray = utils.isArray;
var extend = utils.extend;
var cloneError = utils.cloneError;

module.exports = function (expect) {
    expect.addAssertion('[not] to be (ok|truthy)', function (expect, subject) {
        this.assert(subject);
    });

    expect.addAssertion('[not] to be', function (expect, subject, value) {
        if (typeof subject === 'string' && typeof value === 'string') {
            expect(subject, '[not] to equal', value);
        } else {
            expect(subject === value, '[not] to be truthy');
        }
    });

    expect.addAssertion('[not] to be true', function (expect, subject) {
        expect(subject, '[not] to be', true);
    });

    expect.addAssertion('[not] to be false', function (expect, subject) {
        expect(subject, '[not] to be', false);
    });

    expect.addAssertion('[not] to be falsy', function (expect, subject) {
        expect(subject, '[!not] to be truthy');
    });

    expect.addAssertion('[not] to be null', function (expect, subject) {
        expect(subject, '[not] to be', null);
    });

    expect.addAssertion('[not] to be undefined', function (expect, subject) {
        expect(typeof subject, '[not] to be', 'undefined');
    });

    expect.addAssertion('to be defined', function (expect, subject) {
        expect(subject, 'not to be undefined');
    });

    expect.addAssertion('[not] to be NaN', function (expect, subject) {
        expect(isNaN(subject), '[not] to be true');
    });

    expect.addAssertion('[not] to be close to', function (expect, subject, value, epsilon) {
        this.errorMode = 'bubble';
        if (typeof epsilon !== 'number') {
            epsilon = 1e-9;
        }
        try {
            expect(Math.abs(subject - value), '[not] to be less than or equal to', epsilon);
        } catch (e) {
            expect.fail('expected {0} {1} {2} (epsilon: {3})',
                        expect.inspect(subject),
                        this.testDescription,
                        expect.inspect(value),
                        epsilon.toExponential());
        }
    });

    expect.addAssertion('[not] to be (a|an)', function (expect, subject, type) {
        if ('string' === typeof type) {
            // typeof with support for 'array'
            expect('array' === type ? isArray(subject) :
                    'object' === type ? 'object' === typeof subject && null !== subject :
                        /^reg(?:exp?|ular expression)$/.test(type) ? isRegExp(subject) :
                            type === typeof subject,
                   '[not] to be true');
        } else {
            expect(subject instanceof type, '[not] to be true');
        }

        return this;
    });

    // Alias for common '[not] to be (a|an)' assertions
    expect.addAssertion('[not] to be (a|an) (boolean|number|string|function|object|array|regexp|regex|regular expression)', function (expect, subject) {
        var matches = /(.* be (?:a|an)) ([\w\s]+)/.exec(this.testDescription);
        expect(subject, matches[1], matches[2]);
    });

    forEach(['string', 'array', 'object'], function (type) {
        expect.addAssertion('to be (the|an) empty ' + type, function (expect, subject) {
            expect(subject, 'to be a', type);
            expect(subject, 'to be empty');
        });

        expect.addAssertion('to be a non-empty ' + type, function (expect, subject) {
            expect(subject, 'to be a', type);
            expect(subject, 'not to be empty');
        });
    });

    expect.addAssertion('[not] to match', function (expect, subject, regexp) {
        expect(regexp.exec(subject), '[not] to be truthy');
    });

    expect.addAssertion('[not] to have [own] property', function (expect, subject, key, value) {
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

    expect.addAssertion('[not] to have [own] properties', function (expect, subject, properties) {
        if (properties && isArray(properties)) {
            forEach(properties, function (property) {
                expect(subject, '[not] to have [own] property', property);
            });
        } else if (properties && typeof properties === 'object') {
            // TODO the not flag does not make a lot of sense in this case
            if (this.flags.not) {
                forEach(getKeys(properties), function (property) {
                    expect(subject, 'not to have [own] property', property);
                });
            } else {
                try {
                    forEach(getKeys(properties), function (property) {
                        var value = properties[property];
                        if (typeof value === 'undefined') {
                            expect(subject, 'not to have [own] property', property);
                        } else {
                            expect(subject, 'to have [own] property', property, value);
                        }
                    });
                } catch (e) {
                    var newError = cloneError(e);
                    newError.expected = extend({}, properties);
                    newError.actual = {};
                    for (var propertyName in subject) {
                        if ((!this.flags.own || subject.hasOwnProperty(propertyName)) && !(propertyName in properties)) {
                            newError.expected[propertyName] = subject[propertyName];
                        }
                        if (!this.flags.own && !(propertyName in newError.actual)) {
                            newError.actual[propertyName] = subject[propertyName];
                        }
                    }
                    expect.fail(newError);
                }
            }
        } else {
            throw new Error("Assertion '" + this.testDescription + "' only supports " +
                            "input in the form of an Array or an Object.");
        }
    });

    expect.addAssertion('[not] to have length', function (expect, subject, length) {
        if (!subject || typeof subject.length !== 'number') {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports array like objects");
        }
        expect(subject.length, '[not] to be', length);
    });

    expect.addAssertion('[not] to be empty', function (expect, subject) {
        var length;
        if (subject && 'number' === typeof subject.length) {
            length = subject.length;
        } else if (isArray(subject) || typeof subject === 'string') {
            length = subject.length;
        } else if (subject && typeof subject === 'object') {
            length = getKeys(subject).length;
        } else {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports strings, arrays and objects");
        }
        expect(length, '[not] to be', 0);
    });

    expect.addAssertion('to be non-empty', function (expect, subject) {
        expect(subject, 'not to be empty');
    });

    expect.addAssertion(['to [not] [only] have (key|keys)', '[not] to have (key|keys)'], function (expect, subject, keys) {
        keys = isArray(keys) ?
            keys :
            Array.prototype.slice.call(arguments, 2);

        var hasKeys = subject && every(keys, function (key) {
            return subject.hasOwnProperty(key);
        });
        if (this.flags.only) {
            expect(hasKeys, 'to be truthy');
            expect(getKeys(subject).length === keys.length, '[not] to be truthy');
        } else {
            expect(hasKeys, '[not] to be truthy');
        }
    });

    expect.addAssertion('[not] to contain', function (expect, subject, arg) {
        var args = Array.prototype.slice.call(arguments, 2);
        var that = this;

        if ('string' === typeof subject) {
            forEach(args, function (arg) {
                expect(subject.indexOf(arg) !== -1, '[not] to be truthy');
            });
        } else if (isArray(subject)) {
            forEach(args, function (arg) {
                expect(subject && indexOf(subject, arg) !== -1, '[not] to be truthy');
            });
        } else if (subject === null) {
            expect(that.flags.not, '[not] to be falsy');
        } else {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports strings and arrays");
        }
    });

    expect.addAssertion('[not] to be finite', function (expect, subject) {
        expect(typeof subject === 'number' && isFinite(subject), '[not] to be truthy');
    });

    expect.addAssertion('[not] to be infinite', function (expect, subject) {
        expect(typeof subject === 'number' && !isNaN(subject) && !isFinite(subject), '[not] to be truthy');
    });

    expect.addAssertion('[not] to be within', function (expect, subject, start, finish) {
        this.args = [start + '..' + finish];
        expect(subject, 'to be a number');
        expect(subject >= start && subject <= finish, '[not] to be true');
    });

    expect.addAssertion(['<', '[not] to be (<|less than|below)'], function (expect, subject, value) {
        expect(subject < value, '[not] to be true');
    });

    expect.addAssertion(['<=', '[not] to be (<=|less than or equal to)'], function (expect, subject, value) {
        expect(subject <= value, '[not] to be true');
    });

    expect.addAssertion(['>', '[not] to be (>|greater than|above)'], function (expect, subject, value) {
        expect(subject > value, '[not] to be true');
    });

    expect.addAssertion(['>=', '[not] to be (>=|greater than or equal to)'], function (expect, subject, value) {
        expect(subject >= value, '[not] to be true');
    });

    expect.addAssertion('[not] to be positive', function (expect, subject) {
        expect(subject, '[not] to be >', 0);
    });

    expect.addAssertion('[not] to be negative', function (expect, subject) {
        expect(subject, '[not] to be <', 0);
    });

    expect.addAssertion('[not] to equal', function (expect, subject, value) {
        try {
            expect(expect.equal(value, subject), '[not] to be true');
        } catch (e) {
            if (!this.flags.not) {
                var newError = cloneError(e);
                newError.actual = subject;
                newError.expected = value;
                expect.fail(newError);
            }
            expect.fail(e);
        }
    });

    expect.addAssertion('[not] to (throw|throw error|throw exception)', function (expect, subject, arg) {
        this.errorMode = 'nested';
        if (typeof subject !== 'function') {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports functions");
        }

        var thrown = false;
        var argType = typeof arg;

        try {
            subject();
        } catch (e) {
            var subject;
            if (e._isUnexpected) {
                subject = e.output.toString();
            } else if (typeof e === 'string') {
                subject = e;
            } else {
                subject = e.message;
            }

            if ('function' === argType) {
                arg(e);
            } else if ('string' === argType) {
                expect(subject, '[not] to equal', arg);
            } else if (isRegExp(arg)) {
                expect(subject, '[not] to match', arg);
            } else if (this.flags.not) {
                expect.fail('threw: {0}', e._isUnexpected ? e.output : subject);
            }
            thrown = true;
        }

        this.errorMode = 'default';
        if ('string' === argType || isRegExp(arg)) {
            // in the presence of a matcher, ensure the `not` only applies to
            // the matching.
            expect(thrown, 'to be true');
        } else {
            expect(thrown, '[not] to be true');
        }
    });

    expect.addAssertion('to be (a|an) [non-empty] (map|hash|object) whose values satisfy', function (expect, subject) {
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an object');
        if (this.flags['non-empty']) {
            expect(subject, 'to be non-empty');
        }
        this.errorMode = 'bubble';

        var errors = {};
        forEach(getKeys(subject), function (key, index) {
            try {
                if (typeof extraArgs[0] === 'function') {
                    extraArgs[0](subject[key], index);
                } else {
                    expect.apply(expect, [subject[key], 'to satisfy assertion'].concat(extraArgs));
                }
            } catch (e) {
                errors[key] = e;
            }
        });

        var errorKeys = getKeys(errors);
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

                forEach(errorKeys, function (key, index) {
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

    expect.addAssertion('to be (a|an) [non-empty] array whose items satisfy', function (expect, subject) { // ...
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an array');
        if (this.flags['non-empty']) {
            expect(subject, 'to be non-empty');
        }
        this.errorMode = 'bubble';
        expect.apply(expect, [subject, 'to be a map whose values satisfy'].concat(extraArgs));
    });

    forEach(['string', 'number', 'boolean', 'array', 'object', 'function', 'regexp', 'regex', 'regular expression'], function (type) {
        expect.addAssertion('to be (a|an) [non-empty] array of ' + type + 's', function (expect, subject) {
            expect(subject, 'to be an array whose items satisfy', function (item) {
                expect(item, 'to be a', type);
            });
            if (this.flags['non-empty']) {
                expect(subject, 'to be non-empty');
            }
        });
    });

    expect.addAssertion('to be (a|an) [non-empty] (map|hash|object) whose keys satisfy', function (expect, subject) {
        var extraArgs = Array.prototype.slice.call(arguments, 2);
        if (extraArgs.length === 0) {
            throw new Error('Assertion "' + this.testDescription + '" expects a third argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an object');
        if (this.flags['non-empty']) {
            expect(subject, 'to be non-empty');
        }
        this.errorMode = 'bubble';

        var errors = {};
        forEach(getKeys(subject), function (key, index) {
            try {
                expect.apply(expect, [key, 'to satisfy assertion'].concat(extraArgs));
            } catch (e) {
                errors[key] = e;
            }
        });

        var errorKeys = getKeys(errors);
        if (errorKeys.length > 0) {
            expect.fail(function (output) {
                output.error('failed expectation on keys ')
                      .text(getKeys(subject).join(', '))
                      .error(':').nl()
                      .indentLines();

                forEach(errorKeys, function (key, index) {
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

    expect.addAssertion('to be canonical', function (expect, subject, stack) {
        stack = stack || [];

        var i;
        for (i = 0 ; i < stack.length ; i += 1) {
            if (stack[i] === subject) {
                return;
            }
        }
        if (subject && typeof subject === 'object') {
            var keys = getKeys(subject);
            for (i = 0 ; i < keys.length - 1 ; i += 1) {
                expect(keys[i], 'to be less than', keys[i + 1]);
            }
            stack.push(subject);
            forEach(keys, function (key) {
                expect(subject[key], 'to be canonical', stack);
            });
            stack.pop(subject);
        }
    });

    expect.addAssertion('[not] to [exhaustively] satisfy [assertion]', function (expect, subject, value) {
        if (this.flags.not) {
            expect(function (expect, subject, value) {
                expect(subject, 'to [exhaustively] satisfy [assertion]', value);
            }, 'to throw');
        } else if (this.flags.assertion && typeof value === 'string') {
            this.errorMode = 'bubble'; // to satisfy assertion 'to be a number' => to be a number
            expect.apply(expect, Array.prototype.slice.call(arguments, 1));
        } else if (typeof value === 'function') {
            // FIXME: If expect.fn, it should be possible to produce a better error message
            value(subject);
        } else if (isRegExp(value)) {
            expect(subject, 'to match', value);
        } else {
            var type = utils.findFirst(expect.types || [], function (type) {
                return type.identify(subject);
            });
            if (type.name === 'object' || type.name === 'array') {
                expect(subject, 'to be an object');
                forEach(getKeys(value), function (key) {
                    expect(subject[key], 'to [exhaustively] satisfy', value[key]);
                });
                if (this.flags.exhaustively) {
                    expect(subject, 'to only have keys', getKeys(value));
                }
            } else {
                expect(subject, 'to equal', value);
            }
        }
    });
};
