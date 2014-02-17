(function () {
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
    (function () {
        var global = this;
        global.unexpected = {};
    }());
    (function () {
        var global = this;
        global.unexpected.shim = global.unexpected.shim || {};
        var shim = global.unexpected.shim;

        var prototypes = {
            'bind': Function.prototype.bind,
            'every': Array.prototype.every,
            'indexOf': Array.prototype.indexOf,
            'forEach': Array.prototype.forEach,
            'map': Array.prototype.map,
            'filter': Array.prototype.filter,
            'reduce': Array.prototype.reduce,
            'trim': String.prototype.trim
        };

        function createShimMethod(key) {
            shim[key] = function (obj) {
                var args = Array.prototype.slice.call(arguments, 1);
                return prototypes[key].apply(obj, args);
            };
        }

        for (var key in prototypes) {
            if (prototypes.hasOwnProperty(key) && prototypes[key]) {
                createShimMethod(key);
            }
        }

        if (!shim.bind) {
            shim.bind = function (fn, scope) {
                return function () {
                    return fn.apply(scope, arguments);
                };
            };
        }

        if (Object.keys) {
            shim['getKeys'] = Object.keys;
        }

        if ('object' === typeof JSON && JSON.parse && JSON.stringify) {
            shim['JSON'] = JSON;
        }
    }());
    (function () {
        var global = this;
        var shim = global.unexpected.shim;
        var forEach = shim.forEach;
        var getKeys = shim.getKeys;

        var utils = {
            // https://gist.github.com/1044128/
            getOuterHTML: function (element) {
                // jshint browser:true
                if ('outerHTML' in element) return element.outerHTML;
                var ns = "http://www.w3.org/1999/xhtml";
                var container = document.createElementNS(ns, '_');
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
            },

            // Returns true if object is a DOM element.
            isDOMElement: function (object) {
                if (typeof HTMLElement === 'object') {
                    return object instanceof HTMLElement;
                } else {
                    return object &&
                        typeof object === 'object' &&
                        object.nodeType === 1 &&
                        typeof object.nodeName === 'string';
                }
            },


            isArray: function (ar) {
                return Object.prototype.toString.call(ar) === '[object Array]';
            },

            isRegExp: function (re) {
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
            },

            isDate: function (d) {
                if (d instanceof Date) return true;
                return false;
            },

            extend: function (target) {
                var sources = Array.prototype.slice.call(arguments, 1);
                forEach(sources, function (source) {
                    forEach(getKeys(source), function (key) {
                        target[key] = source[key];
                    });
                });
                return target;
            },

            isUndefinedOrNull: function  (value) {
                return value === null || value === undefined;
            },

            isArguments: function  (object) {
                return Object.prototype.toString.call(object) === '[object Arguments]';
            },

            /**
             * Levenshtein distance algorithm from wikipedia
             * http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
             */
            levenshteinDistance: function (a, b) {
                if (a.length === 0) return b.length;
                if (b.length === 0) return a.length;

                var matrix = [];

                // increment along the first column of each row
                var i;
                for (i = 0; i <= b.length; i += 1) {
                    matrix[i] = [i];
                }

                // increment each column in the first row
                var j;
                for (j = 0; j <= a.length; j += 1) {
                    matrix[0][j] = j;
                }

                // Fill in the rest of the matrix
                for (i = 1; i <= b.length; i += 1) {
                    for (j = 1; j <= a.length; j += 1) {
                        if (b.charAt(i - 1) === a.charAt(j - 1)) {
                            matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                                    Math.min(matrix[i][j - 1] + 1, // insertion
                                                             matrix[i - 1][j] + 1)); // deletion
                        }
                    }
                }

                return matrix[b.length][a.length];
            },

            truncateStack: function (err, fn) {
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(err, fn);
                } else if ('stack' in err) {
                    // Excludes IE<10, and fn cannot be anonymous for this backup plan to work:
                    var stackEntries = err.stack.split(/\r\n?|\n\r?/),
                    needle = 'at ' + fn.name + ' ';
                    for (var i = 0 ; i < stackEntries.length ; i += 1) {
                        if (stackEntries[i].indexOf(needle) !== -1) {
                            stackEntries.splice(1, i);
                            err.stack = stackEntries.join("\n");
                        }
                    }
                }
            }
        };

        global.unexpected.utils = utils;
    }());
    (function () {
        var global = this;
        var unexpected = global.unexpected;
        var shim = unexpected.shim;
        var getKeys = shim.getKeys;

        var utils = unexpected.utils;
        var isRegExp = utils.isRegExp;
        var isArguments = utils.isArguments;
        var isUndefinedOrNull = utils.isUndefinedOrNull;

        /**
         * Asserts deep equality
         *
         * @see taken from node.js `assert` module (copyright Joyent, MIT license)
         */
        function equal(actual, expected) {
            // 7.1. All identical values are equivalent, as determined by ===.
            if (actual === expected) {
                return true;
            } else if ('undefined' !== typeof Buffer &&
                       Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
                if (actual.length !== expected.length) return false;

                for (var i = 0; i < actual.length; i += 1) {
                    if (actual[i] !== expected[i]) return false;
                }

                return true;

                // 7.2. If the expected value is a Date object, the actual value is
                // equivalent if it is also a Date object that refers to the same time.
            } else if (actual instanceof Date && expected instanceof Date) {
                return actual.getTime() === expected.getTime();

                // 7.3. Other pairs that do not both pass typeof value == "object",
                // equivalence is determined by ==.
            } else if (typeof actual !== 'object' && typeof expected !== 'object') {
                return actual === expected;

                // 7.4. For all other Object pairs, including Array objects, equivalence is
                // determined by having the same number of owned properties (as verified
                // with Object.prototype.hasOwnProperty.call), the same set of keys
                // (although not necessarily the same order), equivalent values using === for every
                // corresponding key, and an identical "prototype" property. Note: this
                // accounts for both named and indexed properties on Arrays.
            } else {
                return objEquiv(actual, expected);
            }
        }

        function objEquiv(a, b) {
            if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
                return false;
            // an identical "prototype" property.
            if (a.prototype !== b.prototype) return false;
            //~~~I've managed to break Object.keys through screwy arguments passing.
            //   Converting to array solves the problem.
            if (isRegExp(a)) {
                if (!isRegExp(b)) {
                    return false;
                }
                return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
            }
            if (isArguments(a)) {
                if (!isArguments(b)) {
                    return false;
                }
                a = Array.prototype.slice.call(a);
                b = Array.prototype.slice.call(b);
                return equal(a, b);
            }
            var ka, kb, key, i;
            try {
                ka = getKeys(a);
                kb = getKeys(b);
            } catch (e) {//happens when one is a string literal and the other isn't
                return false;
            }
            // having the same number of owned properties (keys incorporates hasOwnProperty)
            if (ka.length !== kb.length)
                return false;
            //the same set of keys (although not necessarily the same order),
            ka.sort();
            kb.sort();
            //~~~cheap key test
            for (i = ka.length - 1; i >= 0; i -= 1) {
                if (ka[i] !== kb[i])
                    return false;
            }
            //equivalent values for every corresponding key, and
            //~~~possibly expensive deep test
            for (i = ka.length - 1; i >= 0; i -= 1) {
                key = ka[i];
                if (!equal(a[key], b[key]))
                    return false;
            }
            return true;
        }

        global.unexpected.equal = equal;
    }());
    (function () {
        var global = this;
        var shim = global.unexpected.shim;
        var json = shim.JSON;
        var getKeys = shim.getKeys;
        var map = shim.map;
        var indexOf = shim.indexOf;
        var reduce = shim.reduce;

        var utils = global.unexpected.utils;
        var isDOMElement = utils.isDOMElement;
        var getOuterHTML = utils.getOuterHTML;
        var isArray = utils.isArray;
        var isRegExp = utils.isRegExp;
        var isDate = utils.isDate;

        /**
         * Inspects an object.
         *
         * @see taken from node.js `util` module (copyright Joyent, MIT license)
         */
        var inspect = function (obj, showHidden, depth) {
            var seen = [];

            function stylize(str) {
                return str;
            }

            function format(value, recurseTimes) {

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
                    numLinesEst += 1;
                    if (indexOf(cur, '\n') >= 0) numLinesEst += 1;
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

        global.unexpected.inspect = inspect;
    }());
    (function () {
        var global = this;
        var unexpected = global.unexpected;
        var inspect = unexpected.inspect;
        var equal = unexpected.equal;

        var shim = unexpected.shim;
        var bind = shim.bind;
        var forEach = shim.forEach;
        var filter = shim.filter;
        var map = shim.map;
        var trim = shim.trim;
        var reduce = shim.reduce;
        var getKeys = shim.getKeys;

        var utils = unexpected.utils;
        var truncateStack = utils.truncateStack;
        var extend = utils.extend;
        var levenshteinDistance = utils.levenshteinDistance;

        function Assertion(subject, testDescription, flags, args) {
            this.obj = subject;
            this.testDescription = testDescription;
            this.flags = flags;
            this.args = args;
        }

        Assertion.prototype.throwStandardError = function () {
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
            var not = !!this.flags.not;
            condition = !!condition;
            if (condition === not) {
                this.throwStandardError();
            }
        };

        function Unexpected(assertions) {
            this.assertions = assertions || {};
        }

        Unexpected.prototype.format = function (message, args) {
            args = map(args, function (arg) {
                return inspect(arg);
            });
            message = message.replace(/\{(\d+)\}/g, function (match, n) {
                return args[n] || match;
            });
            return message;
        };

        Unexpected.prototype.fail = function (message) {
            message = message || "explicit failure";
            var args = Array.prototype.slice.call(arguments, 1);
            throw new Error(this.format(message, args));
        };

        Unexpected.prototype.findAssertionSimilarTo = function (text) {
            var editDistrances = [];
            forEach(getKeys(this.assertions), function (assertion) {
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

        Unexpected.prototype.addAssertion = function () {
            var assertions = this.assertions;
            var patterns = Array.prototype.slice.call(arguments, 0, -1);
            var handler = Array.prototype.slice.call(arguments, -1)[0];
            forEach(patterns, function (pattern) {
                ensureValidPattern(pattern);
                forEach(expandPattern(pattern), function (expandedPattern) {
                    assertions[expandedPattern.text] = {
                        handler: handler,
                        flags: expandedPattern.flags
                    };
                });
            });

            return this; // for chaining
        };

        Unexpected.prototype.installPlugin = function (plugin) {
            if (typeof plugin !== 'function') {
                throw new Error('Expected first argument given to installPlugin to be a function');
            }

            plugin(this.expect);
        };

        Unexpected.prototype.expect = function (subject, testDescriptionString) {
            if (arguments.length < 2) {
                throw new Error('The expect functions requires at least two parameters.');
            }
            if (typeof testDescriptionString !== 'string') {
                throw new Error('The expect functions requires second parameter to be a string.');
            }
            var assertionRule = this.assertions[testDescriptionString];
            if (assertionRule) {
                var flags = reduce(assertionRule.flags, function (flags, flag) {
                    flags[flag] = true;
                    return flags;
                }, {});
                var args = Array.prototype.slice.call(arguments, 2);
                var assertion = new Assertion(subject, testDescriptionString, flags, args);
                var handler = assertionRule.handler;
                try {
                    handler.apply(assertion, args);
                } catch (e) {
                    truncateStack(e, this.expect);
                    throw e;
                }
            } else {
                var similarAssertions = this.findAssertionSimilarTo(testDescriptionString);
                var message =
                    'Unknown assertion "' + testDescriptionString + '", ' +
                    'did you mean: "' + similarAssertions[0] + '"';
                var err = new Error(message);
                truncateStack(err, this.expect);
                throw err;
            }
        };

        Unexpected.prototype.toString = function () {
            return getKeys(this.assertions).sort().join('\n');
        };

        function makeExpectFunction(unexpected) {
            var expect = bind(unexpected.expect, unexpected);
            unexpected.expect = expect;
            expect.fail = bind(unexpected.fail, unexpected);
            expect.addAssertion = bind(unexpected.addAssertion, unexpected);
            expect.clone = bind(unexpected.clone, unexpected);
            expect.toString = bind(unexpected.toString, unexpected);
            expect.assertions = unexpected.assertions;
            expect.installPlugin = bind(unexpected.installPlugin, unexpected);
            return expect;
        }

        Unexpected.prototype.clone = function () {
            var unexpected = new Unexpected(extend({}, this.assertions));
            return makeExpectFunction(unexpected);
        };

        Unexpected.create = function () {
            var unexpected = new Unexpected();
            return makeExpectFunction(unexpected);
        };

        var expandPattern = (function () {
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
                    if (permutation.text === '') {
                        // This can only happen if the pattern only contains flags
                        throw new Error("Assertion patterns must not only contain flags");
                    }
                });
                return permutations;
            };
        }());


        function ensureValidUseOfParenthesesOrBrackets(pattern) {
            var counts = {
                '[': 0,
                ']': 0,
                '(': 0,
                ')': 0
            };
            for (var i = 0; i < pattern.length; i += 1) {
                var c = pattern.charAt(i);
                if (c in counts) {
                    counts[c] += 1;
                }
                if (c === ']' && counts['['] >= counts[']']) {
                    if (counts['['] === counts[']'] + 1) {
                        throw new Error("Assertion patterns must not contain flags with brackets: '" + pattern + "'");
                    }

                    if (counts['('] !== counts[')']) {
                        throw new Error("Assertion patterns must not contain flags with parentheses: '" + pattern + "'");
                    }

                    if (pattern.charAt(i - 1) === '[') {
                        throw new Error("Assertion patterns must not contain empty flags: '" + pattern + "'");
                    }
                } else if (c === ')' && counts['('] >= counts[')']) {
                    if (counts['('] === counts[')'] + 1) {
                        throw new Error("Assertion patterns must not contain alternations with parentheses: '" + pattern + "'");
                    }

                    if (counts['['] !== counts[']']) {
                        throw new Error("Assertion patterns must not contain alternations with brackets: '" + pattern + "'");
                    }
                }

                if ((c === ')' || c === '|') && counts['('] >= counts[')']) {
                    if (pattern.charAt(i - 1) === '(' || pattern.charAt(i - 1) === '|') {
                        throw new Error("Assertion patterns must not contain empty alternations: '" + pattern + "'");
                    }
                }
            }

            if (counts['['] !== counts[']']) {
                throw new Error("Assertion patterns must not contain unbalanced brackets: '" + pattern + "'");
            }

            if (counts['('] !== counts[')']) {
                throw new Error("Assertion patterns must not contain unbalanced parentheses: '" + pattern + "'");
            }
        }

        function ensureValidPattern(pattern) {
            if (typeof pattern !== 'string' || pattern === '') {
                throw new Error("Assertion patterns must be a non empty string");
            }
            if (pattern.match(/^\s|\s$/)) {
                throw new Error("Assertion patterns can't start or end with whitespace");
            }

            ensureValidUseOfParenthesesOrBrackets(pattern);
        }


        Assertion.prototype.inspect = inspect;
        Assertion.prototype.eql = equal; // Deprecated
        Assertion.prototype.equal = equal;

        global.unexpected.expect = Unexpected.create();
    }());
    (function () {
        var global = this;
        var unexpected = global.unexpected;
        var expect = unexpected.expect;

        var shim = unexpected.shim;
        var forEach = shim.forEach;
        var getKeys = shim.getKeys;
        var every = shim.every;
        var indexOf = shim.indexOf;

        var utils = unexpected.utils;
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
            expect(this.obj, 'to be an object');
            if (this.flags['non-empty']) {
                expect(this.obj, 'to be non-empty');
            }

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
            expect(this.obj, 'to be an array');
            if (this.flags['non-empty']) {
                expect(this.obj, 'to be non-empty');
            }
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
                callback = callbackOrString;
            } else if ('string' === typeof callbackOrString) {
                var args = Array.prototype.slice.call(arguments);
                callback = function (key) {
                    expect.apply(expect, [key].concat(args));
                };
            } else {
                throw new Error('Assertions "' + this.testDescription + '" expects a functions as argument');
            }
            expect(this.obj, 'to be an object');
            if (this.flags['non-empty']) {
                expect(this.obj, 'to be non-empty');
            }

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
    (function () {
        var global = this;
        var expect = global.unexpected.expect;

        // Support three module loading scenarios
        if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
            // CommonJS/Node.js
            module.exports = expect;
        } else if (typeof define === 'function' && define.amd) {
            // AMD anonymous module
            define(function () {
                return expect;
            });
        } else {
            // No module loader (plain <script> tag) - put directly in global namespace
            global.weknowhow = global.weknowhow || {};
            global.weknowhow.expect = expect;
        }
    }());
}());
