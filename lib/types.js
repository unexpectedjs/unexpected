/*global Uint8Array, Uint16Array*/

var utils = require('./utils');
var isRegExp = utils.isRegExp;
var leftPad = utils.leftPad;
var shim = require('./shim');
var json = shim.JSON;
var every = shim.every;
var some = shim.some;
var forEach = shim.forEach;
var map = shim.map;
var getKeys = shim.getKeys;
var reduce = shim.reduce;
var extend = utils.extend;

module.exports = function (expect) {
    expect.addType({
        name: 'object',
        identify: function (obj) {
            return obj && typeof obj === 'object';
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
        inspect: function (output, obj, inspect) {
            var keys = getKeys(obj);
            if (keys.length === 0) {
                return output.text('{}');
            }

            var inspectedItems = map(keys, function (key) {
                var propertyOutput = output.clone();
                if (key.match(/["' ]/)) {
                    propertyOutput.strings(expect.inspect(key));
                } else {
                    propertyOutput.key(key);
                }
                propertyOutput.text(':');

                var hasGetter = obj.__lookupGetter__ && obj.__lookupGetter__(key);
                var hasSetter = obj.__lookupGetter__ && obj.__lookupSetter__(key);

                if (hasGetter || !hasSetter) {
                    propertyOutput.sp().append(inspect(propertyOutput.clone(), obj[key]));
                }

                if (hasGetter && hasSetter) {
                    propertyOutput.sp().text('[Getter/Setter]');
                } else if (hasGetter) {
                    propertyOutput.sp().text('[Getter]');
                } else if (hasSetter) {
                    propertyOutput.sp().text('[Setter]');
                }

                return propertyOutput;
            });

            var width = 0;
            var multipleLines = some(inspectedItems, function (o) {
                var size = o.size();
                width += size.width;
                return width > 50 || size.height > 1;
            });

            forEach(inspectedItems, function (inspectedItem, index) {
                var lastIndex = index === inspectedItems.length - 1;

                if (!lastIndex) {
                    inspectedItem.text(',');
                }
            });

            if (multipleLines) {
                output.text('{').nl().indentLines();

                forEach(inspectedItems, function (inspectedItem, index) {
                    output.i().block(inspectedItem).nl();
                });

                output.outdentLines().text('}');
            } else {
                output.text('{ ');
                forEach(inspectedItems, function (inspectedItem, index) {
                    output.append(inspectedItem);
                    var lastIndex = index === inspectedItems.length - 1;
                    if (!lastIndex) {
                        output.sp();
                    }
                });
                output.text(' }');
            }
            return output;
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
        inspect: function (output, arr, inspect, depth) {
            if (arr.length === 0) {
                return output.text('[]');
            }

            if (depth === 1) {
                return output.text('[...]');
            }

            var inspectedItems = map(arr, function (v) {
                return inspect(output.clone(), v);
            });

            var width = 0;
            var multipleLines = some(inspectedItems, function (o) {
                var size = o.size();
                width += size.width;
                return width > 50 || o.height > 1;
            });

            forEach(inspectedItems, function (inspectedItem, index) {
                var lastIndex = index === inspectedItems.length - 1;
                if (!lastIndex) {
                    inspectedItem.text(',');
                }
            });

            if (multipleLines) {
                output.text('[').nl().indentLines();

                forEach(inspectedItems, function (inspectedItem, index) {
                    output.i().block(inspectedItem).nl();
                });

                output.outdentLines().text(']');
            } else {
                output.text('[ ');
                forEach(inspectedItems, function (inspectedItem, index) {
                    output.append(inspectedItem);
                    var lastIndex = index === inspectedItems.length - 1;
                    if (!lastIndex) {
                        output.sp();
                    }
                });
                output.text(' ]');
            }
            return output;
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
        inspect: function (output, value, inspect) {
            var errorObject = extend({
                message: value.message
            }, value);
            return output.text('[Error: ').append(inspect(output.clone(), errorObject)).text(']');
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
        inspect: function (output, date) {
            return output.text('[Date ').text(date.toUTCString()).text(']');
        },
        toJSON: function (date) {
            return {
                $Date: expect.inspect(date)
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
        inspect: function (output, f) {
            output.text('[Function');
            if (f.name) {
                output.text(': ').text(f.name);
            }
            output.text(']');
            return output;
        },
        toJSON: function (f) {
            return {
                $Function: expect.inspect(f)
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
        inspect: function (output, regExp) {
            return output.text(regExp);
        },
        toJSON: function (regExp) {
            return {
                $RegExp: expect.inspect(regExp)
            };
        }
    });

    expect.addType({
        name: 'DomElement',
        identify: function (value) {
            return utils.isDOMElement(value);
        },
        inspect: function (output, value) {
            return output.code(utils.getOuterHTML(value), 'html');
        }
    });

    function getHexDumpLinesForBufferLikeObject(obj, width, digitWidth, maxLength) {
        digitWidth = digitWidth || 2;
        var hexDumpLines = [];
        if (typeof maxLength === 'undefined') {
            maxLength = obj.length;
        }
        if (typeof width !== 'number') {
            width = 16;
        } else if (width === 0) {
            width = maxLength;
        }
        for (var i = 0 ; i < maxLength ; i += width) {
            var hexChars = '',
                asciiChars = ' |';

            for (var j = 0 ; j < width ; j += 1) {
                if (i + j < maxLength) {
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

    function inspectBufferLikeObject(output, buffer, digitWidth, maxLength) {
        if (typeof maxLength !== 'number') {
            maxLength = 20;
        }
        if (buffer.length > maxLength) {
            output.text(getHexDumpLinesForBufferLikeObject(buffer, 0, digitWidth, maxLength))
                .text(' (+').text(buffer.length - maxLength).text(')');

        } else {
            var hexDumpLines = getHexDumpLinesForBufferLikeObject(buffer, 0, digitWidth);
            forEach(hexDumpLines, function (line, i) {
                if (i > 0) {
                    output.nl();
                }
                output.text(line);
            });
        }
        return output;
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
            inspect: function (output, buffer) {
                output.text('[Buffer ');
                inspectBufferLikeObject(output, buffer);
                return output.text(']');
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
            inspect: function (output, uint8Array) {
                output.text('[Uint8Array ');
                inspectBufferLikeObject(output, uint8Array);
                return output.text(']');
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
            inspect: function (output, uint16Array) {
                output.text('[Uint16Array ');
                inspectBufferLikeObject(output, uint16Array, 4);
                return output.text(']');
            },
            toJSON: function (uint16Array) {
                return {
                    $Uint16Array: getHexDumpLinesForBufferLikeObject(uint16Array, 8, 4)
                };
            }
        });
    }

    expect.addType({
        name: 'string',
        identify: function (value) {
            return typeof value === 'string';
        },
        inspect: function (output, value) {
            return output.strings('\'')
                .strings(json.stringify(value).replace(/^"|"$/g, '')
                      .replace(/'/g, "\\'")
                      .replace(/\\"/g, '"'))
                .strings('\'');
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
};
