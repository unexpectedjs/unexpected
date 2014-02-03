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

    expect.addAssertion('[not] to be', function (value) {
        this.assert(this.obj === value);
    });

    expect.addAssertion('[not] to be true', function () {
        this.assert(this.obj === true);
    });

    expect.addAssertion('[not] to be (ok|truthy)', function () {
        this.assert(this.obj);
    });

    expect.addAssertion('[not] to be false', function () {
        this.assert(this.obj === false);
    });

    expect.addAssertion('[not] to be falsy', function () {
        this.assert(!this.obj);
    });

    expect.addAssertion('[not] to be null', function () {
        this.assert(this.obj === null);
    });

    expect.addAssertion('[not] to be undefined', function () {
        this.assert(typeof this.obj === 'undefined');
    });

    expect.addAssertion('[not] to be NaN', function () {
        this.assert(isNaN(this.obj));
    });

    expect.addAssertion('[not] to be (a|an)', function (type) {
        var subject = this.obj;
        if ('string' === typeof type) {
            // typeof with support for 'array'
            this.assert(
                'array' === type ? isArray(subject) :
                    'object' === type ? 'object' === typeof subject && null !== subject :
                        /^reg(?:exp?|ular expression)$/.test(type) ? isRegExp(subject) :
                            type === typeof subject);
        } else {
            this.assert(subject instanceof type);
        }

        return this;
    });

    // Alias for common '[not] to be (a|an)' assertions
    expect.addAssertion('[not] to be (a|an) (boolean|number|string|function|object|array|regexp|regex|regular expression)', function () {
        var matches = /(.* be (?:a|an)) ([\w\s]+)/.exec(this.testDescription);
        expect(this.obj, matches[1], matches[2]);
    });

    forEach(['string', 'array', 'object'], function (type) {
        expect.addAssertion('to be (the|an) empty ' + type, function () {
            expect(this.obj, 'to be a', type);
            expect(this.obj, 'to be empty');
        });

        expect.addAssertion('to be a non-empty ' + type, function () {
            expect(this.obj, 'to be a', type);
            expect(this.obj, 'not to be empty');
        });
    });

    expect.addAssertion('[not] to match', function (regexp) {
        this.assert(regexp.exec(this.obj));
    });

    expect.addAssertion('[not] to have [own] property', function (key, value) {
        if (this.flags.own) {
            this.assert(this.obj && this.obj.hasOwnProperty(key));
        } else {
            this.assert(this.obj && this.obj[key] !== undefined);
        }

        if (arguments.length === 2) {
            this.flags.not = false;
            this.assert(this.obj && this.obj[key] === value);
        }
    });

    expect.addAssertion('[not] to have [own] properties', function (properties) {
        if (properties && isArray(properties)) {
            forEach(properties, function (property) {
                if (this.flags.own) {
                    this.assert(this.obj && this.obj.hasOwnProperty(property));
                } else {
                    this.assert(this.obj && this.obj[property] !== undefined);
                }
            }, this);
        } else if (properties && typeof properties === 'object') {
            forEach(getKeys(properties), function (property) {
                if (this.flags.own) {
                    this.assert(this.obj &&
                                this.obj.hasOwnProperty(property) &&
                                this.equal(this.obj[property], properties[property]));
                } else {
                    this.assert(this.obj && this.equal(this.obj[property], properties[property]));
                }
            }, this);
        } else {
            throw new Error("Assertion '" + this.testDescription + "' only supports " +
                            "input in the form of an Array or an Object.");
        }
    });

    expect.addAssertion('[not] to have length', function (length) {
        if (!this.obj || typeof this.obj.length !== 'number') {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports array like objects");
        }
        this.assert(length === this.obj.length);
    });

    expect.addAssertion('[not] to be empty', function () {
        if (this.obj && 'number' === typeof this.obj.length) {
            this.assert(!this.obj.length);
        } else if (isArray(this.obj) || typeof this.obj === 'string') {
            this.assert(this.obj.length === 0);
        } else if (this.obj && typeof this.obj === 'object') {
            this.assert(!getKeys(this.obj).length);
        } else {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports strings, arrays and objects");
        }
    });

    expect.addAssertion('to be non-empty', function () {
        expect(this.obj, 'not to be empty');
    });

    expect.addAssertion('to [not] [only] have (key|keys)', '[not] to have (key|keys)', function (keys) {
        var obj = this.obj;

        keys = isArray(keys) ?
            keys :
            Array.prototype.slice.call(arguments);

        var hasKeys = obj && every(keys, function (key) {
            return obj.hasOwnProperty(key);
        });
        if (this.flags.only) {
            this.assert(hasKeys && getKeys(obj).length === keys.length);
        } else {
            this.assert(hasKeys);
        }
    });

    expect.addAssertion('[not] to contain', function (arg) {
        var args = Array.prototype.slice.call(arguments);
        var that = this;

        if ('string' === typeof that.obj) {
            forEach(args, function (arg) {
                that.assert(that.obj.indexOf(arg) !== -1);
            });
        } else if (isArray(that.obj)) {
            forEach(args, function (arg) {
                that.assert(that.obj && indexOf(that.obj, arg) !== -1);
            });
        } else if (that.obj === null) {
            that.assert(!that.flags.not);
        } else {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports strings and arrays");
        }
    });

    expect.addAssertion('[not] to be finite', function () {
        this.assert(typeof this.obj === 'number' && isFinite(this.obj));
    });

    expect.addAssertion('[not] to be infinite', function () {
        this.assert(typeof this.obj === 'number' && !isNaN(this.obj) && !isFinite(this.obj));
    });

    expect.addAssertion('[not] to be within', function (start, finish) {
        this.args = [start + '..' + finish];
        if (typeof this.obj !== 'number') {
            this.throwStandardError();
        }
        this.assert(this.obj >= start && this.obj <= finish);
    });

    expect.addAssertion('<', 'to be (<|less than|below)', function (value) {
        this.assert(this.obj < value);
    });

    expect.addAssertion('<=', 'to be (<=|less than or equal to)', function (value) {
        this.assert(this.obj <= value);
    });

    expect.addAssertion('>', 'to be (>|greater than|above)', function (value) {
        this.assert(this.obj > value);
    });

    expect.addAssertion('>=', 'to be (>=|greater than or equal to)', function (value) {
        this.assert(this.obj >= value);
    });

    expect.addAssertion('to be positive', function () {
        this.assert(this.obj > 0);
    });

    expect.addAssertion('to be negative', function () {
        this.assert(this.obj < 0);
    });

    expect.addAssertion('[not] to equal', function (value) {
        try {
            this.assert(this.equal(value,
                                   this.obj));
        } catch (e) {
            if (!this.flags.not) {
                e.expected = value;
                e.actual = this.obj;
                // Explicitly tell mocha to stringify and diff arrays and objects, but only when the types are identical and non-primitive:
                if (e.actual && e.expected && typeof e.actual === 'object' && typeof e.expected === 'object' && isArray(e.actual) === isArray(e.expected)) {
                    e.showDiff = true;
                }
            }
            throw e;
        }
    });

    expect.addAssertion('[not] to (throw|throw error|throw exception)', function (arg) {
        this.errorMode = 'bubble';
        if (typeof this.obj !== 'function') {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports functions");
        }

        var thrown = false;
        var not = this.flags.not;
        var argType = typeof arg;

        try {
            this.obj();
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

    expect.addAssertion('to be (a|an) [non-empty] (map|hash|object) whose values satisfy', function (callbackOrString) {
        var callback;
        if ('function' === typeof callbackOrString) {
            callback = callbackOrString;
        } else if ('string' === typeof callbackOrString) {
            var args = Array.prototype.slice.call(arguments);
            callback = function (value) {
                expect.apply(expect, [value].concat(args));
            };
        } else {
            throw new Error('Assertions "' + this.testDescription + '" expects a functions as argument');
        }
        this.errorMode = 'nested';
        expect(this.obj, 'to be an object');
        if (this.flags['non-empty']) {
            expect(this.obj, 'to be non-empty');
        }
        this.errorMode = 'default';

        var obj = this.obj;
        var errors = [];
        forEach(getKeys(obj), function (key, index) {
            try {
                callback(obj[key], index);
            } catch (e) {
                errors.push('    ' + key + ': ' + e.message.replace(/\n/g, '\n    '));
            }
        });

        if (errors.length > 0) {
            var objectString = this.inspect(obj);
            var prefix = /\n/.test(objectString) ? '\n' : ' ';
            var message = 'failed expectation in' + prefix + objectString + ':\n' +
                errors.join('\n');
            throw new Error(message);
        }
    });

    expect.addAssertion('to be (a|an) [non-empty] array whose items satisfy', function (callbackOrString) {
        var callback;
        if ('function' === typeof callbackOrString) {
            callback = callbackOrString;
        } else if ('string' === typeof callbackOrString) {
            var args = Array.prototype.slice.call(arguments);
            callback = function (item) {
                expect.apply(expect, [item].concat(args));
            };
        } else {
            throw new Error('Assertions "' + this.testDescription + '" expects a functions as argument');
        }
        this.errorMode = 'nested';
        expect(this.obj, 'to be an array');
        if (this.flags['non-empty']) {
            expect(this.obj, 'to be non-empty');
        }
        this.errorMode = 'bubble';
        expect(this.obj, 'to be a map whose values satisfy', callback);
    });

    forEach(['string', 'number', 'boolean', 'array', 'object', 'function', 'regexp', 'regex', 'regular expression'], function (type) {
        expect.addAssertion('to be (a|an) [non-empty] array of ' + type + 's', function () {
            expect(this.obj, 'to be an array whose items satisfy', function (item) {
                expect(item, 'to be a', type);
            });
            if (this.flags['non-empty']) {
                expect(this.obj, 'to be non-empty');
            }
        });
    });

    expect.addAssertion('to be (a|an) [non-empty] (map|hash|object) whose keys satisfy', function (callbackOrString) {
        var callback;
        if ('function' === typeof callbackOrString) {
            this.errorMode = 'nested';
            callback = callbackOrString;
        } else if ('string' === typeof callbackOrString) {
            var args = Array.prototype.slice.call(arguments);
            callback = function (key) {
                expect.apply(expect, [key].concat(args));
            };
        } else {
            throw new Error('Assertions "' + this.testDescription + '" expects a functions as argument');
        }
        this.errorMode = 'nested';
        expect(this.obj, 'to be an object');
        if (this.flags['non-empty']) {
            expect(this.obj, 'to be non-empty');
        }
        this.errorMode = 'default';

        var obj = this.obj;
        var errors = [];
        var keys = getKeys(obj);
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
