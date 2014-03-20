/*global namespace*/
(function () {
    var expect = namespace.expect;

    var shim = namespace.shim;
    var forEach = shim.forEach;
    var getKeys = shim.getKeys;
    var every = shim.every;
    var indexOf = shim.indexOf;

    var utils = namespace.utils;
    var isRegExp = utils.isRegExp;
    var isArray = utils.isArray;

    expect.addAssertion('[not] to be', function (expect, subject, value) {
        this.assert(subject === value);
    });

    expect.addAssertion('[not] to be true', function (expect, subject) {
        expect(subject, '[not] to be', true);
    });

    expect.addAssertion('[not] to be (ok|truthy)', function (expect, subject) {
        this.assert(subject);
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

    expect.addAssertion('[not] to be NaN', function (expect, subject) {
        expect(isNaN(subject), '[not] to be true');
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
            forEach(getKeys(properties), function (property) {
                if (this.flags.not) {
                    expect(subject, 'not to have [own] property', property);
                } else {
                    expect(subject, 'to have [own] property', property, properties[property]);
                }
            }, this);
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

    expect.addAssertion('to [not] [only] have (key|keys)', '[not] to have (key|keys)', function (expect, subject, keys) {
        keys = isArray(keys) ?
            keys :
            Array.prototype.slice.call(arguments, 2);

        var hasKeys = subject && every(keys, function (key) {
            return subject.hasOwnProperty(key);
        });
        if (this.flags.only) {
            this.assert(hasKeys && getKeys(subject).length === keys.length);
        } else {
            this.assert(hasKeys);
        }
    });

    expect.addAssertion('[not] to contain', function (expect, subject, arg) {
        var args = Array.prototype.slice.call(arguments, 2);
        var that = this;

        if ('string' === typeof subject) {
            forEach(args, function (arg) {
                that.assert(subject.indexOf(arg) !== -1);
            });
        } else if (isArray(subject)) {
            forEach(args, function (arg) {
                that.assert(subject && indexOf(subject, arg) !== -1);
            });
        } else if (subject === null) {
            that.assert(!that.flags.not);
        } else {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports strings and arrays");
        }
    });

    expect.addAssertion('[not] to be finite', function (expect, subject) {
        this.assert(typeof subject === 'number' && isFinite(subject));
    });

    expect.addAssertion('[not] to be infinite', function (expect, subject) {
        this.assert(typeof subject === 'number' && !isNaN(subject) && !isFinite(subject));
    });

    expect.addAssertion('[not] to be within', function (expect, subject, start, finish) {
        this.args = [start + '..' + finish];
        if (typeof subject !== 'number') {
            this.throwStandardError();
        }
        this.assert(subject >= start && subject <= finish);
    });

    expect.addAssertion('<', 'to be (<|less than|below)', function (expect, subject, value) {
        this.assert(subject < value);
    });

    expect.addAssertion('<=', 'to be (<=|less than or equal to)', function (expect, subject, value) {
        this.assert(subject <= value);
    });

    expect.addAssertion('>', 'to be (>|greater than|above)', function (expect, subject, value) {
        this.assert(subject > value);
    });

    expect.addAssertion('>=', 'to be (>=|greater than or equal to)', function (expect, subject, value) {
        this.assert(subject >= value);
    });

    expect.addAssertion('to be positive', function (expect, subject) {
        this.assert(subject > 0);
    });

    expect.addAssertion('to be negative', function (expect, subject) {
        this.assert(subject < 0);
    });

    expect.addAssertion('[not] to equal', function (expect, subject, value) {
        try {
            this.assert(this.equal(value,
                                   subject));
        } catch (e) {
            if (!this.flags.not) {
                e.expected = value;
                e.actual = subject;
                // Explicitly tell mocha to stringify and diff arrays and objects, but only when the types are identical and non-primitive:
                if (e.actual && e.expected && typeof e.actual === 'object' && typeof e.expected === 'object' && isArray(e.actual) === isArray(e.expected)) {
                    e.showDiff = true;
                }
            }
            throw e;
        }
    });

    expect.addAssertion('[not] to (throw|throw error|throw exception)', function (expect, subject, arg) {
        this.errorMode = 'bubble';
        if (typeof subject !== 'function') {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports functions");
        }

        var thrown = false;
        var not = this.flags.not;
        var argType = typeof arg;

        try {
            subject();
        } catch (e) {
            var subject = 'string' === typeof e ? e : e.message;
            if ('function' === argType) {
                arg(e);
            } else if ('string' === argType) {
                if (not) {
                    expect(subject, 'not to be', arg);
                } else {
                    expect(subject, 'to be', arg);
                }
            } else if (isRegExp(arg)) {
                if (not) {
                    expect(subject, 'not to match', arg);
                } else {
                    expect(subject, 'to match', arg);
                }
            }
            thrown = true;
        }

        if (('string' === argType || isRegExp(arg)) && not) {
            // in the presence of a matcher, ensure the `not` only applies to
            // the matching.
            this.flags.not = false;
        }

        this.assert(thrown);
    });

    expect.addAssertion('to be (a|an) [non-empty] (map|hash|object) whose values satisfy', function (expect, subject, callbackOrString) {
        var callback;
        if ('function' === typeof callbackOrString) {
            callback = callbackOrString;
        } else if ('string' === typeof callbackOrString) {
            var args = Array.prototype.slice.call(arguments, 2);
            callback = function (value) {
                expect.apply(expect, [value].concat(args));
            };
        } else {
            throw new Error('Assertions "' + this.testDescription + '" expects a functions as argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an object');
        if (this.flags['non-empty']) {
            expect(subject, 'to be non-empty');
        }
        this.errorMode = 'default';

        var errors = [];
        forEach(getKeys(subject), function (key, index) {
            try {
                callback(subject[key], index);
            } catch (e) {
                errors.push('    ' + key + ': ' + e.message.replace(/\n/g, '\n    '));
            }
        });

        if (errors.length > 0) {
            var objectString = this.inspect(subject);
            var prefix = /\n/.test(objectString) ? '\n' : ' ';
            var message = 'failed expectation in' + prefix + objectString + ':\n' +
                errors.join('\n');
            throw new Error(message);
        }
    });

    expect.addAssertion('to be (a|an) [non-empty] array whose items satisfy', function (expect, subject, callbackOrString) {
        var callback;
        if ('function' === typeof callbackOrString) {
            callback = callbackOrString;
        } else if ('string' === typeof callbackOrString) {
            var args = Array.prototype.slice.call(arguments, 2);
            callback = function (item) {
                expect.apply(expect, [item].concat(args));
            };
        } else {
            throw new Error('Assertions "' + this.testDescription + '" expects a functions as argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an array');
        if (this.flags['non-empty']) {
            expect(subject, 'to be non-empty');
        }
        this.errorMode = 'bubble';
        expect(subject, 'to be a map whose values satisfy', callback);
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

    expect.addAssertion('to be (a|an) [non-empty] (map|hash|object) whose keys satisfy', function (expect, subject, callbackOrString) {
        var callback;
        if ('function' === typeof callbackOrString) {
            this.errorMode = 'nested';
            callback = callbackOrString;
        } else if ('string' === typeof callbackOrString) {
            var args = Array.prototype.slice.call(arguments, 2);
            callback = function (key) {
                expect.apply(expect, [key].concat(args));
            };
        } else {
            throw new Error('Assertions "' + this.testDescription + '" expects a functions as argument');
        }
        this.errorMode = 'nested';
        expect(subject, 'to be an object');
        if (this.flags['non-empty']) {
            expect(subject, 'to be non-empty');
        }
        this.errorMode = 'default';

        var errors = [];
        var keys = getKeys(subject);
        forEach(keys, function (key) {
            try {
                callback(key);
            } catch (e) {
                errors.push('    ' + key + ': ' + e.message.replace(/\n/g, '\n    '));
            }
        });

        if (errors.length > 0) {
            var message = 'failed expectation on keys ' + keys.join(', ') + ':\n' +
                errors.join('\n');
            throw new Error(message);
        }
    });
}());
