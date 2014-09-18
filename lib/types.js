var utils = require('./utils');
var isRegExp = utils.isRegExp;
var leftPad = utils.leftPad;
var extend = utils.extend;
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

            if (b.constructor !== a.constructor) {
                return false;
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
            var keys = Object.keys(obj);
            if (keys.length === 0) {
                return output.text('{}');
            }

            var inspectedItems = keys.map(function (key) {
                var propertyOutput = output.clone();
                if (/^[a-z\$\_][a-z0-9\$\_]*$/i.test(key)) {
                    propertyOutput.key(key);
                } else {
                    propertyOutput.append(inspect(key, depth));
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
            var multipleLines = inspectedItems.some(function (o) {
                var size = o.size();
                width += size.width;
                return width > 50 || size.height > 1;
            });

            inspectedItems.forEach(function (inspectedItem, index) {
                var lastIndex = index === inspectedItems.length - 1;

                if (!lastIndex) {
                    inspectedItem.text(',');
                }
            });

            if (multipleLines) {
                output.text('{').nl().indentLines();

                inspectedItems.forEach(function (inspectedItem, index) {
                    output.i().block(inspectedItem).nl();
                });

                output.outdentLines().text('}');
            } else {
                output.text('{ ');
                inspectedItems.forEach(function (inspectedItem, index) {
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
            if (actual.constructor !== expected.constructor) {
                return {
                    diff: output.text('Mismatching constructors ')
                        .text(actual.constructor.name || actual.constructor)
                        .text(' should be ').text(expected.constructor.name || expected.constructor),
                    inline: false
                };
            }

            var result = {
                diff: output,
                inline: true
            };

            var keyIndex = {};
            Object.keys(actual).concat(Object.keys(expected)).forEach(function (key) {
                if (!(key in result)) {
                    keyIndex[key] = key;
                }
            });

            var keys = Object.keys(keyIndex);

            output.text('{').nl().indentLines();

            keys.forEach(function (key, index) {
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

                    if (/^[a-z\$\_][a-z0-9\$\_]*$/i.test(key)) {
                        this.key(key);
                    } else {
                        this.append(inspect(key));
                    }
                    this.text(':').sp();
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

        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        var numberOfSimilarKeys = 0;
        var requiredSimilarKeys = Math.round(Math.max(aKeys.length, bKeys.length) / 2);
        return aKeys.concat(bKeys).some(function (key) {
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
            return a === b || (a.length === b.length && a.every(function (v, index) {
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

            if (utils.isArguments(arr)) {
                arr = Array.prototype.slice.call(arr);
            }

            var inspectedItems = arr.map(function (v) {
                return inspect(v);
            });

            var width = 0;
            var multipleLines = inspectedItems.some(function (o) {
                var size = o.size();
                width += size.width;
                return width > 50 || o.height > 1;
            });

            inspectedItems.forEach(function (inspectedItem, index) {
                var lastIndex = index === inspectedItems.length - 1;
                if (!lastIndex) {
                    inspectedItem.text(',');
                }
            });

            if (multipleLines) {
                output.text('[').nl().indentLines();

                inspectedItems.forEach(function (inspectedItem, index) {
                    output.i().block(inspectedItem).nl();
                });

                output.outdentLines().text(']');
            } else {
                output.text('[ ');
                inspectedItems.forEach(function (inspectedItem, index) {
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

            if (utils.isArguments(actual)) {
                actual = Array.prototype.slice.call(actual);
            }

            if (utils.isArguments(expected)) {
                expected = Array.prototype.slice.call(expected);
            }

            var mutatedArray = actual.map(function (v) {
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

            var removes = itemsDiff.filter(function (diffItem) {
                return diffItem.type === 'remove';
            });

            var removesByIndex = {};
            var removedItems = 0;
            removes.forEach(function (diffItem) {
                var removeIndex = removedItems + diffItem.index;
                mutatedArray.slice(removeIndex, diffItem.howMany + removeIndex).forEach(function (v) {
                    v.type = 'remove';
                });
                removedItems += diffItem.howMany;
                removesByIndex[diffItem.index] = removedItems;
            });

            removedItems = 0;
            actual.forEach(function (_, index) {
                removedItems += removesByIndex[index] || 0;
                removeTable[index] = removedItems;
            });

            var moves = itemsDiff.filter(function (diffItem) {
                return diffItem.type === 'move';
            });

            var movedItems = 0;
            moves.forEach(function (diffItem) {
                var moveFromIndex = offsetIndex(diffItem.from);
                var removed = mutatedArray.slice(moveFromIndex, diffItem.howMany + moveFromIndex);
                var added = removed.map(function (v) {
                    return utils.extend({}, v, { type: 'insert' });
                });
                removed.forEach(function (v) {
                    v.type = 'remove';
                });
                Array.prototype.splice.apply(mutatedArray, [offsetIndex(diffItem.to), 0].concat(added));
                movedItems += diffItem.howMany;
                removesByIndex[diffItem.from] = movedItems;
            });

            removedItems = 0;
            actual.forEach(function (_, index) {
                removedItems += removesByIndex[index] || 0;
                removeTable[index] = removedItems;
            });

            var inserts = itemsDiff.filter(function (diffItem) {
                return diffItem.type === 'insert';
            });

            inserts.forEach(function (diffItem) {
                var added = diffItem.values.map(function (v) {
                    return {
                        type: 'insert',
                        value: v
                    };
                });
                Array.prototype.splice.apply(mutatedArray, [offsetIndex(diffItem.index), 0].concat(added));
            });

            var offset = 0;
            mutatedArray.forEach(function (diffItem, index) {
                var type = diffItem.type;
                if (type === 'remove') {
                    offset -= 1;
                } else if (type === 'similar') {
                    diffItem.expected = expected[offset + index];
                }
            });

            output.text('[').nl().indentLines();

            mutatedArray.forEach(function (diffItem, index) {
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
            var source = f.toString();
            var matchSource = source.match(/^function (\w*)?\s*\(([^\)]*)\)\s*\{([\s\S]*?( *)?)\}$/);
            if (matchSource) {
                var name = matchSource[1];
                var args = matchSource[2];
                var body = matchSource[3];
                var bodyIndent = matchSource[4] || '';
                if (!/\\\n/.test(body)) {
                    body = body.replace(new RegExp('^ {' + bodyIndent.length + '}', 'mg'), '');
                }
                if (!name || name === 'anonymous') {
                    name = '';
                }
                if (/^\s*\[native code\]\s*$/.test(body)) {
                    body = ' /* native code */ ';
                } else {
                    body = body.replace(/^((?:.*\n){3}( *).*\n)[\s\S]*?\n((?:.*\n){3})$/, '$1$2// ... lines removed ...\n$3');
                }
                output.code('function ' + name + '(' + args + ') {' + body + '}', 'javascript');
            } else {
                if (f.name) {
                    output.sp().code(f.name, 'javascript');
                }
                output.text('(...) {...}');
            }
            return output;
        }
    });

    expect.addType({
        base: 'function',
        name: 'expect.it',
        identify: function (f) {
            return typeof f === 'function' && f._expectIt;
        },
        inspect: function (f, depth, output, inspect) {
            output.text('expect.it(');
            f._expectations.forEach(function (expectation, index) {
                if (0 < index) {
                    output.text(').and(');
                }

                var args = Array.prototype.slice.call(expectation);
                args.forEach(function (arg, i) {
                    if (0 < i) {
                        output.text(', ');
                    }
                    output.append(inspect(arg));
                });
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

    expect.addType({
        name: 'binaryArray',
        base: 'array',
        digitWidth: 2,
        hexDumpWidth: 16,
        identify: function () {
            return false;
        },
        equal: function (a, b) {
            if (a === b) {
                return true;
            }

            if (a.length !== b.length) return false;

            for (var i = 0; i < a.length; i += 1) {
                if (a[i] !== b[i]) return false;
            }

            return true;
        },
        hexDump: function (obj, maxLength) {
            var hexDump = '';
            if (typeof maxLength !== 'number' || maxLength === 0) {
                maxLength = obj.length;
            }
            for (var i = 0 ; i < maxLength ; i += this.hexDumpWidth) {
                if (hexDump.length > 0) {
                    hexDump += '\n';
                }
                var hexChars = '',
                    asciiChars = ' │';

                for (var j = 0 ; j < this.hexDumpWidth ; j += 1) {
                    if (i + j < maxLength) {
                        var octet = obj[i + j];
                        hexChars += leftPad(octet.toString(16).toUpperCase(), this.digitWidth, '0') + ' ';
                        asciiChars += String.fromCharCode(octet);
                    } else if (this.digitWidth === 2) {
                        hexChars += '   ';
                    }
                }

                if (this.digitWidth === 2) {
                    hexDump += hexChars + asciiChars + '│';
                } else {
                    hexDump += hexChars.replace(/\s+$/, '');
                }
            }
            return hexDump;
        },
        inspect: function (obj, depth, output) {
            var codeStr = this.name + '([';
            for (var i = 0 ; i < Math.min(this.hexDumpWidth, obj.length) ; i += 1) {
                if (i > 0) {
                    codeStr += ', ';
                }
                var octet = obj[i];
                codeStr += '0x' + leftPad(octet.toString(16).toUpperCase(), this.digitWidth, '0');
            }
            if (obj.length > this.hexDumpWidth) {
                codeStr += ' /* ' + (obj.length - this.hexDumpWidth) + ' more */ ';
            }
            codeStr += '])';
            return output.code(codeStr, 'javascript');
        },
        diff: function (actual, expected, output, diff, inspect) {
            var result = {
                diff: utils.diffStrings(this.hexDump(actual), this.hexDump(expected), output, {type: 'Chars', markUpSpecialCharacters: false})
            };
            for (var i = 0 ; i < result.diff.output.length ; i += 1) {
                var isInAsciiChars = false;
                for (var j = 0 ; j < result.diff.output[i].length ; j += 1) {
                    var obj = result.diff.output[i][j];
                    var replacement = '';
                    for (var k = 0 ; k < obj.args[0].length ; k += 1) {
                        var ch = obj.args[0].charAt(k);
                        if (ch === '│') {
                            isInAsciiChars = true;
                        } else if (isInAsciiChars) {
                            if (/[\x00-\x1f\x7f-\xff]/.test(ch)) {
                                ch = '.';
                            }
                        } else if (ch === ' ' && /\bbg/.test(obj.args[1])) {
                            var leftover = obj.args[0].substr(k + 1);
                            if (replacement) {
                                obj.args[0] = replacement;
                                j += 1;
                            }
                            replacement = '';
                            result.diff.output[i].splice(j, 0, {style: 'text', args: [' ', 'white']});
                            k = 0;
                            ch = ' ';
                            if (leftover.length > 0) {
                                result.diff.output[i].splice(j + 1, 0, {style: 'text', args: [leftover, obj.args[1]]});
                            }
                            obj = result.diff.output[i][j];
                        }
                        replacement += ch;
                    }
                    obj.args[0] = replacement;
                }
            }
            return result;
        }
    });

    if (typeof Buffer !== 'undefined') {
        expect.addType({
            name: 'Buffer',
            base: 'binaryArray',
            identify: Buffer.isBuffer
        });
    }

    [8, 16, 32].forEach(function (numBits) {
        ['Int', 'Uint'].forEach(function (intOrUint) {
            var constructorName = intOrUint + numBits + 'Array',
                Constructor = this[constructorName];
            if (typeof Constructor !== 'undefined') {
                expect.addType({
                    name: constructorName,
                    base: 'binaryArray',
                    hexDumpWidth: 128 / numBits,
                    digitWidth: numBits / 4,
                    identify: function (obj) {
                        return obj instanceof Constructor;
                    }
                });
            }
        }, this);
    }, this);

    expect.addType({
        name: 'string',
        identify: function (value) {
            return typeof value === 'string';
        },
        inspect: function (value, depth, output) {
            return output.strings('\'')
                .strings(JSON.stringify(value).replace(/^"|"$/g, '')
                      .replace(/'/g, "\\'")
                      .replace(/\\"/g, '"'))
                .strings('\'');
        },
        diff: function (actual, expected, output, diff, inspect) {
            var result = {
                diff: output,
                inline: false
            };
            utils.diffStrings(actual, expected, output, {type: 'WordsWithSpace', markUpSpecialCharacters: true});
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
