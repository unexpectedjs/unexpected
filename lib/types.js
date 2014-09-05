/*global Uint8Array, Uint16Array*/

var utils = require('./utils');
var isRegExp = utils.isRegExp;
var leftPad = utils.leftPad;
var shim = require('./shim');
var json = shim.JSON;
var every = shim.every;
var some = shim.some;
var forEach = shim.forEach;
var filter = shim.filter;
var map = shim.map;
var getKeys = shim.getKeys;
var extend = utils.extend;
var stringDiff = require('diff');
var arrayDiff = require('arraydiff');

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
        inspect: function (obj, depth, output, inspect) {
            var keys = getKeys(obj);
            if (keys.length === 0) {
                return output.text('{}');
            }

            var inspectedItems = map(keys, function (key) {
                var propertyOutput = output.clone();
                if (key.match(/["' ]/)) {
                    propertyOutput.append(inspect(key));
                } else {
                    propertyOutput.key(key);
                }
                propertyOutput.text(':');

                var hasGetter = obj.__lookupGetter__ && obj.__lookupGetter__(key);
                var hasSetter = obj.__lookupGetter__ && obj.__lookupSetter__(key);

                if (hasGetter || !hasSetter) {
                    propertyOutput.sp().append(inspect(obj[key]));
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
        diff: function (actual, expected, output, diff, inspect, equal) {
            var result = {
                diff: output,
                inline: true
            };

            var keyIndex = {};
            forEach([].concat(getKeys(actual), getKeys(expected)), function (key) {
                if (!(key in result)) {
                    keyIndex[key] = key;
                }
            });

            var keys = getKeys(keyIndex);

            output.text('{').nl().indentLines();

            forEach(keys, function (key, index) {
                output.i().block(function () {
                    var valueOutput;
                    var annotation = output.clone();
                    var conflicting = !equal(actual[key], expected[key]);
                    var isInlineDiff = false;
                    if (conflicting) {
                        if (!(key in expected)) {
                            annotation.error('should be removed');
                        } else {
                            var keyDiff = diff(actual[key], expected[key]);
                            if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                annotation.error('should be: ')
                                    .block(inspect(expected[key]));

                                if (keyDiff) {
                                    annotation.nl().append(keyDiff.diff);
                                }
                            } else {
                                isInlineDiff = true;
                                valueOutput = keyDiff.diff;
                            }
                        }
                    }

                    var last = index === keys.length - 1;
                    if (!valueOutput) {
                        valueOutput = inspect(actual[key], conflicting ? Infinity : 1);
                    }

                    this.key(key).text(':').sp();
                    valueOutput.text(last ? '' : ',');
                    if (isInlineDiff) {
                        this.append(valueOutput);
                    } else {
                        this.block(valueOutput);
                    }
                    this.block(annotation.prependLinesWith(function () {
                        this.sp().error('//').sp();
                    }));
                }).nl();
            });

            output.outdentLines().text('}');

            return result;
        }
    });

    function structurallySimilar(a, b) {
        var typeA = typeof a;
        var typeB = typeof b;

        if (typeA !== typeB) {
            return false;
        }

        if (typeA === 'string') {
            return utils.levenshteinDistance(a, b) < a.length / 2;
        }

        if (typeA !== 'object' || !a) {
            return false;
        }

        if (utils.isArray(a) && utils.isArray(b)) {
            return true;
        }

        var aKeys = getKeys(a);
        var bKeys = getKeys(b);
        var numberOfSimilarKeys = 0;
        var requiredSimilarKeys = Math.round(Math.max(aKeys.length, bKeys.length) / 2);
        return some([].concat(aKeys, bKeys), function (key) {
            if (key in a && key in b) {
                numberOfSimilarKeys += 1;
            }

            return numberOfSimilarKeys >= requiredSimilarKeys;
        });
    }


    expect.addType({
        name: 'array',
        base: 'object',
        identify: function (arr) {
            return utils.isArray(arr) || utils.isArguments(arr);
        },
        equal: function (a, b, equal) {
            return a === b || (a.length === b.length && every(a, function (v, index) {
                return equal(v, b[index]);
            }));
        },
        inspect: function (arr, depth, output, inspect) {
            if (arr.length === 0) {
                return output.text('[]');
            }

            if (depth === 1) {
                return output.text('[...]');
            }

            var inspectedItems = map(arr, function (v) {
                return inspect(v);
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
        diff: function (actual, expected, output, diff, inspect, equal) {
            var result = {
                diff: output,
                inline: true
            };

            var mutatedArray = map(actual, function (v) {
                return {
                    type: 'similar',
                    value: v
                };
            });

            if (mutatedArray.length > 0) {
                mutatedArray[mutatedArray.length - 1].last = true;
            }

            var itemsDiff = arrayDiff(actual, expected, function (a, b) {
                return equal(a, b) || structurallySimilar(a, b);
            });

            var removeTable = [];
            function offsetIndex(index) {
                return index + (removeTable[index - 1] || 0);
            }

            var removes = filter(itemsDiff, function (diffItem) {
                return diffItem.type === 'remove';
            });

            var removesByIndex = {};
            var removedItems = 0;
            forEach(removes, function (diffItem) {
                var removeIndex = removedItems + diffItem.index;
                forEach(mutatedArray.slice(removeIndex, diffItem.howMany + removeIndex), function (v) {
                    v.type = 'remove';
                });
                removedItems += diffItem.howMany;
                removesByIndex[diffItem.index] = removedItems;
            });

            removedItems = 0;
            forEach(actual, function (_, index) {
                removedItems += removesByIndex[index] || 0;
                removeTable[index] = removedItems;
            });

            var moves = filter(itemsDiff, function (diffItem) {
                return diffItem.type === 'move';
            });

            var movedItems = 0;
            forEach(moves, function (diffItem) {
                var moveFromIndex = offsetIndex(diffItem.from);
                var removed = mutatedArray.slice(moveFromIndex, diffItem.howMany + moveFromIndex);
                var added = map(removed, function (v) {
                    return utils.extend({}, v, { type: 'insert' });
                });
                forEach(removed, function (v) {
                    v.type = 'remove';
                });
                Array.prototype.splice.apply(mutatedArray, [offsetIndex(diffItem.to), 0].concat(added));
                movedItems += diffItem.howMany;
                removesByIndex[diffItem.from] = movedItems;
            });

            removedItems = 0;
            forEach(actual, function (_, index) {
                removedItems += removesByIndex[index] || 0;
                removeTable[index] = removedItems;
            });

            var inserts = filter(itemsDiff, function (diffItem) {
                return diffItem.type === 'insert';
            });

            forEach(inserts, function (diffItem) {
                var added = map(diffItem.values, function (v) {
                    return {
                        type: 'insert',
                        value: v
                    };
                });
                Array.prototype.splice.apply(mutatedArray, [offsetIndex(diffItem.index), 0].concat(added));
            });

            var offset = 0;
            forEach(mutatedArray, function (diffItem, index) {
                var type = diffItem.type;
                if (type === 'remove') {
                    offset -= 1;
                } else if (type === 'similar') {
                    diffItem.expected = expected[offset + index];
                }
            });

            output.text('[').nl().indentLines();

            forEach(mutatedArray, function (diffItem, index) {
                output.i().block(function () {
                    var type = diffItem.type;
                    var last = !!diffItem.last;

                    if (type === 'insert') {
                        this.error('missing: ').block(inspect(diffItem.value))
                            .prependLinesWith(function () {
                                this.error('// ');
                            });
                    } else if (type === 'remove') {
                        this.block(inspect(diffItem.value).text(last ? '' : ',').error(' // should be removed'));
                    } else if (equal(diffItem.value, diffItem.expected)) {
                        this.block(inspect(diffItem.value).text(last ? '' : ','));
                    } else {
                        var valueDiff = diff(diffItem.value, diffItem.expected);
                        if (valueDiff && valueDiff.inline) {
                            this.block(valueDiff.diff.text(last ? '' : ','));
                        } else if (valueDiff) {
                            this.block(inspect(diffItem.value).text(last ? '' : ',')).block(function () {
                                this.error('should be: ').append(inspect(diffItem.expected)).nl()
                                    .append(valueDiff.diff)
                                    .prependLinesWith(function () {
                                        this.sp().error('// ');
                                    });
                            });
                        } else {
                            this.block(inspect(diffItem.value).text(last ? '' : ',')).block(function () {
                                this.error('should be: ').append(inspect(diffItem.expected))
                                    .prependLinesWith(function () {
                                        this.sp().error('// ');
                                    });
                            });
                        }
                    }
                }).nl();
            });

            output.outdentLines().text(']');

            return result;
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
        inspect: function (value, depth, output, inspect) {
            var errorObject = extend({
                message: value.message
            }, value);
            return output.text('[Error: ').append(inspect(errorObject, depth)).text(']');
        },
        diff: function (actual, expected, output, diff) {
            return diff(extend({
                message: actual.message
            }, actual), extend({
                message: expected.message
            }, expected));
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
        inspect: function (date, depth, output) {
            return output.text('[Date ').text(date.toUTCString()).text(']');
        }
    });

    expect.addType({
        base: 'object',
        name: 'function',
        identify: function (f) {
            return typeof f === 'function';
        },
        equal: function (a, b) {
            return a === b || a.toString() === b.toString();
        },
        inspect: function (f, depth, output) {
            output.text('[Function');
            if (f.name) {
                output.text(': ').text(f.name);
            }
            output.text(']');
            return output;
        }
    });

    expect.addType({
        base: 'function',
        name: 'expect.fn',
        identify: function (f) {
            return typeof f === 'function' && f._expectFn;
        },
        inspect: function (f, depth, output, inspect) {
            output.text('expect.fn(');
            forEach(f._arguments, function (arg, i) {
                if (0 < i) {
                    output.text(', ');
                }
                output.append(inspect(arg));
            });
            output.text(')');
            return output;
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
        inspect: function (regExp, depth, output) {
            return output.regexp(regExp);
        }
    });

    expect.addType({
        name: 'DomElement',
        identify: function (value) {
            return utils.isDOMElement(value);
        },
        inspect: function (value, depth, output) {
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
            inspect: function (buffer, depth, output) {
                output.text('[Buffer ');
                inspectBufferLikeObject(output, buffer);
                return output.text(']');
            },
            diff: function (actual, expected, output, diff, inspect) {
                return diff(getHexDumpLinesForBufferLikeObject(actual).join('\n'),
                            getHexDumpLinesForBufferLikeObject(expected).join('\n'));
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
            inspect: function (uint8Array, depth, output) {
                output.text('[Uint8Array ');
                inspectBufferLikeObject(output, uint8Array);
                return output.text(']');
            },
            diff: function (actual, expected, output, diff, inspect) {
                return diff(getHexDumpLinesForBufferLikeObject(actual).join('\n'),
                            getHexDumpLinesForBufferLikeObject(expected).join('\n'));
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
            inspect: function (uint16Array, depth, output) {
                output.text('[Uint16Array ');
                inspectBufferLikeObject(output, uint16Array, 4);
                return output.text(']');
            },
            diff: function (actual, expected, output, diff, inspect) {
                return diff(getHexDumpLinesForBufferLikeObject(actual).join('\n'),
                            getHexDumpLinesForBufferLikeObject(expected).join('\n'));
            }
        });
    }

    var specialCharRegexp = /([\x00-\x09\x0B-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BA-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF])/g;
    function escapeChar(ch) {
        if (ch === '\t') {
            return '\\t';
        } else if (ch === '\r') {
            return '\\r';
        } else {
            var charCode = ch.charCodeAt(0);
            var hexChars = charCode.toString(16).toUpperCase();
            if (charCode < 256) {
                return '\\x' + leftPad(hexChars, 2, '0');
            } else {
                return '\\u' + leftPad(hexChars, 4, '0');
            }
        }
    }

    function markUpSpecialCharacters(output, text, specialCharStyle, baseStyle) {
        forEach(text.split(specialCharRegexp), function (part) {
            if (specialCharRegexp.test(part)) {
                output.write(specialCharStyle, escapeChar(part));
            } else {
                output.write(baseStyle, part);
            }
        });
        return output;
    }

    expect.addType({
        name: 'string',
        identify: function (value) {
            return typeof value === 'string';
        },
        inspect: function (value, depth, output) {
            return output.strings('\'')
                .strings(json.stringify(value).replace(/^"|"$/g, '')
                      .replace(/'/g, "\\'")
                      .replace(/\\"/g, '"'))
                .strings('\'');
        },
        diff: function (actual, expected, output, diff, inspect) {
            var result = {
                diff: output,
                inline: false
            };

            var diffLines = [];
            var lastPart;
            forEach(stringDiff.diffLines(actual, expected), function (part) {
                if (lastPart && lastPart.added && part.removed) {
                    diffLines.push({
                        oldValue: part.value,
                        newValue: lastPart.value,
                        replaced: true
                    });
                    lastPart = null;
                } else if (lastPart) {
                    diffLines.push(lastPart);
                    lastPart = part;
                } else {
                    lastPart = part;
                }
            });
            if (lastPart) {
                diffLines.push(lastPart);
            }

            forEach(diffLines, function (part, index) {
                var endsWithNewline = /\n$/.test(part.value);
                var value;
                if (part.replaced) {
                    var oldLine = output.clone();
                    var newLine = output.clone();
                    var oldValue = part.oldValue;
                    var newValue = part.newValue;
                    var oldEndsWithNewline = oldValue.slice(-1) === '\n';
                    var newEndsWithNewline = newValue.slice(-1) === '\n';
                    if (oldEndsWithNewline) {
                        oldValue = oldValue.slice(0, -1);
                    }
                    if (newEndsWithNewline) {
                        newValue = newValue.slice(0, -1);
                    }

                    forEach(stringDiff.diffWordsWithSpace(oldValue, newValue), function (part) {
                        if (part.added) {
                            markUpSpecialCharacters(newLine, part.value, 'diffAddedSpecialChar', 'diffAddedHighlight');
                        } else if (part.removed) {
                            markUpSpecialCharacters(oldLine, part.value, 'diffRemovedSpecialChar', 'diffRemovedHighlight');
                        } else {
                            newLine.diffAddedLine(part.value);
                            oldLine.diffRemovedLine(part.value);
                        }
                    });
                    oldLine.prependLinesWith(output.clone().diffRemovedLine('-'));
                    newLine.prependLinesWith(output.clone().diffAddedLine('+'));

                    if (oldEndsWithNewline && !newEndsWithNewline) {
                        oldLine.diffRemovedSpecialChar('\\n');
                    }

                    if (newEndsWithNewline && !oldEndsWithNewline) {
                        newLine.diffAddedSpecialChar('\\n');
                    }

                    output.append(oldLine).nl().append(newLine);
                    if (oldEndsWithNewline && index < diffLines.length - 1) {
                        output.nl();
                    }
                } else if (part.added) {
                    value = endsWithNewline ?
                        part.value.slice(0, -1) :
                        part.value;

                    output.append(function () {
                        markUpSpecialCharacters(this, value, 'diffAddedLine', 'diffAddedLine').prependLinesWith(function () {
                            this.diffAddedLine('+');
                        });
                    });

                    if (endsWithNewline) {
                        output.nl();
                    }
                } else if (part.removed) {
                    value = endsWithNewline ?
                        part.value.slice(0, -1) :
                        part.value;

                    output.append(function () {
                        markUpSpecialCharacters(this, value, 'diffRemovedLine', 'diffRemovedLine').prependLinesWith(function () {
                            this.diffRemovedLine('-');
                        });
                    });

                    if (endsWithNewline) {
                        output.nl();
                    }
                } else {
                    output.text(part.value.replace(/^(.)/gm, ' $1'));
                }
            });

            return result;
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
