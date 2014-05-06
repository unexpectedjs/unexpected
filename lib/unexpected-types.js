/*global namespace, Uint8Array, Uint16Array*/
(function () {
    var expect = namespace.expect;

    var utils = namespace.utils;
    var isRegExp = utils.isRegExp;
    var leftPad = utils.leftPad;

    expect.addType({
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
        identify: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Error]';
        },
        equal: function (a, b) {
            if (a.message !== b.message) {
                return false;
            }
            return null;
        },
        inspect: function (error) {
            return '[Error ' + error.message + ']';
        },
        toJSON: function (error) {
            var obj = {};
            if ('message' in error) {
                // Not enumerable, so has to be copied separately
                obj.message = error.message;
            }
            for (var propertyName in error) {
                obj[propertyName] = error[propertyName];
            }
            return {
                $Error: obj
            };
        }
    });

    expect.addType({
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
        identify: isRegExp,
        equal: function (a, b) {
            return a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
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
        if (a.length !== b.length) return false;

        for (var i = 0; i < a.length; i += 1) {
            if (a[i] !== b[i]) return false;
        }

        return true;
    }

    if (typeof Buffer !== 'undefined') {
        expect.addType({
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
}());
