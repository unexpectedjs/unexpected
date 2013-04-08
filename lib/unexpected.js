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

    Assertion.prototype.an = function (type) {
        var subject = this.obj;
        if ('string' == typeof type) {
            // typeof with support for 'array'
            this.assert(
                'array' == type ? isArray(subject) :
                    'object' == type ?
                    'object' == typeof subject && null !== subject :
                    type == typeof subject);
        } else {
            // instanceof
            var name = type.name || 'supplied constructor';
            this.assert(subject instanceof type);
        }

        return this;
    };
    Assertion.prototype.a = Assertion.prototype.an;

    Assertion.prototype.exception = function (fn) {
        expect(this.obj, 'to be a', 'function');

        var thrown = false;
        var not = this.flags.not;

        try {
            this.obj();
        } catch (e) {
            if ('function' == typeof fn) {
                fn(e);
            } else if ('object' == typeof fn) {
                var subject = 'string' == typeof e ? e : e.message;
                if (not) {
                    expect(subject, 'to not match', fn);
                } else {
                    expect(subject, 'to match', fn);
                }
            }
            thrown = true;
        }

        if ('object' == typeof fn && not) {
            // in the presence of a matcher, ensure the `not` only applies to
            // the matching.
            this.flags.not = false;
        }

        var name = this.obj.name || 'fn';
        this.assert(thrown);
    };
    Assertion.prototype.error = Assertion.prototype.exception;

    Assertion.prototype.be = function (value) {
        this.assert(this.obj === value);
    };
    Assertion.prototype.equal = Assertion.prototype.be;

    Assertion.prototype.ok = function (value) {
        this.assert(this.obj);
    };
    Assertion.prototype.truthy = Assertion.prototype.ok;

    Assertion.prototype.falsy = function (value) {
        this.assert(!this.obj);
    };

    Assertion.prototype.assert = function (condition) {
        var that = this;
        var not = !!this.flags.not;
        condition = !!condition;
        if (condition === not) {
            var argsString = this.args.map(function (arg) {
                return that.inspect(arg);
            }).join(', ');
            throw new Error('expected ' +
                            this.inspect(this.obj) +
                            ' ' + this.testDescription + ' ' +
                            argsString);
        }
    };

    Assertion.prototype.match = function (regexp) {
        this.assert(regexp.exec(this.obj));
    };

    function parseTestString(text) {
        var words = (text || '').split(/\s+/);
        var flags = {};
        words.slice(0, -1).forEach(function (word) {
            flags[word] = true;
        });
        return {
            testString: text, 
            assertion: words[words.length - 1],
            flags: flags
        };
    }

    function expect(subject, testDescriptionString) {
        var testDescription = parseTestString(testDescriptionString); 
        var args = Array.prototype.slice.call(arguments, 2);
        var assertion = new Assertion(subject, testDescriptionString, testDescription.flags, args);

        if (!assertion[testDescription.assertion]) {
            throw new Error("assertion '" + testDescription.assertion + "' is not defined");
        }

        assertion[testDescription.assertion].apply(assertion, args);
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
        try{
            var ka = keys(a),
            kb = keys(b),
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

    function keys (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }

        var keys = [];

        for (var i in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, i)) {
                keys.push(i);
            }
        }

        return keys;
    }

    function map (arr, mapper, that) {
        if (Array.prototype.map) {
            return Array.prototype.map.call(arr, mapper, that);
        }

        var other= new Array(arr.length);

        for (var i= 0, n = arr.length; i<n; i++)
            if (i in arr)
                other[i] = mapper.call(that, arr[i], i, arr);

        return other;
    };

    function reduce (arr, fun) {
        if (Array.prototype.reduce) {
            return Array.prototype.reduce.apply(
                arr
                , Array.prototype.slice.call(arguments, 1)
            );
        }

        var len = +this.length;

        if (typeof fun !== "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1)
            throw new TypeError();

        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }

        for (; i < len; i++) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
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
     * @api private
     */
    Assertion.prototype.inspect = function (obj, showHidden, depth) {
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
            var visible_keys = keys(value);
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
    };

    var json = (function () {
        "use strict";

        if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
            return {
                parse: nativeJSON.parse,
                stringify: nativeJSON.stringify
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
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
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
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
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
