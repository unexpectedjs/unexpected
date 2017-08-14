var utils = require('./utils');
var isRegExp = utils.isRegExp;
var leftPad = utils.leftPad;
var arrayChanges = require('array-changes');
var leven = require('leven');
var detectIndent = require('detect-indent');
var defaultDepth = require('./defaultDepth');
var AssertionString = require('./AssertionString');

module.exports = function (expect) {
    expect.addType({
        name: 'wrapperObject',
        identify: false,
        equal: function (a, b, equal) {
            return a === b || equal(this.unwrap(a), this.unwrap(b));
        },
        inspect: function (value, depth, output, inspect) {
            output.append(this.prefix(output.clone(), value));
            output.append(inspect(this.unwrap(value), depth));
            output.append(this.suffix(output.clone(), value));
            return output;
        },
        diff: function (actual, expected, output, diff, inspect) {
            output.inline = true;
            actual = this.unwrap(actual);
            expected = this.unwrap(expected);
            var comparison = diff(actual, expected);
            var prefixOutput = this.prefix(output.clone(), actual);
            var suffixOutput = this.suffix(output.clone(), actual);
            if (comparison && comparison.inline) {
                return output.append(prefixOutput).append(comparison).append(suffixOutput);
            } else {
                return output.append(prefixOutput).nl()
                    .indentLines()
                    .i().block(function () {
                        this.append(inspect(actual)).sp().annotationBlock(function () {
                            this.shouldEqualError(expected, inspect);
                            if (comparison) {
                                this.nl(2).append(comparison);
                            }
                        });

                    }).nl()
                    .outdentLines()
                    .append(suffixOutput);
            }
        }
    });

    if (typeof Symbol === 'function') {
        expect.addType({
            name: 'Symbol',
            identify: function (obj) {
                return typeof obj === 'symbol';
            },
            inspect: function (obj, depth, output, inspect) {
                return output
                    .jsKeyword('Symbol')
                    .text('(')
                    .singleQuotedString(obj.toString().replace(/^Symbol\(|\)$/g, ''))
                    .text(')');
            }
        });
    }

    // If Symbol support is not detected, default to passing undefined to
    // Array.prototype.sort, which means "natural" (asciibetical) sort.
    var keyComparator;
    if (typeof Symbol === 'function') {
        // Comparator that puts symbols last:
        keyComparator = function (a, b) {
            var aIsSymbol, bIsSymbol;
            var aString = a;
            var bString = b;
            aIsSymbol = typeof a === 'symbol';
            bIsSymbol = typeof b === 'symbol';
            if (aIsSymbol) {
                if (bIsSymbol) {
                    aString = a.toString();
                    bString = b.toString();
                } else {
                    return 1;
                }
            } else if (bIsSymbol) {
                return -1;
            }

            if (aString < bString) {
                return -1;
            } else if (aString > bString) {
                return 1;
            }

            return 0;
        };
    }

    expect.addType({
        name: 'object',
        indent: true,
        forceMultipleLines: false,
        identify: function (obj) {
            return obj && typeof obj === 'object';
        },
        prefix: function (output, obj) {
            var constructor = obj.constructor;
            var constructorName = constructor && typeof constructor === 'function' && constructor !== Object && utils.getFunctionName(constructor);
            if (constructorName && constructorName !== 'Object') {
                output.text(constructorName + '(');
            }
            return output.text('{');
        },
        suffix: function (output, obj) {
            output.text('}');
            var constructor = obj.constructor;
            var constructorName = constructor && typeof constructor === 'function' && constructor !== Object && utils.getFunctionName(constructor);
            if (constructorName && constructorName !== 'Object') {
                output.text(')');
            }
            return output;
        },
        delimiter: function (output, i, length) {
            if (i < length - 1) {
                output.text(',');
            }
            return output;
        },
        getKeys: Object.getOwnPropertySymbols ? function (obj) {
            var keys = Object.keys(obj);
            var symbols = Object.getOwnPropertySymbols(obj);
            if (symbols.length > 0) {
                return keys.concat(symbols);
            } else {
                return keys;
            }
        } : Object.keys,
        equal: function (a, b, equal) {
            if (a === b) {
                return true;
            }

            if (b.constructor !== a.constructor) {
                return false;
            }

            var actualKeys = this.getKeys(a).filter(function (key) {
                    return typeof a[key] !== 'undefined';
                }),
                expectedKeys = this.getKeys(b).filter(function (key) {
                    return typeof b[key] !== 'undefined';
                });

            // having the same number of owned properties (keys incorporates hasOwnProperty)
            if (actualKeys.length !== expectedKeys.length) {
                return false;
            }
            //the same set of keys (although not necessarily the same order),
            actualKeys.sort(keyComparator);
            expectedKeys.sort(keyComparator);
            // cheap key test
            for (var i = 0; i < actualKeys.length; i += 1) {
                if (actualKeys[i] !== expectedKeys[i]) {
                    return false;
                }
            }

            //equivalent values for every corresponding key, and
            // possibly expensive deep test
            for (var j = 0; j < actualKeys.length; j += 1) {
                var key = actualKeys[j];
                if (!equal(a[key], b[key])) {
                    return false;
                }
            }
            return true;
        },
        inspect: function (obj, depth, output, inspect) {
            var keys = this.getKeys(obj);
            if (keys.length === 0) {
                this.prefix(output, obj);
                this.suffix(output, obj);
                return output;
            }
            var type = this;
            var inspectedItems = keys.map(function (key, index) {
                var propertyDescriptor = Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(obj, key);
                var hasGetter = propertyDescriptor && propertyDescriptor.get;
                var hasSetter = propertyDescriptor && propertyDescriptor.set;
                var propertyOutput = output.clone();
                if (hasSetter && !hasGetter) {
                    propertyOutput.text('set').sp();
                }
                // Inspect the setter function if there's no getter:
                var value = (hasSetter && !hasGetter) ? hasSetter : obj[key];

                var inspectedValue = inspect(value);
                if (value && value._expectIt) {
                    inspectedValue = output.clone().block(inspectedValue);
                }
                propertyOutput.property(key, inspectedValue);

                propertyOutput.amend(type.delimiter(output.clone(), index, keys.length));

                if (hasGetter && hasSetter) {
                    propertyOutput.sp().jsComment('/* getter/setter */');
                } else if (hasGetter) {
                    propertyOutput.sp().jsComment('/* getter */');
                }

                return propertyOutput;
            });

            var maxLineLength = output.preferredWidth - (depth === Infinity ? 0 : depth) * 2 - 2;
            var width = 0;
            var compact = inspectedItems.length > 5 || inspectedItems.every(function (inspectedItem) {
                if (inspectedItem.isMultiline()) {
                    return false;
                }
                width += inspectedItem.size().width;
                return width < maxLineLength;
            });

            var itemsOutput = output.clone();
            if (compact) {
                var currentLineLength = 0;
                inspectedItems.forEach(function (inspectedItem, index) {
                    var size = inspectedItem.size();
                    currentLineLength += size.width + 1;
                    if (index > 0) {
                        if (size.height === 1 && currentLineLength < maxLineLength) {
                            itemsOutput.sp();
                        } else {
                            itemsOutput.nl();
                            currentLineLength = size.width;
                        }

                        if (size.height > 1) {
                            // Make sure that we don't append more to this line
                            currentLineLength = maxLineLength;
                        }
                    }
                    itemsOutput.append(inspectedItem);
                });
            } else {
                inspectedItems.forEach(function (inspectedItem, index) {
                    if (index > 0) {
                        itemsOutput.nl();
                    }
                    itemsOutput.append(inspectedItem);
                });
            }

            var prefixOutput = this.prefix(output.clone(), obj);
            var suffixOutput = this.suffix(output.clone(), obj);
            output.append(prefixOutput);
            if (this.forceMultipleLines || itemsOutput.isMultiline()) {
                if (!prefixOutput.isEmpty()) {
                    output.nl();
                }
                if (this.indent) {
                    output.indentLines().i();
                }
                output.block(itemsOutput);
                if (this.indent) {
                    output.outdentLines();
                }
                if (!suffixOutput.isEmpty()) {
                    output.nl();
                }
            } else {
                output
                    .sp(prefixOutput.isEmpty() ? 0 : 1)
                    .append(itemsOutput)
                    .sp(suffixOutput.isEmpty() ? 0 : 1);
            }
            return output.append(suffixOutput);
        },
        diff: function (actual, expected, output, diff, inspect, equal) {
            if (actual.constructor !== expected.constructor) {
                return output.text('Mismatching constructors ')
                    .text(actual.constructor && utils.getFunctionName(actual.constructor) || actual.constructor)
                    .text(' should be ').text(expected.constructor && utils.getFunctionName(expected.constructor) || expected.constructor);
            }

            output.inline = true;
            var actualKeys = this.getKeys(actual);
            var keys = utils.uniqueStringsAndSymbols(actualKeys, this.getKeys(expected));
            var prefixOutput = this.prefix(output.clone(), actual);
            output
                .append(prefixOutput)
                .nl(prefixOutput.isEmpty() ? 0 : 1);

            if (this.indent) {
                output.indentLines();
            }
            var type = this;
            keys.forEach(function (key, index) {
                output.nl(index > 0 ? 1 : 0).i().block(function () {
                    var valueOutput;
                    var annotation = output.clone();
                    var conflicting = !equal(actual[key], expected[key]);
                    var isInlineDiff = false;
                    if (conflicting) {
                        if (!(key in expected)) {
                            annotation.error('should be removed');
                            isInlineDiff = true;
                        } else if (!(key in actual)) {
                            this.error('// missing').sp();
                            valueOutput = output.clone().appendInspected(expected[key]);
                            isInlineDiff = true;
                        } else {
                            var keyDiff = diff(actual[key], expected[key]);
                            if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                                annotation.shouldEqualError(expected[key]);
                                if (keyDiff) {
                                    annotation.nl(2).append(keyDiff);
                                }
                            } else {
                                isInlineDiff = true;
                                valueOutput = keyDiff;
                            }
                        }
                    } else {
                        isInlineDiff = true;
                    }

                    if (!valueOutput) {
                        valueOutput = inspect(actual[key], conflicting ? Infinity : null);
                    }

                    valueOutput.amend(type.delimiter(output.clone(), index, actualKeys.length));
                    if (!isInlineDiff) {
                        valueOutput = output.clone().block(valueOutput);
                    }
                    this.property(key, valueOutput);
                    if (!annotation.isEmpty()) {
                        this.sp().annotationBlock(annotation);
                    }
                });
            });

            if (this.indent) {
                output.outdentLines();
            }
            var suffixOutput = this.suffix(output.clone(), actual);
            return output
                .nl(suffixOutput.isEmpty() ? 0 : 1)
                .append(suffixOutput);
        },

        similar: function (a, b) {
            if (a === null || b === null) {
                return false;
            }

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

            var aKeys = this.getKeys(a);
            var bKeys = this.getKeys(b);
            var numberOfSimilarKeys = 0;
            var requiredSimilarKeys = Math.round(Math.max(aKeys.length, bKeys.length) / 2);
            return aKeys.concat(bKeys).some(function (key) {
                if (key in a && key in b) {
                    numberOfSimilarKeys += 1;
                }
                return numberOfSimilarKeys >= requiredSimilarKeys;
            });
        }
    });

    expect.addType({
        name: 'type',
        base: 'object',
        identify: function (value) {
            return value && value._unexpectedType;
        },
        inspect: function (value, depth, output) {
            return output.text('type: ').jsKeyword(value.name);
        }
    });

    expect.addType({
        name: 'array-like',
        base: 'object',
        identify: false,
        numericalPropertiesOnly: true,
        getKeys: function (obj) {
            var keys = new Array(obj.length);
            for (var i = 0 ; i < obj.length ; i += 1) {
                keys[i] = i;
            }
            if (!this.numericalPropertiesOnly) {
                Object.keys(obj).forEach(function (key) {
                    if (!utils.numericalRegExp.test(key)) {
                        keys.push(key);
                    }
                });
            }
            return keys;
        },
        equal: function (a, b, equal) {
            if (a === b) {
                return true;
            } else if (a.constructor === b.constructor && a.length === b.length) {
                var i;
                if (this.numericalPropertiesOnly) {
                    for (i = 0; i < a.length; i += 1) {
                        if (!equal(a[i], b[i])) {
                            return false;
                        }
                    }
                } else {
                    var aKeys = this.getKeys(a);
                    var bKeys = this.getKeys(b);
                    if (aKeys.length !== bKeys.length) {
                        return false;
                    }
                    for (i = 0; i < aKeys.length; i += 1) {
                        if (!equal(a[aKeys[i]], b[aKeys[i]])) {
                            return false;
                        }
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
            var keys = this.getKeys(arr);
            if (keys.length === 0) {
                return output.append(prefixOutput).append(suffixOutput);
            }

            if (depth === 1 && arr.length > 10) {
                return output.append(prefixOutput).text('...').append(suffixOutput);
            }

            var inspectedItems = keys.map(function (key) {
                var inspectedValue;
                if (key in arr) {
                    inspectedValue = inspect(arr[key]);
                } else if (utils.numericalRegExp.test(key)) {
                    // Sparse array entry
                    inspectedValue = output.clone();
                } else {
                    // Not present non-numerical property returned by getKeys
                    inspectedValue = inspect(undefined);
                }
                return output.clone().property(key, inspectedValue, true);
            });

            var currentDepth = defaultDepth - Math.min(defaultDepth, depth);
            var maxLineLength = (output.preferredWidth - 20) - currentDepth * output.indentationWidth - 2;
            var width = 0;
            var multipleLines = this.forceMultipleLines || inspectedItems.some(function (o) {
                if (o.isMultiline()) {
                    return true;
                }

                var size = o.size();
                width += size.width;
                return width > maxLineLength;
            });
            var type = this;
            inspectedItems.forEach(function (inspectedItem, index) {
                inspectedItem.amend(type.delimiter(output.clone(), index, keys.length));
            });
            if (multipleLines) {
                output.append(prefixOutput);
                if (!prefixOutput.isEmpty()) {
                    output.nl();
                }
                if (this.indent) {
                    output.indentLines();
                }
                inspectedItems.forEach(function (inspectedItem, index) {
                    output.nl(index > 0 ? 1 : 0).i().block(inspectedItem);
                });

                if (this.indent) {
                    output.outdentLines();
                }

                if (!suffixOutput.isEmpty()) {
                    output.nl();
                }

                return output.append(suffixOutput);
            } else {
                output
                    .append(prefixOutput)
                    .sp(prefixOutput.isEmpty() ? 0 : 1);
                inspectedItems.forEach(function (inspectedItem, index) {
                    output.append(inspectedItem);
                    var lastIndex = index === inspectedItems.length - 1;
                    if (!lastIndex) {
                        output.sp();
                    }
                });
                return output
                    .sp(suffixOutput.isEmpty() ? 0 : 1)
                    .append(suffixOutput);
            }
        },
        diffLimit: 512,
        diff: function (actual, expected, output, diff, inspect, equal) {
            output.inline = true;

            if (Math.max(actual.length, expected.length) > this.diffLimit) {
                output.jsComment('Diff suppressed due to size > ' + this.diffLimit);
                return output;
            }

            if (actual.constructor !== expected.constructor) {
                return this.baseType.diff(actual, expected, output);
            }

            var prefixOutput = this.prefix(output.clone(), actual);
            output
                .append(prefixOutput)
                .nl(prefixOutput.isEmpty() ? 0 : 1);

            if (this.indent) {
                output.indentLines();
            }

            var type = this;

            var changes = arrayChanges(actual, expected, equal, function (a, b) {
                return type.similar(a, b);
            }, !type.numericalPropertiesOnly && utils.uniqueNonNumericalStringsAndSymbols(this.getKeys(actual), this.getKeys(expected)));
            var indexOfLastNonInsert = changes.reduce(function (previousValue, diffItem, index) {
                return (diffItem.type === 'insert') ? previousValue : index;
            }, -1);
            var packing = utils.packArrows(changes); // NOTE: Will have side effects in changes if the packing results in too many arrow lanes
            output.arrowsAlongsideChangeOutputs(packing, changes.map(function (diffItem, index) {
                var delimiterOutput = type.delimiter(output.clone(), index, indexOfLastNonInsert + 1);
                if (diffItem.type === 'moveTarget') {
                    return output.clone();
                } else {
                    return output.clone().block(function () {
                        if (diffItem.type === 'moveSource') {
                            this.property(diffItem.actualIndex, inspect(diffItem.value), true)
                                .amend(delimiterOutput.sp()).error('// should be moved');
                        } else if (diffItem.type === 'insert') {
                            this.annotationBlock(function () {
                                this.error('missing ').block(function () {
                                    var index = typeof diffItem.actualIndex !== 'undefined' ? diffItem.actualIndex : diffItem.expectedIndex;
                                    this.property(index, inspect(diffItem.value), true);
                                });
                            });
                        } else if (diffItem.type === 'remove') {
                            this.block(function () {
                                this.property(diffItem.actualIndex, inspect(diffItem.value), true)
                                    .amend(delimiterOutput.sp()).error('// should be removed');
                            });
                        } else if (diffItem.type === 'equal') {
                            this.block(function () {
                                this.property(diffItem.actualIndex, inspect(diffItem.value), true)
                                    .amend(delimiterOutput);
                            });
                        } else {
                            this.block(function () {
                                var valueDiff = diff(diffItem.value, diffItem.expected);
                                this.property(diffItem.actualIndex, output.clone().block(function () {
                                    if (valueDiff && valueDiff.inline) {
                                        this.append(valueDiff.amend(delimiterOutput));
                                    } else if (valueDiff) {
                                        this.append(inspect(diffItem.value).amend(delimiterOutput.sp())).annotationBlock(function () {
                                            this.shouldEqualError(diffItem.expected, inspect).nl(2).append(valueDiff);
                                        });
                                    } else {
                                        this.append(inspect(diffItem.value).amend(delimiterOutput.sp())).annotationBlock(function () {
                                            this.shouldEqualError(diffItem.expected, inspect);
                                        });
                                    }
                                }), true);
                            });
                        }
                    });
                }
            }));

            if (this.indent) {
                output.outdentLines();
            }

            var suffixOutput = this.suffix(output.clone(), actual);
            return output
                .nl(suffixOutput.isEmpty() ? 0 : 1)
                .append(suffixOutput);
        }
    });

    expect.addType({
        name: 'array',
        base: 'array-like',
        numericalPropertiesOnly: false,
        identify: function (arr) {
            return utils.isArray(arr);
        }
    });

    expect.addType({
        name: 'arguments',
        base: 'array-like',
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

    var errorMethodBlacklist = ['message', 'name', 'description', 'line', 'column', 'sourceId', 'sourceURL', 'stack', 'stackArray'].reduce(function (result, prop) {
        result[prop] = true;
        return result;
    }, {});

    expect.addType({
        base: 'object',
        name: 'Error',
        identify: function (value) {
            return utils.isError(value);
        },
        getKeys: function (value) {
            var keys = this.baseType.getKeys(value).filter(function (key) {
                return !errorMethodBlacklist[key];
            });
            keys.unshift('message');
            return keys;
        },
        unwrap: function (value) {
            return this.getKeys(value).reduce(function (result, key) {
                result[key] = value[key];
                return result;
            }, {});
        },
        equal: function (a, b, equal) {
            return a === b ||
                (equal(a.message, b.message) && this.baseType.equal(a, b));
        },
        inspect: function (value, depth, output, inspect) {
            output.errorName(value).text('(');
            var keys = this.getKeys(value);
            if (keys.length === 1 && keys[0] === 'message') {
                if (value.message !== '') {
                    output.append(inspect(value.message));
                }
            } else {
                output.append(inspect(this.unwrap(value), depth));
            }
            return output.text(')');
        },
        diff: function (actual, expected, output, diff) {
            if (actual.constructor !== expected.constructor) {
                return output.text('Mismatching constructors ')
                    .errorName(actual)
                    .text(' should be ').errorName(expected);
            }

            output = diff(this.unwrap(actual), this.unwrap(expected));
            if (output) {
                output = output.clone().errorName(actual).text('(').append(output).text(')');
                output.inline = false;
            }
            return output;
        }
    });

    var unexpectedErrorMethodBlacklist = ['output', '_isUnexpected', 'htmlMessage', '_hasSerializedErrorMessage', 'expect', 'assertion', 'originalError'].reduce(function (result, prop) {
        result[prop] = true;
        return result;
    }, {});
    expect.addType({
        base: 'Error',
        name: 'UnexpectedError',
        identify: function (value) {
            return value && typeof value === 'object' &&
                value._isUnexpected && this.baseType.identify(value);
        },
        getKeys: function (value) {
            return this.baseType.getKeys(value).filter(function (key) {
                return !unexpectedErrorMethodBlacklist[key];
            });
        },
        inspect: function (value, depth, output) {
            output.jsFunctionName(this.name).text('(');
            var errorMessage = value.getErrorMessage(output);
            if (errorMessage.isMultiline()) {
                output.nl().indentLines().i().block(errorMessage).nl();
            } else {
                output.append(errorMessage);
            }
            return output.text(')');
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
            var dateStr = date.toUTCString().replace(/UTC/, 'GMT');
            var milliseconds = date.getUTCMilliseconds();
            if (milliseconds > 0) {
                var millisecondsStr = String(milliseconds);
                while (millisecondsStr.length < 3) {
                    millisecondsStr = '0' + millisecondsStr;
                }
                dateStr = dateStr.replace(' GMT', '.' + millisecondsStr + ' GMT');
            }

            return output.jsKeyword('new').sp().text('Date(').append(inspect(dateStr).text(')'));
        }
    });

    expect.addType({
        base: 'any',
        name: 'function',
        identify: function (f) {
            return typeof f === 'function';
        },
        getKeys: Object.keys,
        equal: function (a, b) {
            return a === b;
        },
        inspect: function (f, depth, output, inspect) {
            // Don't break when a function has its own custom #toString:
            var source = Function.prototype.toString.call(f).replace(/\r\n?|\n\r?/g, '\n');
            var name = utils.getFunctionName(f) || '';
            var preamble;
            var body;
            var bodyIndent;
            var matchSource = source.match(/^\s*((?:async )?\s*(?:\S+\s*=>|\([^\)]*\)\s*=>|function \w*?\s*\([^\)]*\)))([\s\S]*)$/);
            if (matchSource) {
                preamble = matchSource[1];
                if (preamble === 'function ()' && name) {
                    // fn.bind() doesn't seem to include the name in the .toString() output:
                    preamble = 'function ' + name + '()';
                }
                body = matchSource[2];
                var matchBodyAndIndent = body.match(/^(\s*\{)([\s\S]*?)([ ]*)\}\s*$/);
                var openingBrace;
                var isWrappedInBraces = true;
                var closingBrace = '}';
                if (matchBodyAndIndent) {
                    openingBrace = matchBodyAndIndent[1];
                    body = matchBodyAndIndent[2];
                    bodyIndent = matchBodyAndIndent[3] || '';
                    if (bodyIndent.length === 1) {
                        closingBrace = ' }';
                    }
                } else {
                    // Attempt to match an arrow function with an implicit return body.
                    matchBodyAndIndent = body.match(/^(\s*)([\s\S]*?)([ ]*)\s*$/);

                    if (matchBodyAndIndent) {
                        openingBrace = matchBodyAndIndent[1];
                        isWrappedInBraces = false;
                        body = matchBodyAndIndent[2];
                        bodyIndent = matchBodyAndIndent[3] || '';
                        closingBrace = '';
                    }
                }

                // Remove leading indentation unless the function is a one-liner or it uses multiline string literals
                if (/\n/.test(body) && !/\\\n/.test(body)) {
                    body = body.replace(new RegExp('^ {' + bodyIndent.length + '}', 'mg'), '');
                    var indent = detectIndent(body);
                    body = body.replace(new RegExp('^(?:' + indent.indent + ')+', 'mg'), function ($0) {
                        return utils.leftPad('', ($0.length / indent.amount) * output.indentationWidth, ' ');
                    });
                }
                if (!name || name === 'anonymous') {
                    name = '';
                }
                if (/^\s*\[native code\]\s*$/.test(body)) {
                    body = ' /* native code */ ';
                    closingBrace = '}';
                } else if (/^\s*$/.test(body)) {
                    body = '';
                } else if (/^\s*[^\r\n]{1,30}\s*$/.test(body) && body.indexOf('//') === -1 && isWrappedInBraces) {
                    body = ' ' + body.trim() + ' ';
                    closingBrace = '}';
                } else {
                    body = body.replace(/^((?:.*\n){3}( *).*\n)[\s\S]*?\n[\s\S]*?\n((?:.*\n){3})$/, '$1$2// ... lines removed ...\n$3');
                }
                if (matchBodyAndIndent) {
                    body = openingBrace + body + closingBrace;
                } else {
                    // Strip trailing space from arrow function body
                    body = body.replace(/[ ]*$/, '');
                }
            } else {
                preamble = 'function ' + name + '( /*...*/ ) ';
                body = '{ /*...*/ }';
            }
            return output.code(preamble + body, 'javascript');
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

            return output.amend(')');
        }
    });

    expect.addType({
        name: 'Promise',
        base: 'object',
        identify: function (obj) {
            return obj && this.baseType.identify(obj) && typeof obj.then === 'function';
        },
        inspect: function (promise, depth, output, inspect) {
            output.jsFunctionName('Promise');
            if (promise.isPending && promise.isPending()) {
                output.sp().yellow('(pending)');
            } else if (promise.isFulfilled && promise.isFulfilled()) {
                output.sp().green('(fulfilled)');
                if (promise.value) {
                    var value = promise.value();
                    if (typeof value !== 'undefined') {
                        output.sp().text('=>').sp().append(inspect(value));
                    }
                }
            } else if (promise.isRejected && promise.isRejected()) {
                output.sp().red('(rejected)');
                var reason = promise.reason();
                if (typeof reason !== 'undefined') {
                    output.sp().text('=>').sp().append(inspect(promise.reason()));
                }
            }
            return output;
        }
    });

    expect.addType({
        name: 'regexp',
        base: 'object',
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
            return output.jsRegexp(regExp);
        },
        diff: function (actual, expected, output, diff, inspect) {
            output.inline = false;
            return output.stringDiff(String(actual), String(expected), {type: 'Chars', markUpSpecialCharacters: true});
        }
    });

    expect.addType({
        name: 'binaryArray',
        base: 'array-like',
        digitWidth: 2,
        hexDumpWidth: 16,
        identify: false,
        prefix: function (output) {
            return output.code(this.name + '([', 'javascript');
        },
        suffix: function (output) {
            return output.code('])', 'javascript');
        },
        equal: function (a, b) {
            if (a === b) {
                return true;
            }

            if (a.length !== b.length) { return false; }

            for (var i = 0; i < a.length; i += 1) {
                if (a[i] !== b[i]) { return false; }
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
            this.prefix(output, obj);
            var codeStr = '';
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
            output.code(codeStr, 'javascript');
            this.suffix(output, obj);
            return output;
        },
        diffLimit: 512,
        diff: function (actual, expected, output, diff, inspect) {
            output.inline = false;
            if (Math.max(actual.length, expected.length) > this.diffLimit) {
                output.jsComment('Diff suppressed due to size > ' + this.diffLimit);
            } else {
                output.stringDiff(this.hexDump(actual), this.hexDump(expected), {type: 'Chars', markUpSpecialCharacters: false})
                    .replaceText(/[\x00-\x1f\x7f-\xff␊␍]/g, '.').replaceText(/[│ ]/g, function (styles, content) {
                        this.text(content);
                    });
            }
            return output;
        }
    });

    [8, 16, 32].forEach(function (numBits) {
        ['Int', 'Uint'].forEach(function (intOrUint) {
            var constructorName = intOrUint + numBits + 'Array',
                Constructor = global[constructorName];
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

    if (typeof Buffer !== 'undefined') {
        expect.addType({
            name: 'Buffer',
            base: 'binaryArray',
            identify: Buffer.isBuffer
        });
    }

    expect.addType({
        name: 'string',
        identify: function (value) {
            return typeof value === 'string';
        },
        inspect: function (value, depth, output) {
            return output.singleQuotedString(value);
        },
        diffLimit: 4096,
        diff: function (actual, expected, output, diff, inspect) {
            if (Math.max(actual.length, expected.length) > this.diffLimit) {
                output.jsComment('Diff suppressed due to size > ' + this.diffLimit);
                return output;
            }
            output.stringDiff(actual, expected, {type: 'WordsWithSpace', markUpSpecialCharacters: true});
            output.inline = false;
            return output;
        }
    });

    expect.addType({
        name: 'number',
        identify: function (value) {
            return typeof value === 'number' && !isNaN(value);
        },
        inspect: function (value, depth, output) {
            if (value === 0 && 1 / value === -Infinity) {
                value = '-0';
            } else {
                value = String(value);
            }
            return output.jsNumber(String(value));
        }
    });

    expect.addType({
        name: 'NaN',
        identify: function (value) {
            return typeof value === 'number' && isNaN(value);
        },
        inspect: function (value, depth, output) {
            return output.jsPrimitive(value);
        }
    });

    expect.addType({
        name: 'boolean',
        identify: function (value) {
            return typeof value === 'boolean';
        },
        inspect: function (value, depth, output) {
            return output.jsPrimitive(value);
        }
    });

    expect.addType({
        name: 'undefined',
        identify: function (value) {
            return typeof value === 'undefined';
        },
        inspect: function (value, depth, output) {
            return output.jsPrimitive(value);
        }
    });

    expect.addType({
        name: 'null',
        identify: function (value) {
            return value === null;
        },
        inspect: function (value, depth, output) {
            return output.jsPrimitive(value);
        }
    });

    expect.addType({
        name: 'assertion',
        identify: function (value) {
            return value instanceof AssertionString;
        }
    });
};
