// Copyright (c) 2013 Sune Simonsen <sune@we-knowhow.dk>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the 'Software'), to deal in the Software without
// restriction, including without limitation the rights to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
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
        var argsString = map(this.args, function (arg) {
            return inspect(arg);
        }).join(', ');
        if (argsString.length > 0) {
            argsString = ' ' + argsString;
        }

        throw new Error('expected ' +
                        inspect(this.obj) +
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

    var assertions = {};
    function expect(subject, testDescriptionString) {
        var assertionRule = assertions[testDescriptionString];
        if (assertionRule) {
            var flags = reduce(assertionRule.flags, function (flags, flag) {
                flags[flag] = true;
                return flags;
            }, {});
            var args = Array.prototype.slice.call(arguments, 2);
            var assertion = new Assertion(subject, testDescriptionString, flags, args);
            var handler = assertionRule.handler;
            handler.apply(assertion, args);
        } else {
            var similarAssertions = expect.findAssertionSimilarTo(testDescriptionString);
            var message =
                'Unknown assertion "' + testDescriptionString + '", ' +
                'did you mean: "' + similarAssertions[0] + '"';
            throw new Error(message);
        }
    }

    expect.internal = {};

    // TODO refactor this method into the assertion rule
    expect.internal.expandPattern = (function () {
        function isFlag(token) {
            return token.slice(0, 1) === '[' && token.slice(-1) === ']';
        }
        function isAlternation(token) {
            return token.slice(0, 1) === '(' && token.slice(-1) === ')';
        }
        function removeEmptyStrings(texts) {
            return filter(texts, function (text) {
                return text !== '';
            });
        }
        function createPermutations(tokens, index) {
            if (index === tokens.length) {
                return [{ text: '', flags: []}];
            }

            var token = tokens[index];
            var tail = createPermutations(tokens, index + 1);
            if (isFlag(token)) {
                var flag = token.slice(1, -1);
                return map(tail, function (pattern) {
                    return {
                        text: flag + ' ' + pattern.text,
                        flags: [flag].concat(pattern.flags)
                    };
                }).concat(tail);
            } else if (isAlternation(token)) {
                var alternations = token.split(/\(|\)|\|/);
                alternations = removeEmptyStrings(alternations);
                return reduce(alternations, function (result, alternation) {
                    return result.concat(map(tail, function (pattern) {
                        return {
                            text: alternation + pattern.text,
                            flags: pattern.flags
                        };
                    }));
                }, []);
            } else {
                return map(tail, function (pattern) {
                    return {
                        text: token + pattern.text,
                        flags: pattern.flags
                    };
                });
            }
        }
        return function (pattern) {
            var result = [];
            pattern = pattern.replace(/(\[[^\]]+\]) ?/g, '$1');
            var splitRegex = /\[[^\]]+\]|\([^\)]+\)/g;
            var tokens = [];
            var m;
            var lastIndex = 0;
            while ((m = splitRegex.exec(pattern))) {
                tokens.push(pattern.slice(lastIndex, m.index));
                tokens.push(pattern.slice(m.index, splitRegex.lastIndex));
                lastIndex = splitRegex.lastIndex;
            }
            tokens.push(pattern.slice(lastIndex));

            tokens = removeEmptyStrings(tokens);
            var permutations = createPermutations(tokens, 0);
            forEach(permutations, function (permutation) {
                permutation.text = trim(permutation.text);
            });
            return permutations;
        };
    }());

    expect.format = function (message, args) {
        args = map(args, function (arg) {
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

    expect.addAssertion = function () {
        var patterns = Array.prototype.slice.call(arguments, 0, -1);
        var handler = Array.prototype.slice.call(arguments, -1)[0];
        forEach(patterns, function (pattern) {
            forEach(expect.internal.expandPattern(pattern), function (expandedPattern) {
                assertions[expandedPattern.text] = {
                    handler: handler,
                    flags: expandedPattern.flags
                };
            });
        });
    };

    /**
     * Levenshtein distance algorithm from wikipedia
     * http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
     */
    function levenshteinDistance(a, b){
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for(i = 0; i <= b.length; i++){
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for(j = 0; j <= a.length; j++){
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for(i = 1; i <= b.length; i++){
            for(j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                            Math.min(matrix[i][j-1] + 1, // insertion
                                                     matrix[i-1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }

    expect.findAssertionSimilarTo = function (text) {
        var editDistrances = [];
        forEach(getKeys(assertions), function (assertion) {
            var distance = levenshteinDistance(text, assertion);
            editDistrances.push({
                assertion: assertion,
                distance: distance
            });
        });
        editDistrances.sort(function (x, y) {
            return x.distance - y.distance;
        });
        return map(editDistrances.slice(0, 5), function (editDistrance) {
            return editDistrance.assertion;
        });
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

    // Alias for common 'to [not] be (a|an)' assertions
    expect.addAssertion('to [not] be (a|an) (boolean|number|string|function|object|array)', function () {
        var matches = /(.*) (\w+)/.exec(this.testDescription);
        expect(this.obj, matches[1], matches[2]);
    });

    expect.addAssertion('to [not] match', function (regexp) {
        this.assert(regexp.exec(this.obj));
    });

    expect.addAssertion('to [not] have [own] property', function (key, value) {
        if (this.flags.own) {
            this.assert(this.obj && hasOwnProperty(this.obj, key));
        } else {
            this.assert(this.obj && this.obj[key] !== undefined);
        }

        if (arguments.length === 2) {
            this.flags.not = false;
            this.assert(this.obj && this.obj[key] === value);
        }
    });

    expect.addAssertion('to [not] have length', function (length) {
        if (!this.obj || typeof this.obj.length !== 'number') {
            throw new Error("Assertion '" + this.testDescription +
                            "' only supports array like objects");
        }
        this.assert(length === this.obj.length);
    });

    expect.addAssertion('to [not] be empty', function () {
        var type = typeof this.obj;
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

    expect.addAssertion('to [not] [only] have (key|keys)', function (keys) {
        var obj = this.obj;

        keys = isArray(keys) ?
            keys :
            Array.prototype.slice.call(arguments);

        var hasKeys = obj && every(keys, function (key) {
            return hasOwnProperty(obj, key);
        });
        if (this.flags.only) {
            this.assert(hasKeys && getKeys(obj).length === keys.length);
        } else {
            this.assert(hasKeys);
        }
    });

    expect.addAssertion('to [not] contain', function (arg) {
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

    expect.addAssertion('to [not] be within', function (start, finish) {
        this.args = [start + '..' + finish];
        if (typeof this.obj !== 'number') {
            this.throwStandardError();
        }
        this.assert(this.obj >= start && this.obj <= finish);
    });

    expect.addAssertion('<', 'to be (<|less than|below)', function (value) {
        this.assert(this.obj < value);
    });

    expect.addAssertion('<=', 'to be (<=|less than or equals to)', function (value) {
        this.assert(this.obj <= value);
    });

    expect.addAssertion('>', 'to be (>|greater than|above)', function (value) {
        this.assert(this.obj > value);
    });

    expect.addAssertion('>=', 'to be (>=|greater than or equals to)', function (value) {
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

    Assertion.prototype.inspect = inspect;
    expect.inspect = inspect;
    Assertion.prototype.eql = eql;
    expect.eql = eql;

    ///////////////////////// Helper functions ///////////////////////////////

    function bind(fn, scope) {
        return function () {
            return fn.apply(scope, arguments);
        };
    }

    function every (arr, fn, thisObj) {
        var scope = thisObj || global;
        for (var i = 0, j = arr.length; i < j; ++i) {
            if (!fn.call(scope, arr[i], i, arr)) {
                return false;
            }
        }
        return true;
    }

    function indexOf (arr, o, i) {
        if (Array.prototype.indexOf) {
            return Array.prototype.indexOf.call(arr, o, i);
        }

        if (arr.length === undefined) {
            return -1;
        }

        for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
             i < j && arr[i] !== o; i++);

        return j <= i ? -1 : i;
    }

    // https://gist.github.com/1044128/
    var getOuterHTML = function(element) {
        if ('outerHTML' in element) return element.outerHTML;
        var ns = "http://www.w3.org/1999/xhtml";
        var container = document.createElementNS(ns, '_');
        var elemProto = (window.HTMLElement || window.Element).prototype;
        var xmlSerializer = new XMLSerializer();
        var html;
        if (document.xmlVersion) {
            return xmlSerializer.serializeToString(element);
        } else {
            container.appendChild(element.cloneNode(false));
            html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
            container.innerHTML = '';
            return html;
        }
    };

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
     */
    function inspect(obj, showHidden, depth) {
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
                var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '')
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
            var visible_keys = getKeys(value);
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

            var output = map($keys, function (key) {
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
                if (indexOf(visible_keys, key) < 0) {
                    name = '[' + key + ']';
                }
                if (!str) {
                    if (indexOf(seen, value[key]) < 0) {
                        if (recurseTimes === null) {
                            str = format(value[key]);
                        } else {
                            str = format(value[key], recurseTimes - 1);
                        }
                        if (str.indexOf('\n') > -1) {
                            if (isArray(value)) {
                                str = map(str.split('\n'), function (line) {
                                    return '  ' + line;
                                }).join('\n').substr(2);
                            } else {
                                str = '\n' + map(str.split('\n'), function (line) {
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
                    name = json.stringify('' + key);
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
            var length = reduce(output, function (prev, cur) {
                numLinesEst++;
                if (indexOf(cur, '\n') >= 0) numLinesEst++;
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
    }

    function isArray (ar) {
        return Object.prototype.toString.call(ar) === '[object Array]';
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

    function getKeys(obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }

        var result = [];

        for (var i in obj) {
            if (hasOwnProperty(obj, i)) {
                result.push(i);
            }
        }

        return result;
    }

    function hasOwnProperty(obj, property) {
        return Object.prototype.hasOwnProperty.call(obj, property);
    }

    function forEach(arr, callback, that) {
        if (Array.prototype.forEach) {
            return Array.prototype.forEach.call(arr, callback, that);
        }

        for (var i= 0, n = arr.length; i<n; i++)
            if (i in arr)
                callback.call(that, arr[i], i, arr);
    }

    function map(arr, mapper, that) {
        if (Array.prototype.map) {
            return Array.prototype.map.call(arr, mapper, that);
        }

        var other = new Array(arr.length);

        for (var i= 0, n = arr.length; i<n; i++)
            if (i in arr)
                other[i] = mapper.call(that, arr[i], i, arr);

        return other;
    }

    function filter(arr, predicate) {
        if (Array.prototype.filter) {
            return Array.prototype.filter.apply(
                arr, Array.prototype.slice.call(arguments, 1)
            );
        }

        var length = +arr.length;

        var result = [];

        if (typeof predicate !== "function")
            throw new TypeError();

        for (var i = 0; i < length; i += 1) {
            var value = arr[i];
            if (predicate(value)) {
                result.push(value);
            }
        }

        return result;
    }

    function trim(text) {
        if (String.prototype.trim) {
            return text.trim();
        }
        return text.replace(/^\s+|\s+$/g, '');
    }

    function reduce(arr, fun) {
        if (Array.prototype.reduce) {
            return Array.prototype.reduce.apply(
                arr, Array.prototype.slice.call(arguments, 1)
            );
        }

        var len = +arr.length;

        if (typeof fun !== "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1)
            throw new TypeError();

        var i = 0;
        var rv;
        if (arguments.length >= 2) {
            rv = arguments[2];
        } else {
            do {
                if (i in arr) {
                    rv = arr[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }

        for (; i < len; i++) {
            if (i in arr)
                rv = fun.call(null, rv, arr[i], i, this);
        }

        return rv;
    }

    /**
     * Asserts deep equality
     *
     * @see taken from node.js `assert` module (copyright Joyent, MIT license)
     */
    function eql(actual, expected) {
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
    }

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
        var ka, kb, key, i;
        try{
            ka = getKeys(a);
            kb = getKeys(b);
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
            if (!eql(a[key], b[key]))
                return false;
        }
        return true;
    }

    var json = (function () {
        "use strict";

        if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
            return {
                parse: JSON.parse,
                stringify: JSON.stringify
            };
        }

        var JSON = {};

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        function date(d, key) {
            return isFinite(d.valueOf()) ?
                d.getUTCFullYear()     + '-' +
                f(d.getUTCMonth() + 1) + '-' +
                f(d.getUTCDate())      + 'T' +
                f(d.getUTCHours())     + ':' +
                f(d.getUTCMinutes())   + ':' +
                f(d.getUTCSeconds())   + 'Z' : null;
        }

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


        function quote(string) {

            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }


        function str(key, holder) {

            // Produce a string from holder[key].

            var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.

            if (value instanceof Date) {
                value = date(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

                // If the type is 'object', we might be dealing with an object or an array or
                // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' : gap ?
                        '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                        '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (hasOwnProperty(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' : gap ?
                    '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                    '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.

        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                 typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {'': value});
        };

        // If the JSON object does not yet have a parse method, give it one.

        JSON.parse = function (text, reviver) {
            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (hasOwnProperty(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                      .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                      .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };

        return JSON;
    })();
    //////////////////////////////////////////////////////////////////////////

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
        root.weknowhow = root.weknowhow || {};
        root.weknowhow.expect = expect;
    }
}());
