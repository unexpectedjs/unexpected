/*global namespace*/
(function () {
    var expect = namespace.expect;

    var utils = namespace.utils;
    var isRegExp = utils.isRegExp;

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
                $date: this.inspect(date)
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
                $function: this.inspect(f)
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
                $regExp: this.inspect(regExp)
            };
        }
    });

    if (typeof Buffer !== 'undefined') {
        expect.addType({
            identify: Buffer.isBuffer,
            equal: function (a, b) {
                if (a.length !== b.length) return false;

                for (var i = 0; i < a.length; i += 1) {
                    if (a[i] !== b[i]) return false;
                }

                return true;
            },
            getHexDumpLines: function (buffer, width) {
                var hexDumpLines = [];
                if (typeof width !== 'number') {
                    width = 16;
                } else if (width === 0) {
                    width = buffer.length;
                }
                for (var i = 0 ; i < buffer.length ; i += width) {
                    var hexChars = '',
                        asciiChars = ' |';

                    for (var j = 0 ; j < width ; j += 1) {
                        if (i + j < buffer.length) {
                            var octet = buffer[i + j];
                            hexChars += (octet < 16 ? '0' : '') + octet.toString(16).toUpperCase() + ' ';
                            asciiChars += (octet >= 32 && octet < 127) ? String.fromCharCode(octet) : '.';
                        } else {
                            hexChars += '   ';
                        }
                    }

                    asciiChars += '|';
                    hexDumpLines.push(hexChars + asciiChars);
                }
                return hexDumpLines;
            },
            inspect: function (buffer) {
                var inspectedContents,
                    maxLength = 20;
                if (buffer.length > maxLength) {
                    inspectedContents = this.getHexDumpLines(buffer.slice(0, maxLength), 0) + ' (+' + (buffer.length - maxLength) + ')';
                } else {
                    inspectedContents = this.getHexDumpLines(buffer, 0).join('\n');
                }
                return '[Buffer ' + inspectedContents + ']';
            },
            toJSON: function (buffer) {
                return {
                    $buffer: this.getHexDumpLines(buffer)
                };
            }
        });
    }
}());
