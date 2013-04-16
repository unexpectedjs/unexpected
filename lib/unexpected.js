// Copyright 2013 Sune Simonsen
// https://github.com/sunesimonsen/factory.js
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var root = this;

(function () {
    function Assertion(subject, testDescription, flags, args) {
        this.obj = subject;
        this.testDescription = testDescription;
        this.flags = flags;
        this.args = args;
    }

    Assertion.prototype.throwStandardError = function () {
        var that = this;
        var argsString = this.args.map(function (arg) {
            return that.inspect(arg);
        }).join(', ');
        if (argsString.length > 0) {
            argsString = ' ' + argsString;
        }

        throw new Error('expected ' +
                        this.inspect(this.obj) +
                        ' ' + this.testDescription +
                        argsString);
    };


    Assertion.prototype.assert = function (condition) {
        var that = this;
        var not = !!this.flags.not;
        condition = !!condition;
        if (condition === not) {
            this.throwStandardError();
        }
    };


    function AssertionRule(pattern, handler) {
        var regExpString = pattern
            .replace(/\(/g, '(:?')
            .replace(/\[([^\]]+)\] /g, function (match, flag) {
            return '(?:(' + flag + ') )?';
        });
        this.regexp = new RegExp('^' + regExpString + '$');
        this.handler = handler;
    }

    AssertionRule.prototype.test = function (text) {
        return this.regexp.test(text);
    };

    AssertionRule.prototype.getFlags = function (text) {
        var match = this.regexp.exec(text);
        var flags = {};
        for (var i = 1; i < match.length; i += 1) {
            var flag = match[i]; 
            if (flag !== undefined) {
                flags[flag] = true;
            }
        }
        return flags;
    };

    var assertions = [];
    function expect(subject, testDescriptionString) {
        var matching = assertions.filter(function (assertionRule) {
            return assertionRule.test(testDescriptionString);
        });

        if (matching.length > 0) {
            var assertionRule = matching[0];
            var flags = assertionRule.getFlags(testDescriptionString);
            var args = Array.prototype.slice.call(arguments, 2);
            var assertion = new Assertion(subject, testDescriptionString, flags, args);
            var handler = assertionRule.handler;
            handler.apply(assertion, args);
        } else {
            throw new Error('Unknown assertion "' + testDescriptionString + '"');
        }
    }

    expect.format = function (message, args) {
        args = args.map(function (arg) {
            return inspect(arg);
        });
        message = message.replace(/\{(\d+)\}/g, function (match, n) {
            return args[n] || match;
        });
        return message;
    };

    expect.fail = function (message) {
        message = message || "explicit failure";
        var args = Array.prototype.slice.call(arguments, 1);
        throw new Error(expect.format(message, args));
    };

    expect.assertions = assertions;

    expect.addAssertion = function (pattern, handler) {
        assertions.push(new AssertionRule(pattern, handler));
    };

    expect.addAssertion('to [not] be', function (value) {
        this.assert(this.obj === value);
    });

    expect.addAssertion('to [not] be (ok|truthy)', function () {
        this.assert(this.obj);
    });

    expect.addAssertion('to [not] be falsy', function () {
        this.assert(!this.obj);
    });

    expect.addAssertion('to [not] be (a|an)', function (type) {
        var subject = this.obj;
        if ('string' === typeof type) {
            // typeof with support for 'array'
            this.assert(
                'array' === type ? isArray(subject) :
                    'object' === type ?
                    'object' === typeof subject && null !== subject :
                    type === typeof subject);
        } else {
            this.assert(subject instanceof type);
        }

        return this;
    });

    expect.addAssertion('to [not] match', function (regexp) {
        this.assert(regexp.exec(this.obj));
    });

    expect.addAssertion('to [not] have [own] property', function (key, value) {
        if (undefined === this.obj) {
            this.throwStandardError();
        }

        if (this.flags.own) {
            this.assert(Object.prototype.hasOwnProperty.call(this.obj, name));
        }

        this.assert(this.obj[key] !== undefined);
        if (arguments.length === 2) {
            this.assert(this.obj[key] === value);
        }
    });
    
    expect.addAssertion('to [not] have length', function (length) {
        if (!this.obj || typeof this.obj.length !== 'number') {
            this.throwStandardError();
        }
        this.assert(length === this.obj.length);
    });

    expect.addAssertion('to [not] be empty', function () {
        var type = typeof this.obj;
        if ('number' === typeof this.obj.length) {
            this.assert(!this.obj.length);
        } else if (typeof this.obj === 'object' || isArray(this.obj)) {
            this.assert(!Object.keys(this.obj).length);
        } else {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports strings, arrays and objects");
        }
    });

    expect.addAssertion('to [not] [only] have (key|keys)', function (keys) {
        var obj = this.obj;

        keys = isArray(keys) ?
            keys :
            Array.prototype.slice.call(arguments);

        var hasKeys = obj && keys.every(function (key) {
            return obj.hasOwnProperty(key); 
        });
        if (this.flags.only) {
            this.assert(hasKeys && Object.keys(obj).length === keys.length);
        } else {
            this.assert(hasKeys);
        }
    });

    expect.addAssertion('to [not] contain', function (arg) {
        if ('string' === typeof this.obj) {
            this.assert(this.obj.indexOf(arg) !== -1);
        } else {
            this.assert(this.obj && this.obj.indexOf(arg) !== -1);
        }
    });

    expect.addAssertion('to [not] be within', function (start, finish) {
        this.args = [start + '..' + finish];
        if (typeof this.obj !== 'number') {
            this.throwStandardError();
        }
        this.assert(this.obj >= start && this.obj <= finish);
    });

    expect.addAssertion('(<|to be (<|less than|below))', function (value) {
        this.assert(this.obj < value);
    });

    expect.addAssertion('(<=|to be (<=|less than or equals to))', function (value) {
        this.assert(this.obj <= value);
    });

    expect.addAssertion('(>|to be (>|greater than|above))', function (value) {
        this.assert(this.obj > value);
    });

    expect.addAssertion('(>=|to be (>=|greater than or equals to))', function (value) {
        this.assert(this.obj >= value);
    });

    expect.addAssertion('to be positive', function () {
        this.assert(this.obj > 0);
    });

    expect.addAssertion('to be negative', function () {
        this.assert(this.obj < 0);
    });

    expect.addAssertion('to [not] equal', function (value) {
        this.assert(expect.eql(value, this.obj));
    });

    expect.addAssertion('to [not] throw (error|exception)', function (fn) {
        if (typeof this.obj !== 'function') {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports functions");
        }

        var thrown = false;
        var not = this.flags.not;

        try {
            this.obj();
        } catch (e) {
            var subject = 'string' === typeof e ? e : e.message;
            if ('function' === typeof fn) {
                fn(e);
            } else if ('object' === typeof fn) {
                if (not) {
                    expect(subject, 'to not match', fn);
                } else {
                    expect(subject, 'to match', fn);
                }
            } else if ('string' === typeof fn) {
                if (not) {
                    expect(subject, 'to not be', fn);
                } else {
                    expect(subject, 'to be', fn);
                }
            }
            thrown = true;
        }

        if ('function' !== typeof fn && not) {
            // in the presence of a matcher, ensure the `not` only applies to
            // the matching.
            this.flags.not = false;
        }

        this.assert(thrown);
    });

    function isUndefinedOrNull (value) {
        return value === null || value === undefined;
    }

    function isArguments (object) {
        return Object.prototype.toString.call(object) == '[object Arguments]';
    }

    function objEquiv (a, b) {
        if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
            return false;
        // an identical "prototype" property.
        if (a.prototype !== b.prototype) return false;
        //~~~I've managed to break Object.keys through screwy arguments passing.
        //   Converting to array solves the problem.
        if (isArguments(a)) {
            if (!isArguments(b)) {
                return false;
            }
            a = pSlice.call(a);
            b = pSlice.call(b);
            return expect.eql(a, b);
        }
        try{
            var ka = Object.keys(a),
            kb = Object.keys(b),
            key, i;
        } catch (e) {//happens when one is a string literal and the other isn't
            return false;
        }
        // having the same number of owned properties (keys incorporates hasOwnProperty)
        if (ka.length != kb.length)
            return false;
        //the same set of keys (although not necessarily the same order),
        ka.sort();
        kb.sort();
        //~~~cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i])
                return false;
        }
        //equivalent values for every corresponding key, and
        //~~~possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!expect.eql(a[key], b[key]))
                return false;
        }
        return true;
    }

    function isRegExp(re) {
        var s;
        try {
            s = '' + re;
        } catch (e) {
            return false;
        }

        return re instanceof RegExp || // easy case
        // duck-type for context-switching evalcx case
        typeof(re) === 'function' &&
            re.constructor.name === 'RegExp' &&
            re.compile &&
            re.test &&
            re.exec &&
            s.match(/^\/.*\/[gim]{0,3}$/);
    }

    function isDate(d) {
        if (d instanceof Date) return true;
        return false;
    }

    // Returns true if object is a DOM element.
    var isDOMElement = function (object) {
        if (typeof HTMLElement === 'object') {
            return object instanceof HTMLElement;
        } else {
            return object &&
                typeof object === 'object' &&
                object.nodeType === 1 &&
                typeof object.nodeName === 'string';
        }
    };
    
    /**
     * Inspects an object.
     *
     * @see taken from node.js `util` module (copyright Joyent, MIT license)
     * @api private
     */
    var inspect = function (obj, showHidden, depth) {
        var seen = [];

        function stylize (str) {
            return str;
        }

        function format (value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (value && typeof value.inspect === 'function' &&
                // Filter out the util module, it's inspect function is special
                value !== exports &&
                // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
                return value.inspect(recurseTimes);
            }

            // Primitive types cannot have properties
            switch (typeof value) {
            case 'undefined':
                return stylize('undefined', 'undefined');

            case 'string':
                var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') + '\'';
                return stylize(simple, 'string');

            case 'number':
                return stylize('' + value, 'number');

            case 'boolean':
                return stylize('' + value, 'boolean');
            }
            // For some reason typeof null is "object", so special case here.
            if (value === null) {
                return stylize('null', 'null');
            }

            if (isDOMElement(value)) {
                return getOuterHTML(value);
            }

            if (isRegExp(value)) {
                return stylize('' + value, 'regexp');
            }

            // Look up the keys of the object.
            var visible_keys = Object.keys(value);
            var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;

            // Functions without properties can be shortcutted.
            if (typeof value === 'function' && $keys.length === 0) {
                if (isRegExp(value)) {
                    return stylize('' + value, 'regexp');
                } else {
                    var name = value.name ? ': ' + value.name : '';
                    return stylize('[Function' + name + ']', 'special');
                }
            }

            // Dates without properties can be shortcutted
            if (isDate(value) && $keys.length === 0) {
                return stylize(value.toUTCString(), 'date');
            }

            var base, type, braces;
            // Determine the object type
            if (isArray(value)) {
                type = 'Array';
                braces = ['[', ']'];
            } else {
                type = 'Object';
                braces = ['{', '}'];
            }

            // Make functions say that they are functions
            if (typeof value === 'function') {
                var n = value.name ? ': ' + value.name : '';
                base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
            } else {
                base = '';
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
                base = ' ' + value.toUTCString();
            }

            if ($keys.length === 0) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return stylize('' + value, 'regexp');
                } else {
                    return stylize('[Object]', 'special');
                }
            }

            seen.push(value);

            var output = $keys.map(function (key) {
                var name, str;
                if (value.__lookupGetter__) {
                    if (value.__lookupGetter__(key)) {
                        if (value.__lookupSetter__(key)) {
                            str = stylize('[Getter/Setter]', 'special');
                        } else {
                            str = stylize('[Getter]', 'special');
                        }
                    } else {
                        if (value.__lookupSetter__(key)) {
                            str = stylize('[Setter]', 'special');
                        }
                    }
                }
                if (visible_keys.indexOf(key) < 0) {
                    name = '[' + key + ']';
                }
                if (!str) {
                    if (seen.indexOf(value[key]) < 0) {
                        if (recurseTimes === null) {
                            str = format(value[key]);
                        } else {
                            str = format(value[key], recurseTimes - 1);
                        }
                        if (str.indexOf('\n') > -1) {
                            if (isArray(value)) {
                                str = str.split('\n').map(function (line) {
                                    return '  ' + line;
                                }).join('\n').substr(2);
                            } else {
                                str = '\n' + str.split('\n').map(function (line) {
                                    return '   ' + line;
                                }).join('\n');
                            }
                        }
                    } else {
                        str = stylize('[Circular]', 'special');
                    }
                }
                if (typeof name === 'undefined') {
                    if (type === 'Array' && key.match(/^\d+$/)) {
                        return str;
                    }
                    name = JSON.stringify('' + key);
                    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                        name = name.substr(1, name.length - 2);
                        name = stylize(name, 'name');
                    } else {
                        name = name.replace(/'/g, "\\'")
                            .replace(/\\"/g, '"')
                            .replace(/(^"|"$)/g, "'");
                        name = stylize(name, 'string');
                    }
                }

                return name + ': ' + str;
            });

            seen.pop();

            var numLinesEst = 0;
            var length = output.reduce(function (prev, cur) {
                numLinesEst++;
                if (cur.indexOf('\n') >= 0) numLinesEst++;
                return prev + cur.length + 1;
            }, 0);

            if (length > 50) {
                output = braces[0] +
                    (base === '' ? '' : base + '\n ') +
                    ' ' +
                    output.join(',\n  ') +
                    ' ' +
                    braces[1];

            } else {
                output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }

            return output;
        }
        return format(obj, (typeof depth === 'undefined' ? 2 : depth));
    };
    Assertion.prototype.inspect = inspect;
    expect.inspect = inspect;

    /**
     * Asserts deep equality
     *
     * @see taken from node.js `assert` module (copyright Joyent, MIT license)
     * @api private
     */
    expect.eql = function eql (actual, expected) {
        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
            return true;
        } else if ('undefined' != typeof Buffer &&
                   Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
            if (actual.length != expected.length) return false;

            for (var i = 0; i < actual.length; i++) {
                if (actual[i] !== expected[i]) return false;
            }

            return true;

            // 7.2. If the expected value is a Date object, the actual value is
            // equivalent if it is also a Date object that refers to the same time.
        } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime();

            // 7.3. Other pairs that do not both pass typeof value == "object",
            // equivalence is determined by ==.
        } else if (typeof actual != 'object' && typeof expected != 'object') {
            return actual == expected;

            // 7.4. For all other Object pairs, including Array objects, equivalence is
            // determined by having the same number of owned properties (as verified
            // with Object.prototype.hasOwnProperty.call), the same set of keys
            // (although not necessarily the same order), equivalent values for every
            // corresponding key, and an identical "prototype" property. Note: this
            // accounts for both named and indexed properties on Arrays.
        } else {
            return objEquiv(actual, expected);
        }
    };

    function isArray (ar) {
        return Object.prototype.toString.call(ar) == '[object Array]';
    }

    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS/Node.js
        module.exports = expect;
        exports.expect = expect;
    } else if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(function () {
            return expect;
        });
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        root.weknowhow = {
            expect: expect
        };
    }
}());
