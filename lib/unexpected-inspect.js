/*global namespace*/
(function () {
    var shim = namespace.shim;
    var json = shim.JSON;
    var getKeys = shim.getKeys;
    var map = shim.map;
    var indexOf = shim.indexOf;
    var reduce = shim.reduce;

    var utils = namespace.utils;
    var isDOMElement = utils.isDOMElement;
    var getOuterHTML = utils.getOuterHTML;
    var isArray = utils.isArray;
    var isRegExp = utils.isRegExp;
    var isError = utils.isError;
    var isDate = utils.isDate;

    function formatError(err) {
        return '[' + Error.prototype.toString.call(err) + ']';
    }

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
                (typeof exports === 'undefined' || value !== exports) &&
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

            if (isError(value)) {
                return formatError(value);
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

    namespace.inspect = inspect;
}());
