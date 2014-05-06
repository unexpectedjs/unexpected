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

    function formatError(err) {
        return '[' + Error.prototype.toString.call(err) + ']';
    }

    /**
     * Inspects an object.
     *
     * @see taken from node.js `util` module (copyright Joyent, MIT license)
     */
    var inspect = function (obj, showHidden, depth, types) {
        var seen = [];

        function format(value, recurseTimes) {
            var matchingCustomType = utils.findFirst(types || [], function (type) {
                return type.identify(value);
            });

            if (matchingCustomType) {
                return matchingCustomType.inspect(value);
            }

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
                return 'undefined';

            case 'string':
                return '\'' + json.stringify(value).replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') + '\'';

            case 'number':
            case 'boolean':
                return '' + value;
            }
            // For some reason typeof null is "object", so special case here.
            if (value === null) {
                return 'null';
            }

            if (isDOMElement(value)) {
                return getOuterHTML(value);
            }

            if (isRegExp(value)) {
                return '' + value;
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
                    return '' + value;
                } else {
                    var name = value.name ? ': ' + value.name : '';
                    return '[Function' + name + ']';
                }
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

            if ($keys.length === 0) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return '' + value;
                } else {
                    return '[Object]';
                }
            }

            seen.push(value);

            var output = map($keys, function (key) {
                var name, str;
                if (value.__lookupGetter__) {
                    if (value.__lookupGetter__(key)) {
                        if (value.__lookupSetter__(key)) {
                            str = '[Getter/Setter]';
                        } else {
                            str = '[Getter]';
                        }
                    } else {
                        if (value.__lookupSetter__(key)) {
                            str = '[Setter]';
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
                        str = '[Circular]';
                    }
                }
                if (typeof name === 'undefined') {
                    if (type === 'Array' && key.match(/^\d+$/)) {
                        return str;
                    }
                    name = json.stringify('' + key);
                    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                        name = name.substr(1, name.length - 2);
                    } else {
                        name = name.replace(/'/g, "\\'")
                            .replace(/\\"/g, '"')
                            .replace(/(^"|"$)/g, "'");
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
