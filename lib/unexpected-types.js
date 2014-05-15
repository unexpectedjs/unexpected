/*global namespace, Uint8Array, Uint16Array*/
(function () {
    var expect = namespace.expect;

    var utils = namespace.utils;
    var isRegExp = utils.isRegExp;
    var leftPad = utils.leftPad;
    var shim = namespace.shim;
    var json = shim.JSON;
    var every = shim.every;
    var some = shim.some;
    var map = shim.map;
    var getKeys = shim.getKeys;
    var reduce = shim.reduce;

    expect.addType({
        name: 'fallback',
        identify: function (value) {
            return true;
        },
        equal: function (a, b) {
            return a === b;
        },
        inspect: function (value) {
            return '' + value;
        },
        toJSON: function (value) {
            return value;
        }
    });

    expect.addType({
        name: 'object',
        identify: function (arr) {
            return typeof arr === 'object';
        },
        equal: function (a, b, equal) {
            if (a === b) {
                return true;
            }

            // an identical "prototype" property.
            if (a.prototype !== b.prototype) {
                return false;
            }
            //~~~I've managed to break Object.keys through screwy arguments passing.
            //   Converting to array solves the problem.
            if (utils.isArguments(a)) {
                if (!utils.isArguments(b)) {
                    return false;
                }
                return equal(Array.prototype.slice.call(a), Array.prototype.slice.call(b));
            }
            var actualKeys = utils.getKeysOfDefinedProperties(a),
                expectedKeys = utils.getKeysOfDefinedProperties(b),
                key,
                i;

            // having the same number of owned properties (keys incorporates hasOwnProperty)
            if (actualKeys.length !== expectedKeys.length) {
                return false;
            }
            //the same set of keys (although not necessarily the same order),
            actualKeys.sort();
            expectedKeys.sort();
            //~~~cheap key test
            for (i = actualKeys.length - 1; i >= 0; i -= 1) {
                if (actualKeys[i] !== expectedKeys[i]) {
                    return false;
                }
            }

            //equivalent values for every corresponding key, and
            //~~~possibly expensive deep test
            for (i = actualKeys.length - 1; i >= 0; i -= 1) {
                key = actualKeys[i];
                if (!equal(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        },
        inspect: function (obj, inspect) {
            var keys = getKeys(obj);
            if (keys.length === 0) {
                return '{}';
            }

            var inspectedItems = map(keys, function (key) {
                var parts = [];
                if (key.match(/["' ]/)) {
                    parts.push(expect.inspect(key) + ':');
                } else {
                    parts.push(key + ':');
                }

                var hasGetter = obj.__lookupGetter__ && obj.__lookupGetter__(key);
                var hasSetter = obj.__lookupGetter__ && obj.__lookupSetter__(key);

                if (hasGetter || !hasSetter) {
                    parts.push(inspect(obj[key]));
                }

                if (hasGetter && hasSetter) {
                    parts.push('[Getter/Setter]');
                } else if (hasGetter) {
                    parts.push('[Getter]');
                } else if (hasSetter) {
                    parts.push('[Setter]');
                }

                return parts.join(' ');
            });

            var length = 0;
            var multipleLines = some(inspectedItems, function (v) {
                length += v.length;
                return length > 50 || v.match(/\n/);
            });

            if (multipleLines) {
                return '{\n' + inspectedItems.join(',\n').replace(/^/gm, '  ') + '\n}';
            } else {
                return '{ ' + inspectedItems.join(', ') + ' }';
            }
        },
        toJSON: function (obj, toJSON) {
            return reduce(getKeys(obj), function (result, key) {
                result[key] = toJSON(obj[key]);
                return result;
            }, {});
        }
    });

    expect.addType({
        name: 'array',
        identify: function (arr) {
            return utils.isArray(arr) || utils.isArguments(arr);
        },
        equal: function (a, b, equal) {
            return a === b || (a.length === b.length && every(a, function (v, index) {
                return equal(v, b[index]);
            }));
        },
        inspect: function (arr, inspect, depth) {
            if (arr.length === 0) {
                return '[]';
            }

            if (depth === 1) {
                return '[...]';
            }

            var inspectedItems = map(arr, function (v) {
                return inspect(v);
            });

            var length = 0;
            var multipleLines = some(inspectedItems, function (v) {
                length += v.length;
                return length > 50 || v.match(/\n/);
            });

            if (multipleLines) {
                return '[\n' + inspectedItems.join(',\n').replace(/^/gm, '  ') + '\n]';
            } else {
                return '[ ' + inspectedItems.join(', ') + ' ]';
            }
        },
        toJSON: function (arr, toJSON) {
            return map(arr, toJSON);
        }
    });

    expect.addType({
        base: 'object',
        name: 'Error',
        identify: function (value) {
            return utils.isError(value);
        },
        equal: function (a, b, equal) {
            return a === b ||
                (equal(a.message, b.message) && this.baseType.equal(a, b, equal));
        },
        inspect: function (value, inspect) {
            return '[Error: ' + value.message + ' ' + this.baseType.inspect(value, inspect) + ']';
        }
    });

    expect.addType({
        name: 'date',
        identify: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Date]';
        },
        equal: function (a, b) {
            return a.getTime() === b.getTime();
        },
        inspect: function (date) {
            return '[Date ' + date.toUTCString() + ']';
        },
        toJSON: function (date) {
            return {
                $Date: this.inspect(date)
            };
        }
    });

    expect.addType({
        name: 'function',
        identify: function (f) {
            return typeof f === 'function';
        },
        equal: function (a, b) {
            return a === b || a.toString() === b.toString();
        },
        inspect: function (f) {
            var n = f.name ? ': ' + f.name : '';
            return '[Function' + n + ']';
        },
        toJSON: function (f) {
            return {
                $Function: this.inspect(f)
            };
        }
    });

    expect.addType({
        name: 'regexp',
        identify: isRegExp,
        equal: function (a, b) {
            return a === b || (
                a.source === b.source &&
                    a.global === b.global &&
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline
            );
        },
        inspect: function (regExp) {
            return '' + regExp;
        },
        toJSON: function (regExp) {
            return {
                $RegExp: this.inspect(regExp)
            };
        }
    });

    expect.addType({
        name: 'DomElement',
        identify: function (value) {
            return utils.isDOMElement(value);
        },
        inspect: function (value) {
            return utils.getOuterHTML(value);
        }
    });

    function getHexDumpLinesForBufferLikeObject(obj, width, digitWidth) {
        digitWidth = digitWidth || 2;
        var hexDumpLines = [];
        if (typeof width !== 'number') {
            width = 16;
        } else if (width === 0) {
            width = obj.length;
        }
        for (var i = 0 ; i < obj.length ; i += width) {
            var hexChars = '',
                asciiChars = ' |';

            for (var j = 0 ; j < width ; j += 1) {
                if (i + j < obj.length) {
                    var octet = obj[i + j];
                    hexChars += leftPad(octet.toString(16).toUpperCase(), digitWidth, '0') + ' ';
                    asciiChars += (octet >= 32 && octet < 127) ? String.fromCharCode(octet) : '.';
                } else if (digitWidth === 2) {
                    hexChars += '   ';
                }
            }

            if (digitWidth === 2) {
                asciiChars += '|';
                hexDumpLines.push(hexChars + asciiChars);
            } else {
                hexDumpLines.push(hexChars.replace(/\s+$/, ''));
            }
        }
        return hexDumpLines;
    }

    function inspectBufferLikeObject(buffer, digitWidth) {
        var inspectedContents,
            maxLength = 20;
        if (buffer.length > maxLength) {
            inspectedContents = getHexDumpLinesForBufferLikeObject(buffer.slice(0, maxLength), 0, digitWidth) + ' (+' + (buffer.length - maxLength) + ')';
        } else {
            inspectedContents = getHexDumpLinesForBufferLikeObject(buffer, 0, digitWidth).join('\n');
        }
        return inspectedContents;
    }

    function bufferLikeObjectsEqual(a, b) {
        if (a === b) {
            return true;
        }

        if (a.length !== b.length) return false;

        for (var i = 0; i < a.length; i += 1) {
            if (a[i] !== b[i]) return false;
        }

        return true;
    }

    if (typeof Buffer !== 'undefined') {
        expect.addType({
            name: 'Buffer',
            identify: Buffer.isBuffer,
            equal: bufferLikeObjectsEqual,
            inspect: function (buffer) {
                return '[Buffer ' + inspectBufferLikeObject(buffer) + ']';
            },
            toJSON: function (buffer) {
                return {
                    $Buffer: getHexDumpLinesForBufferLikeObject(buffer)
                };
            }
        });
    }

    if (typeof Uint8Array !== 'undefined') {
        expect.addType({
            name: 'Uint8Array',
            identify: function (obj) {
                return obj && obj instanceof Uint8Array;
            },
            equal: bufferLikeObjectsEqual,
            inspect: function (uint8Array) {
                return '[Uint8Array ' + inspectBufferLikeObject(uint8Array) + ']';
            },
            toJSON: function (uint8Array) {
                return {
                    $Uint8Array: getHexDumpLinesForBufferLikeObject(uint8Array)
                };
            }
        });
    }


    if (typeof Uint16Array !== 'undefined') {
        expect.addType({
            name: 'Uint16Array',
            identify: function (obj) {
                return obj && obj instanceof Uint16Array;
            },
            equal: bufferLikeObjectsEqual,
            inspect: function (uint16Array) {
                return '[Uint16Array ' + inspectBufferLikeObject(uint16Array, 8, 4, false) + ']';
            },
            toJSON: function (uint16Array) {
                return {
                    $Uint16Array: getHexDumpLinesForBufferLikeObject(uint16Array, 8, 4, false)
                };
            }
        });
    }

    expect.addType({
        name: 'string',
        identify: function (value) {
            return typeof value === 'string';
        },
        inspect: function (value) {
            return '\'' + json.stringify(value).replace(/^"|"$/g, '')
                .replace(/'/g, "\\'")
                .replace(/\\"/g, '"') + '\'';
        }
    });

    expect.addType({
        name: 'number',
        identify: function (value) {
            return typeof value === 'number';
        }
    });

    expect.addType({
        name: 'boolean',
        identify: function (value) {
            return typeof value === 'boolean';
        }
    });

    expect.addType({
        name: 'undefined',
        identify: function (value) {
            return typeof value === 'undefined';
        }
    });

    expect.addType({
        name: 'null',
        identify: function (value) {
            return value === null;
        }
    });
}());
