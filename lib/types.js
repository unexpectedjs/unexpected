var utils = require('./utils');
var isRegExp = utils.isRegExp;
var leftPad = utils.leftPad;
var extend = utils.extend;
var arrayDiff = require('arraydiff');
var leven = require('leven');

module.exports = function (expect) {
    expect.addType({
        name: 'wrapperObject',
        identify: false,
        equal: function (a, b, equal) {
            return a === b || equal(this.unwrap(a), this.unwrap(b));
        },
        inspect: function (value, depth, output, inspect) {
            output.append(this.prefix(output.clone()));
            output.append(inspect(this.unwrap(value)));
            output.append(this.suffix(output.clone()));
        },
        diff: function (actual, expected, output, diff, inspect) {
            actual = this.unwrap(actual);
            expected = this.unwrap(expected);
            var comparison = diff(actual, expected);
            var prefixOutput = this.prefix(output.clone());
            var suffixOutput = this.suffix(output.clone());
            if (comparison && comparison.inline) {
                return {
                    inline: true,
                    diff: output.append(prefixOutput).append(comparison.diff).append(suffixOutput)
                };
            } else {
                return {
                    inline: true,
                    diff: output.append(prefixOutput).nl()
                        .indentLines()
                        .i().block(function () {
                            this.append(inspect(actual)).sp().annotationBlock(function () {
                                this.error('should be ').block(inspect(expected));
                                if (comparison) {
                                    this.nl().append(comparison.diff);
                                }
                            });
                        }).nl()
                        .outdentLines()
                        .append(suffixOutput)
                };
            }
        }
    });

    expect.addType({
        name: 'object',
        identify: function (obj) {
            return obj && (typeof obj === 'object' || typeof obj === 'function');
        },
        getKeys: Object.keys,
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
                return utils.wrapConstructorNameAroundOutput(output.text('{}'), obj);
            }
            var inspectedItems = keys.map(function (key, index) {
                var lastIndex = index === keys.length - 1;

                var hasGetter = obj.__lookupGetter__ && obj.__lookupGetter__(key);
                var hasSetter = obj.__lookupGetter__ && obj.__lookupSetter__(key);
                var propertyOutput = output.clone();
                if (hasSetter && !hasGetter) {
                    propertyOutput.text('set').sp();
                }
                propertyOutput.key(key);
                propertyOutput.text(':');

                // Inspect the setter function if there's no getter:
                var value = (hasSetter && !hasGetter) ? hasSetter : obj[key];
                var inspectedValue = inspect(value);

                if (!lastIndex) {
                    inspectedValue.text(',');
                }

                if (value && value._expectIt) {
                    propertyOutput.sp().block(inspectedValue);
                } else {
                    propertyOutput.sp().append(inspectedValue);
                }
                if (hasGetter && hasSetter) {
                    propertyOutput.sp().comment('/* getter/setter */');
                } else if (hasGetter) {
                    propertyOutput.sp().comment('/* getter */');
                }

                return propertyOutput;
            });

            var width = 0;
            var multipleLines = inspectedItems.some(function (o) {
                var size = o.size();
                width += size.width;
                return width > 50 || size.height > 1;
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
            return utils.wrapConstructorNameAroundOutput(output, obj);
        },
        diff: function (actual, expected, output, diff, inspect, equal) {
            if (actual.constructor !== expected.constructor) {
                return {
                    diff: output.text('Mismatching constructors ')
                        .text(actual.constructor && actual.constructor.name || actual.constructor)
                        .text(' should be ').text(expected.constructor && expected.constructor.name || expected.constructor),
                    inline: false
                };
            }

            var result = {
                diff: output,
                inline: true
            };

            var constructorName = actual.constructor && actual.constructor !== Object && actual.constructor.name;
            if (constructorName) {
                output.text(constructorName + '(');
            }

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
                            isInlineDiff = true;
                        } else {
                            var keyDiff = diff(actual[key], expected[key]);
                            if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                annotation.error('should be ')
                                    .block(inspect(expected[key]));

                                if (keyDiff) {
                                    annotation.nl().append(keyDiff.diff);
                                }
                            } else {
                                isInlineDiff = true;
                                valueOutput = keyDiff.diff;
                            }
                        }
                    } else {
                        isInlineDiff = true;
                    }

                    var last = index === keys.length - 1;
                    if (!valueOutput) {
                        valueOutput = inspect(actual[key], conflicting ? Infinity : 1);
                    }

                    this.key(key);
                    this.text(':').sp();
                    valueOutput.text(last ? '' : ',');
                    if (isInlineDiff) {
                        this.append(valueOutput);
                    } else {
                        this.block(valueOutput);
                    }
                    if (!annotation.isEmpty()) {
                        this.sp().annotationBlock(annotation);
                    }
                }).nl();
            });

            output.outdentLines().text('}');

            if (constructorName) {
                output.text(')');
            }

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
            return leven(a, b) < a.length / 2;
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
        name: 'arrayLike',
        base: 'object',
        identify: false,
        getKeys: function (obj) {
            var keys = new Array(obj.length);
            for (var i = 0 ; i < obj.length ; i += 1) {
                keys[i] = i;
            }
            return keys;
        },
        equal: function (a, b, equal) {
            if (a === b) {
                return true;
            } else if (a.constructor === b.constructor && a.length === b.length) {
                for (var i = 0; i < a.length; i += 1) {
                    if (!equal(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        prefix: function (output) {
            return output.text('[');
        },
        suffix: function (output) {
            return output.text(']');
        },
        inspect: function (arr, depth, output, inspect) {
            var prefixOutput = this.prefix(output.clone(), arr);
            var suffixOutput = this.suffix(output.clone(), arr);
            if (arr.length === 0) {
                return output.append(prefixOutput).append(suffixOutput);
            }

            if (depth === 1) {
                return output.append(prefixOutput).text('...').append(suffixOutput);
            }

            var inspectedItems = new Array(arr.length);
            for (var i = 0; i < arr.length; i += 1) {
                if (i in arr) {
                    inspectedItems[i] = inspect(arr[i]);
                } else {
                    inspectedItems[i] = output.clone();
                }
            }

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
                output.append(prefixOutput).nl().indentLines();

                inspectedItems.forEach(function (inspectedItem, index) {
                    output.i().block(inspectedItem).nl();
                });

                output.outdentLines().append(suffixOutput);
            } else {
                output.append(prefixOutput).sp();
                inspectedItems.forEach(function (inspectedItem, index) {
                    output.append(inspectedItem);
                    var lastIndex = index === inspectedItems.length - 1;
                    if (!lastIndex) {
                        output.sp();
                    }
                });
                output.sp().append(suffixOutput);
            }
        },
        diffLimit: 512,
        diff: function (actual, expected, output, diff, inspect, equal) {
            var result = {
                diff: output,
                inline: true
            };

            if (Math.max(actual.length, expected.length) > this.diffLimit) {
                result.diff.comment('Diff suppressed due to size > ' + this.diffLimit);
                return result;
            }

            if (actual.constructor !== expected.constructor) {
                return this.baseType.diff(actual, expected);
            }

            var mutatedArray = new Array(actual.length);
            for (var k = 0; k < actual.length; k += 1) {
                mutatedArray[k] = {
                    type: 'similar',
                    value: actual[k]
                };
            }

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

            function updateRemoveTable() {
                removedItems = 0;
                actual.forEach(function (_, index) {
                    removedItems += removesByIndex[index] || 0;
                    removeTable[index] = removedItems;
                });
            }

            updateRemoveTable();

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
                updateRemoveTable();
            });

            var inserts = itemsDiff.filter(function (diffItem) {
                return diffItem.type === 'insert';
            });

            inserts.forEach(function (diffItem) {
                var added = new Array(diffItem.values.length);
                for (var i = 0 ; i < diffItem.values.length ; i += 1) {
                    added[i] = {
                        type: 'insert',
                        value: diffItem.values[i]
                    };
                }
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

            var conflicts = mutatedArray.reduce(function (conflicts, item) {
                return item.type === 'similar' ? conflicts : conflicts + 1;
            }, 0);

            for (var i = 0, c = 0; i < Math.max(actual.length, expected.length) &&  c <= conflicts; i += 1) {
                var expectedType = typeof expected[i];
                var actualType = typeof actual[i];

                if (
                    actualType !== expectedType ||
                    ((actualType === 'object' || actualType === 'string') && !structurallySimilar(actual[i], expected[i])) ||
                    (actualType !== 'object' && actualType !== 'string' && !equal(actual[i], expected[i]))
                ) {
                    c += 1;
                }
            }

            if (c <= conflicts) {
                mutatedArray = [];
                var j;
                for (j = 0; j < Math.min(actual.length, expected.length); j += 1) {
                    mutatedArray.push({
                        type: 'similar',
                        value: actual[j],
                        expected: expected[j]
                    });
                }

                if (actual.length < expected.length) {
                    for (; j < Math.max(actual.length, expected.length); j += 1) {
                        mutatedArray.push({
                            type: 'insert',
                            value: expected[j]
                        });
                    }
                } else {
                    for (; j < Math.max(actual.length, expected.length); j += 1) {
                        mutatedArray.push({
                            type: 'remove',
                            value: actual[j]
                        });
                    }
                }
                mutatedArray[mutatedArray.length - 1].last = true;
            }

            mutatedArray.forEach(function (diffItem) {
                if (diffItem.type === 'similar' && equal(diffItem.value, diffItem.expected)) {
                    diffItem.type = 'equal';
                }
            });

            output.append(this.prefix(output.clone())).nl().indentLines();

            mutatedArray.forEach(function (diffItem, index) {
                output.i().block(function () {
                    var type = diffItem.type;
                    var last = !!diffItem.last;

                    if (type === 'insert') {
                        this.annotationBlock(function () {
                            this.error('missing ').block(inspect(diffItem.value));
                        });
                    } else if (type === 'remove') {
                        this.block(inspect(diffItem.value).text(last ? ' ' : ', ').error('// should be removed'));
                    } else if (type === 'equal') {
                        this.block(inspect(diffItem.value).text(last ? '' : ','));
                    } else {
                        var valueDiff = diff(diffItem.value, diffItem.expected);
                        if (valueDiff && valueDiff.inline) {
                            this.block(valueDiff.diff.text(last ? '' : ','));
                        } else if (valueDiff) {
                            this.block(inspect(diffItem.value).text(last ? ' ' : ', ')).annotationBlock(function () {
                                this.error('should be ').block(inspect(diffItem.expected)).nl()
                                    .append(valueDiff.diff);
                            });
                        } else {
                            this.block(inspect(diffItem.value).text(last ? ' ' : ', ')).annotationBlock(function () {
                                this.error('should be ').block(inspect(diffItem.expected));
                            });
                        }
                    }
                }).nl();
            });

            output.outdentLines().append(this.suffix(output.clone()));

            return result;
        }
    });

    expect.addType({
        name: 'array',
        base: 'arrayLike',
        identify: function (arr) {
            return utils.isArray(arr);
        }
    });

    expect.addType({
        name: 'arguments',
        base: 'arrayLike',
        prefix: function (output) {
            return output.text('arguments(', 'cyan');
        },
        suffix: function (output) {
            return output.text(')', 'cyan');
        },
        identify: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Arguments]';
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
                (equal(a.message, b.message) && this.baseType.equal(a, b));
        },
        inspect: function (value, depth, output, inspect) {
            var errorObject = extend({
                message: value.message
            }, value);
            // TODO: Inspect Error as a built-in once we have the styles defined:
            output.text('Error(').append(inspect(errorObject, depth)).text(')');
        },
        diff: function (actual, expected, output, diff) {
            var result = diff(extend({
                message: actual.message
            }, actual), extend({
                message: expected.message
            }, expected));
            if (result.diff) {
                result.diff = utils.wrapConstructorNameAroundOutput(result.diff, actual);
            }
            return result;
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
        inspect: function (date, depth, output, inspect) {
            // TODO: Inspect "new" as an operator and Date as a built-in once we have the styles defined:
            output.text('new Date(').append(inspect(date.toUTCString()).text(')'));
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
        inspect: function (f, depth, output, inspect) {
            var source = f.toString();
            var name;
            var args;
            var body;
            var matchSource = source.match(/^function (\w*)?\s*\(([^\)]*)\)\s*\{([\s\S]*?( *)?)\}$/);
            if (matchSource) {
                name = matchSource[1];
                args = matchSource[2];
                body = matchSource[3];
                var bodyIndent = matchSource[4] || '';
                // Remove leading indentation unless the function is a one-liner or it uses multiline string literals
                if (/\n/.test(body) && !/\\\n/.test(body)) {
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
            } else {
                name = f.name || '';
                args = ' /*...*/ ';
                body = ' /*...*/ ';
            }
            output.code('function ' + name + '(' + args + ') {' + body + '}', 'javascript');
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
            var orBranch = false;
            f._expectations.forEach(function (expectation, index) {
                if (expectation === f._OR) {
                    orBranch = true;
                    return;
                }

                if (orBranch) {
                    output.text(')\n      .or(');
                } else if (0 < index) {
                    output.text(')\n        .and(');
                }

                var args = Array.prototype.slice.call(expectation);
                args.forEach(function (arg, i) {
                    if (0 < i) {
                        output.text(', ');
                    }
                    output.append(inspect(arg));
                });
                orBranch = false;
            });

            output.text(')');
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
            output.regexp(regExp);
        }
    });

    expect.addType({
        name: 'DomElement',
        identify: function (value) {
            return utils.isDOMElement(value);
        },
        inspect: function (value, depth, output) {
            output.code(utils.getOuterHTML(value), 'html');
        }
    });

    expect.addType({
        name: 'binaryArray',
        base: 'arrayLike',
        digitWidth: 2,
        hexDumpWidth: 16,
        identify: false,
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
                        asciiChars += String.fromCharCode(octet).replace(/\n/g, '␊').replace(/\r/g, '␍');
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
            output.code(codeStr, 'javascript');
        },
        diffLimit: 512,
        diff: function (actual, expected, output, diff, inspect) {
            var result = {diff: output};
            if (Math.max(actual.length, expected.length) > this.diffLimit) {
                result.diff.comment('Diff suppressed due to size > ' + this.diffLimit);
            } else {
                result.diff = utils.diffStrings(this.hexDump(actual), this.hexDump(expected), output, {type: 'Chars', markUpSpecialCharacters: false})
                    .replaceText(/[\x00-\x1f\x7f-\xff␊␍]/g, '.').replaceText(/[│ ]/g, function (styles, content) {
                        this.text(content);
                    });
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
            output.strings('\'')
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
        },
        inspect: function (value, depth, output) {
            output.number(value);
        }
    });

    expect.addType({
        name: 'NaN',
        identify: function (value) {
            return typeof value === 'number' && isNaN(value);
        }
    });

    expect.addType({
        name: 'boolean',
        identify: function (value) {
            return typeof value === 'boolean';
        },
        inspect: function (value, depth, output) {
            output.keyword(value);
        }
    });

    expect.addType({
        name: 'undefined',
        identify: function (value) {
            return typeof value === 'undefined';
        },
        inspect: function (value, depth, output) {
            output.keyword(value);
        }
    });

    expect.addType({
        name: 'null',
        identify: function (value) {
            return value === null;
        },
        inspect: function (value, depth, output) {
            output.keyword(value);
        }
    });
};
