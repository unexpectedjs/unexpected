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
var reduce = shim.reduce;
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
        inspect: function (output, obj, inspect) {
            var keys = getKeys(obj);
            if (keys.length === 0) {
                return output.text('{}');
            }

            var inspectedItems = map(keys, function (key) {
                var propertyOutput = output.clone();
                if (key.match(/["' ]/)) {
                    propertyOutput.append(expect.inspect(key));
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
        diff: function (actual, expected, output, diff, inspect) {
            var result = {
                diff: output,
                inline: true
            };

            var keyIndex = reduce([].concat(getKeys(actual), getKeys(expected)), function (result, key) {
                result[key] = key;
                return result;
            }, {});

            var keys = getKeys(keyIndex);

            output.text('{').nl().indentLines();

            forEach(keys, function (key, index) {
                output.i().block(function () {
                    var valueOutput;
                    var annotation = output.clone();
                    if (!expect.equal(actual[key], expected[key])) {
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
                                valueOutput = keyDiff.diff;
                            }
                        }
                    }

                    var last = index === keys.length - 1;
                    if (!valueOutput) {
                        valueOutput = expect.inspect(actual[key], 1);
                    }

                    this.key(key).text(':').sp()
                        .block(valueOutput.text(last ? ' ' : ','))
                        .block(annotation.prependLinesWith(function () {
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

        if (typeA !== 'object' || !a || !a) {
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
        diff: function (actual, expected, output, diff, inspect) {
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
                return expect.equal(a, b) || structurallySimilar(a, b);
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
                                this.error('//').sp();
                            });
                    } else if (type === 'remove') {
                        this.block(inspect(diffItem.value).text(last ? ' ' : ', ').error('// should be removed'));
                    } else if (expect.equal(diffItem.value, diffItem.expected)) {
                        this.block(inspect(diffItem.value).text(last ? ' ' : ', '));
                    } else {
                        var valueDiff = diff(diffItem.value, diffItem.expected);
                        if (valueDiff && valueDiff.inline) {
                            this.block(valueDiff.diff.text(last ? ' ' : ', '));
                        } else if (valueDiff) {
                            this.block(inspect(diffItem.value).text(last ? ' ' : ', ')).block(function () {
                                this.error('should be: ').append(inspect(diffItem.expected)).nl()
                                    .append(valueDiff.diff)
                                    .prependLinesWith(function () {
                                        this.sp().error('//').sp();
                                    });
                            });
                        } else {
                            this.block(inspect(diffItem.value).text(last ? ' ' : ', ')).block(function () {
                                this.error('should be: ').append(inspect(diffItem.expected))
                                    .prependLinesWith(function () {
                                        this.sp().error('//').sp();
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
        inspect: function (output, value, inspect) {
            var errorObject = extend({
                message: value.message
            }, value);
            return output.text('[Error: ').append(inspect(output.clone(), errorObject)).text(']');
        },
        diff: function (a, b, output, diff) {
            return diff(extend({
                message: a.message
            }, a), extend({
                message: b.message
            }, b), output);
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
        }
    });

    expect.addType({
        base: 'function',
        name: 'expect.fn',
        identify: function (f) {
            return typeof f === 'function' && f._expectFn;
        },
        inspect: function (output, f, inspect) {
            output.text('expect.fn(');
            forEach(f._arguments, function (arg, i) {
                if (0 < i) {
                    output.text(', ');
                }
                inspect(output, arg);
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
        inspect: function (output, regExp) {
            return output.regexp(regExp);
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
            inspect: function (output, uint8Array) {
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
            inspect: function (output, uint16Array) {
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
                            forEach(part.value.split(/(\r)/g), function (item) {
                                if (item === '\r') {
                                    newLine.text('\\r', 'bgGreen, cyan, bold');
                                } else {
                                    newLine.text(item, 'bgGreen, white');
                                }
                            });
                        } else if (part.removed) {
                            forEach(part.value.split(/(\r)/g), function (item) {
                                if (item === '\r') {
                                    oldLine.text('\\r', 'bgRed, cyan, bold');
                                } else {
                                    oldLine.text(item, 'bgRed, white');
                                }
                            });
                        } else {
                            newLine.green(part.value);
                            oldLine.red(part.value);
                        }
                    });
                    oldLine.prependLinesWith(output.clone().red('-'));
                    newLine.prependLinesWith(output.clone().green('+'));

                    if (oldEndsWithNewline && !newEndsWithNewline) {
                        oldLine.text('\\n', 'bgRed, cyan, bold');
                    }

                    if (newEndsWithNewline && !oldEndsWithNewline) {
                        newLine.text('\\n', 'bgGreen, cyan, bold');
                    }

                    output.append(oldLine).nl().append(newLine);
                    if (oldEndsWithNewline && index < diffLines.length - 1) {
                        output.nl();
                    }
                } else if (part.added) {
                    output.text(part.value.replace(/^(.)/gm, '+$1'), 'green');
                } else if (part.removed) {
                    output.text(part.value.replace(/^(.)/gm, '-$1'), 'red');
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
