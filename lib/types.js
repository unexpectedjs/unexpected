const utils = require('./utils');
const isRegExp = utils.isRegExp;
const leftPad = utils.leftPad;
const arrayChanges = require('array-changes');
const leven = require('leven');
const detectIndent = require('detect-indent');
const defaultDepth = require('./defaultDepth');
const AssertionString = require('./AssertionString');

module.exports = function(expect) {
  expect.addType({
    name: 'wrapperObject',
    identify: false,
    equal(a, b, equal) {
      return a === b || equal(this.unwrap(a), this.unwrap(b));
    },
    inspect(value, depth, output, inspect) {
      output.append(this.prefix(output.clone(), value));
      output.append(inspect(this.unwrap(value), depth));
      output.append(this.suffix(output.clone(), value));
      return output;
    },
    diff(actual, expected, output, diff, inspect) {
      output.inline = true;
      actual = this.unwrap(actual);
      expected = this.unwrap(expected);
      const comparison = diff(actual, expected);
      const prefixOutput = this.prefix(output.clone(), actual);
      const suffixOutput = this.suffix(output.clone(), actual);
      if (comparison && comparison.inline) {
        return output
          .append(prefixOutput)
          .append(comparison)
          .append(suffixOutput);
      } else {
        return output
          .append(prefixOutput)
          .nl()
          .indentLines()
          .i()
          .block(function() {
            this.append(inspect(actual))
              .sp()
              .annotationBlock(function() {
                this.shouldEqualError(expected, inspect);
                if (comparison) {
                  this.nl(2).append(comparison);
                }
              });
          })
          .nl()
          .outdentLines()
          .append(suffixOutput);
      }
    }
  });

  if (typeof Symbol === 'function') {
    expect.addType({
      name: 'Symbol',
      identify(obj) {
        return typeof obj === 'symbol';
      },
      inspect(obj, depth, output, inspect) {
        return output
          .jsKeyword('Symbol')
          .text('(')
          .singleQuotedString(obj.toString().replace(/^Symbol\(|\)$/g, ''))
          .text(')');
      }
    });
  }

  expect.addType({
    name: 'object',
    indent: true,
    forceMultipleLines: false,
    identify(obj) {
      return obj && typeof obj === 'object';
    },
    prefix(output, obj) {
      const constructor = obj.constructor;
      const constructorName =
        constructor &&
        typeof constructor === 'function' &&
        constructor !== Object &&
        utils.getFunctionName(constructor);
      if (constructorName && constructorName !== 'Object') {
        output.text(`${constructorName}(`);
      }
      return output.text('{');
    },
    property(output, key, inspectedValue, isArrayLike) {
      return output.propertyForObject(key, inspectedValue, isArrayLike);
    },
    suffix(output, obj) {
      output.text('}');
      const constructor = obj.constructor;
      const constructorName =
        constructor &&
        typeof constructor === 'function' &&
        constructor !== Object &&
        utils.getFunctionName(constructor);
      if (constructorName && constructorName !== 'Object') {
        output.text(')');
      }
      return output;
    },
    delimiter(output, i, length) {
      if (i < length - 1) {
        output.text(',');
      }
      return output;
    },
    getKeys: Object.getOwnPropertySymbols
      ? obj => {
          const keys = Object.keys(obj);
          const symbols = Object.getOwnPropertySymbols(obj);
          if (symbols.length > 0) {
            return keys.concat(symbols);
          } else {
            return keys;
          }
        }
      : Object.keys,
    // If Symbol support is not detected default to undefined which, when
    // passed to Array.prototype.sort, means "natural" (asciibetical) sort.
    keyComparator:
      typeof Symbol === 'function'
        ? (a, b) => {
            let aIsSymbol, bIsSymbol;
            let aString = a;
            let bString = b;
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
          }
        : undefined,
    equal(a, b, equal) {
      if (a === b) {
        return true;
      }

      if (b.constructor !== a.constructor) {
        return false;
      }

      const actualKeys = this.getKeys(a).filter(
        key => typeof this.valueForKey(a, key) !== 'undefined'
      );
      const expectedKeys = this.getKeys(b).filter(
        key => typeof this.valueForKey(b, key) !== 'undefined'
      );

      // having the same number of owned properties (keys incorporates hasOwnProperty)
      if (actualKeys.length !== expectedKeys.length) {
        return false;
      }
      //the same set of keys (although not necessarily the same order),
      actualKeys.sort(this.keyComparator);
      expectedKeys.sort(this.keyComparator);
      // cheap key test
      for (let i = 0; i < actualKeys.length; i += 1) {
        if (actualKeys[i] !== expectedKeys[i]) {
          return false;
        }
      }

      //equivalent values for every corresponding key, and
      // possibly expensive deep test
      for (let j = 0; j < actualKeys.length; j += 1) {
        const key = actualKeys[j];
        if (!equal(this.valueForKey(a, key), this.valueForKey(b, key))) {
          return false;
        }
      }
      return true;
    },
    hasKey(obj, key) {
      return key in obj;
    },
    inspect(obj, depth, output, inspect) {
      const keys = this.getKeys(obj);
      if (keys.length === 0) {
        this.prefix(output, obj);
        this.suffix(output, obj);
        return output;
      }
      const type = this;
      const inspectedItems = keys.map((key, index) => {
        const propertyDescriptor =
          Object.getOwnPropertyDescriptor &&
          Object.getOwnPropertyDescriptor(obj, key);
        const hasGetter = propertyDescriptor && propertyDescriptor.get;
        const hasSetter = propertyDescriptor && propertyDescriptor.set;
        const propertyOutput = output.clone();
        if (hasSetter && !hasGetter) {
          propertyOutput.text('set').sp();
        }
        // Inspect the setter function if there's no getter:
        let value;
        if (hasSetter && !hasGetter) {
          value = hasSetter;
        } else {
          value = type.valueForKey(obj, key);
        }

        let inspectedValue = inspect(value);
        if (value && value._expectIt) {
          inspectedValue = output.clone().block(inspectedValue);
        }
        type.property(propertyOutput, key, inspectedValue);

        propertyOutput.amend(
          type.delimiter(output.clone(), index, keys.length)
        );

        if (hasGetter && hasSetter) {
          propertyOutput.sp().jsComment('/* getter/setter */');
        } else if (hasGetter) {
          propertyOutput.sp().jsComment('/* getter */');
        }

        return propertyOutput;
      });

      const maxLineLength =
        output.preferredWidth - (depth === Infinity ? 0 : depth) * 2 - 2;
      let width = 0;
      const compact =
        inspectedItems.length > 5 ||
        inspectedItems.every(inspectedItem => {
          if (inspectedItem.isMultiline()) {
            return false;
          }
          width += inspectedItem.size().width;
          return width < maxLineLength;
        });

      const itemsOutput = output.clone();
      if (compact) {
        let currentLineLength = 0;
        inspectedItems.forEach((inspectedItem, index) => {
          const size = inspectedItem.size();
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
        inspectedItems.forEach((inspectedItem, index) => {
          if (index > 0) {
            itemsOutput.nl();
          }
          itemsOutput.append(inspectedItem);
        });
      }

      const prefixOutput = this.prefix(output.clone(), obj);
      const suffixOutput = this.suffix(output.clone(), obj);
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
    diff(actual, expected, output, diff, inspect, equal) {
      if (actual.constructor !== expected.constructor) {
        return output
          .text('Mismatching constructors ')
          .text(
            (actual.constructor && utils.getFunctionName(actual.constructor)) ||
              actual.constructor
          )
          .text(' should be ')
          .text(
            (expected.constructor &&
              utils.getFunctionName(expected.constructor)) ||
              expected.constructor
          );
      }

      output.inline = true;
      const actualKeys = this.getKeys(actual);
      const expectedKeys = this.getKeys(expected);
      const keys = this.uniqueKeys(actualKeys, expectedKeys);
      const prefixOutput = this.prefix(output.clone(), actual);
      output.append(prefixOutput).nl(prefixOutput.isEmpty() ? 0 : 1);

      if (this.indent) {
        output.indentLines();
      }
      const type = this;
      keys.forEach((key, index) => {
        output
          .nl(index > 0 ? 1 : 0)
          .i()
          .block(function() {
            const valueActual = type.valueForKey(actual, key);
            const valueExpected = type.valueForKey(expected, key);
            const annotation = output.clone();
            const conflicting = !equal(valueActual, valueExpected);
            let isInlineDiff = false;
            let valueOutput;
            if (conflicting) {
              if (!type.hasKey(expected, key)) {
                annotation.error('should be removed');
                isInlineDiff = true;
              } else if (!type.hasKey(actual, key)) {
                this.error('// missing').sp();
                valueOutput = output.clone().appendInspected(valueExpected);
                isInlineDiff = true;
              } else {
                const keyDiff = diff(valueActual, valueExpected);
                if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                  annotation.shouldEqualError(valueExpected);
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
              valueOutput = inspect(valueActual, conflicting ? Infinity : null);
            }

            valueOutput.amend(
              type.delimiter(output.clone(), index, actualKeys.length)
            );
            if (!isInlineDiff) {
              valueOutput = output.clone().block(valueOutput);
            }
            type.property(this, key, valueOutput);
            if (!annotation.isEmpty()) {
              this.sp().annotationBlock(annotation);
            }
          });
      });

      if (this.indent) {
        output.outdentLines();
      }
      const suffixOutput = this.suffix(output.clone(), actual);
      return output.nl(suffixOutput.isEmpty() ? 0 : 1).append(suffixOutput);
    },
    similar(a, b) {
      if (a === null || b === null) {
        return false;
      }

      const typeA = typeof a;
      const typeB = typeof b;

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

      const aKeys = this.getKeys(a);
      const bKeys = this.getKeys(b);
      let numberOfSimilarKeys = 0;
      const requiredSimilarKeys = Math.round(
        Math.max(aKeys.length, bKeys.length) / 2
      );
      return aKeys.concat(bKeys).some(key => {
        if (this.hasKey(a, key) && this.hasKey(b, key)) {
          numberOfSimilarKeys += 1;
        }
        return numberOfSimilarKeys >= requiredSimilarKeys;
      });
    },
    uniqueKeys: utils.uniqueStringsAndSymbols,
    valueForKey(obj, key) {
      return obj[key];
    }
  });

  expect.addType({
    name: 'type',
    base: 'object',
    identify(value) {
      return value && value._unexpectedType;
    },
    inspect({ name }, depth, output) {
      return output.text('type: ').jsKeyword(name);
    }
  });

  expect.addType({
    name: 'array-like',
    base: 'object',
    identify: false,
    numericalPropertiesOnly: true,
    getKeys(obj) {
      const keys = new Array(obj.length);
      for (let i = 0; i < obj.length; i += 1) {
        keys[i] = i;
      }
      if (!this.numericalPropertiesOnly) {
        keys.push(...this.getKeysNonNumerical(obj));
      }
      return keys;
    },
    getKeysNonNumerical: Object.getOwnPropertySymbols
      ? obj => {
          const keys = [];
          Object.keys(obj).forEach(key => {
            if (!utils.numericalRegExp.test(key)) {
              keys.push(key);
            }
          });
          const symbols = Object.getOwnPropertySymbols(obj);
          if (symbols.length > 0) {
            keys.push(...symbols);
          }
          return keys;
        }
      : obj => {
          const keys = [];
          Object.keys(obj).forEach(key => {
            if (!utils.numericalRegExp.test(key)) {
              keys.push(key);
            }
          });
          return keys;
        },
    equal(a, b, equal) {
      if (a === b) {
        return true;
      } else if (a.constructor === b.constructor && a.length === b.length) {
        let i;

        // compare numerically indexed elements
        for (i = 0; i < a.length; i += 1) {
          if (!equal(this.valueForKey(a, i), this.valueForKey(b, i))) {
            return false;
          }
        }

        // compare non-numerical keys if enabled for the type
        if (!this.numericalPropertiesOnly) {
          const aKeys = this.getKeysNonNumerical(a).filter(key => {
            // include keys whose value is not undefined
            return typeof this.valueForKey(a, key) !== 'undefined';
          });
          const bKeys = this.getKeysNonNumerical(b).filter(key => {
            // include keys whose value is not undefined on either LHS or RHS
            return (
              typeof this.valueForKey(b, key) !== 'undefined' ||
              typeof this.valueForKey(a, key) !== 'undefined'
            );
          });

          if (aKeys.length !== bKeys.length) {
            return false;
          }

          for (i = 0; i < aKeys.length; i += 1) {
            if (
              !equal(
                this.valueForKey(a, aKeys[i]),
                this.valueForKey(b, bKeys[i])
              )
            ) {
              return false;
            }
          }
        }

        return true;
      } else {
        return false;
      }
    },
    prefix(output) {
      return output.text('[');
    },
    suffix(output) {
      return output.text(']');
    },
    inspect(arr, depth, output, inspect) {
      const prefixOutput = this.prefix(output.clone(), arr);
      const suffixOutput = this.suffix(output.clone(), arr);
      const keys = this.getKeys(arr);
      if (keys.length === 0) {
        return output.append(prefixOutput).append(suffixOutput);
      }

      if (depth === 1 && arr.length > 10) {
        return output
          .append(prefixOutput)
          .text('...')
          .append(suffixOutput);
      }

      const inspectedItems = keys.map(key => {
        let inspectedValue;
        if (this.hasKey(arr, key)) {
          inspectedValue = inspect(this.valueForKey(arr, key));
        } else if (utils.numericalRegExp.test(key)) {
          // Sparse array entry
          inspectedValue = output.clone();
        } else {
          // Not present non-numerical property returned by getKeys
          inspectedValue = inspect(undefined);
        }
        return this.property(output.clone(), key, inspectedValue, true);
      });

      const currentDepth = defaultDepth - Math.min(defaultDepth, depth);
      const maxLineLength =
        output.preferredWidth - 20 - currentDepth * output.indentationWidth - 2;
      let width = 0;
      const multipleLines =
        this.forceMultipleLines ||
        inspectedItems.some(o => {
          if (o.isMultiline()) {
            return true;
          }

          const size = o.size();
          width += size.width;
          return width > maxLineLength;
        });
      inspectedItems.forEach((inspectedItem, index) => {
        inspectedItem.amend(this.delimiter(output.clone(), index, keys.length));
      });
      if (multipleLines) {
        output.append(prefixOutput);
        if (!prefixOutput.isEmpty()) {
          output.nl();
        }
        if (this.indent) {
          output.indentLines();
        }
        inspectedItems.forEach((inspectedItem, index) => {
          output
            .nl(index > 0 ? 1 : 0)
            .i()
            .block(inspectedItem);
        });

        if (this.indent) {
          output.outdentLines();
        }

        if (!suffixOutput.isEmpty()) {
          output.nl();
        }

        return output.append(suffixOutput);
      } else {
        output.append(prefixOutput).sp(prefixOutput.isEmpty() ? 0 : 1);
        inspectedItems.forEach((inspectedItem, index) => {
          output.append(inspectedItem);
          const lastIndex = index === inspectedItems.length - 1;
          if (!lastIndex) {
            output.sp();
          }
        });
        return output.sp(suffixOutput.isEmpty() ? 0 : 1).append(suffixOutput);
      }
    },
    diffLimit: 512,
    diff(actual, expected, output, diff, inspect, equal) {
      output.inline = true;

      if (Math.max(actual.length, expected.length) > this.diffLimit) {
        output.jsComment(`Diff suppressed due to size > ${this.diffLimit}`);
        return output;
      }

      if (actual.constructor !== expected.constructor) {
        return this.baseType.diff(actual, expected, output);
      }

      const prefixOutput = this.prefix(output.clone(), actual);
      output.append(prefixOutput).nl(prefixOutput.isEmpty() ? 0 : 1);

      if (this.indent) {
        output.indentLines();
      }

      var actualElements = utils.duplicateArrayLikeUsingType(actual, this);
      var actualKeys = this.getKeys(actual);
      var expectedElements = utils.duplicateArrayLikeUsingType(expected, this);
      var expectedKeys = this.getKeys(expected);
      var nonNumericalKeysAndSymbols =
        !this.numericalPropertiesOnly &&
        utils.uniqueNonNumericalStringsAndSymbols(actualKeys, expectedKeys);

      const type = this;
      const changes = arrayChanges(
        actualElements,
        expectedElements,
        equal,
        (a, b) => type.similar(a, b),
        {
          includeNonNumericalProperties: nonNumericalKeysAndSymbols
        }
      );
      const indexOfLastNonInsert = changes.reduce(
        (previousValue, diffItem, index) =>
          diffItem.type === 'insert' ? previousValue : index,
        -1
      );
      const packing = utils.packArrows(changes); // NOTE: Will have side effects in changes if the packing results in too many arrow lanes
      output.arrowsAlongsideChangeOutputs(
        packing,
        changes.map((diffItem, index) => {
          const delimiterOutput = type.delimiter(
            output.clone(),
            index,
            indexOfLastNonInsert + 1
          );
          if (diffItem.type === 'moveTarget') {
            return output.clone();
          } else {
            return output.clone().block(function() {
              if (diffItem.type === 'moveSource') {
                const propertyOutput = type.property(
                  output.clone(),
                  diffItem.actualIndex,
                  inspect(diffItem.value),
                  true
                );
                this.amend(propertyOutput)
                  .amend(delimiterOutput)
                  .sp()
                  .error('// should be moved');
              } else if (diffItem.type === 'insert') {
                this.annotationBlock(function() {
                  this.error('missing ').block(function() {
                    const index =
                      typeof diffItem.actualIndex !== 'undefined'
                        ? diffItem.actualIndex
                        : diffItem.expectedIndex;
                    const propertyOutput = type.property(
                      output.clone(),
                      index,
                      inspect(diffItem.value),
                      true
                    );
                    this.amend(propertyOutput);
                  });
                });
              } else if (diffItem.type === 'remove') {
                this.block(function() {
                  const propertyOutput = type.property(
                    output.clone(),
                    diffItem.actualIndex,
                    inspect(diffItem.value),
                    true
                  );
                  this.amend(propertyOutput)
                    .amend(delimiterOutput)
                    .sp()
                    .error('// should be removed');
                });
              } else if (diffItem.type === 'equal') {
                this.block(function() {
                  const propertyOutput = type.property(
                    output.clone(),
                    diffItem.actualIndex,
                    inspect(diffItem.value),
                    true
                  );
                  this.amend(propertyOutput).amend(delimiterOutput);
                });
              } else {
                this.block(function() {
                  const valueDiff = diff(diffItem.value, diffItem.expected);
                  if (valueDiff && valueDiff.inline) {
                    this.append(valueDiff).append(delimiterOutput);
                  } else {
                    const propertyOutput = type.property(
                      output.clone(),
                      diffItem.actualIndex,
                      inspect(diffItem.value),
                      true
                    );
                    this.append(propertyOutput)
                      .append(delimiterOutput)
                      .sp()
                      .annotationBlock(function() {
                        this.shouldEqualError(diffItem.expected, inspect);
                        if (valueDiff) {
                          this.nl(2).append(valueDiff);
                        }
                      });
                  }
                });
              }
            });
          }
        })
      );

      if (this.indent) {
        output.outdentLines();
      }

      const suffixOutput = this.suffix(output.clone(), actual);
      return output.nl(suffixOutput.isEmpty() ? 0 : 1).append(suffixOutput);
    }
  });

  expect.addType({
    name: 'array',
    base: 'array-like',
    numericalPropertiesOnly: false,
    identify(arr) {
      return utils.isArray(arr);
    }
  });

  expect.addType({
    name: 'arguments',
    base: 'array-like',
    prefix(output) {
      return output.text('arguments(', 'cyan');
    },
    suffix(output) {
      return output.text(')', 'cyan');
    },
    identify(obj) {
      return Object.prototype.toString.call(obj) === '[object Arguments]';
    }
  });

  const errorMethodBlacklist = [
    'message',
    'name',
    'description',
    'line',
    'number',
    'column',
    'sourceId',
    'sourceURL',
    'stack',
    'stackArray'
  ].reduce((result, prop) => {
    result[prop] = true;
    return result;
  }, {});

  expect.addType({
    base: 'object',
    name: 'Error',
    identify(value) {
      return utils.isError(value);
    },
    getKeys(value) {
      const keys = this.baseType
        .getKeys(value)
        .filter(key => !errorMethodBlacklist[key]);
      keys.unshift('message');
      return keys;
    },
    unwrap(value) {
      return this.getKeys(value).reduce((result, key) => {
        result[key] = value[key];
        return result;
      }, {});
    },
    equal(a, b, equal) {
      return (
        a === b || (equal(a.message, b.message) && this.baseType.equal(a, b))
      );
    },
    inspect(value, depth, output, inspect) {
      output.errorName(value).text('(');
      const keys = this.getKeys(value);
      if (keys.length === 1 && keys[0] === 'message') {
        if (value.message !== '') {
          output.append(inspect(value.message));
        }
      } else {
        output.append(inspect(this.unwrap(value), depth));
      }
      return output.text(')');
    },
    diff(actual, expected, output, diff) {
      if (actual.constructor !== expected.constructor) {
        return output
          .text('Mismatching constructors ')
          .errorName(actual)
          .text(' should be ')
          .errorName(expected);
      }

      output = diff(this.unwrap(actual), this.unwrap(expected));
      if (output) {
        output = output
          .clone()
          .errorName(actual)
          .text('(')
          .append(output)
          .text(')');
        output.inline = false;
      }
      return output;
    }
  });

  const unexpectedErrorMethodBlacklist = [
    'output',
    '_isUnexpected',
    'htmlMessage',
    '_hasSerializedErrorMessage',
    'expect',
    'assertion',
    'originalError'
  ].reduce((result, prop) => {
    result[prop] = true;
    return result;
  }, {});
  expect.addType({
    base: 'Error',
    name: 'UnexpectedError',
    identify(value) {
      return (
        value &&
        typeof value === 'object' &&
        value._isUnexpected &&
        this.baseType.identify(value)
      );
    },
    getKeys(value) {
      return this.baseType
        .getKeys(value)
        .filter(key => !unexpectedErrorMethodBlacklist[key]);
    },
    inspect(value, depth, output) {
      output.jsFunctionName(this.name).text('(');
      const errorMessage = value.getErrorMessage(output);
      if (errorMessage.isMultiline()) {
        output
          .nl()
          .indentLines()
          .i()
          .block(errorMessage)
          .nl();
      } else {
        output.append(errorMessage);
      }
      return output.text(')');
    }
  });

  expect.addType({
    name: 'date',
    identify(obj) {
      return Object.prototype.toString.call(obj) === '[object Date]';
    },
    equal(a, b) {
      return a.getTime() === b.getTime();
    },
    inspect(date, depth, output, inspect) {
      // TODO: Inspect "new" as an operator and Date as a built-in once we have the styles defined:
      let dateStr = date.toUTCString().replace(/UTC/, 'GMT');
      const milliseconds = date.getUTCMilliseconds();
      if (milliseconds > 0) {
        let millisecondsStr = String(milliseconds);
        while (millisecondsStr.length < 3) {
          millisecondsStr = `0${millisecondsStr}`;
        }
        dateStr = dateStr.replace(' GMT', `.${millisecondsStr} GMT`);
      }

      return output
        .jsKeyword('new')
        .sp()
        .text('Date(')
        .append(inspect(dateStr).text(')'));
    }
  });

  expect.addType({
    base: 'any',
    name: 'function',
    identify(f) {
      return typeof f === 'function';
    },
    getKeys: Object.keys,
    equal(a, b) {
      return a === b;
    },
    inspect(f, depth, output, inspect) {
      // Don't break when a function has its own custom #toString:
      const source = Function.prototype.toString
        .call(f)
        .replace(/\r\n?|\n\r?/g, '\n');
      let name = utils.getFunctionName(f) || '';
      let preamble;
      let body;
      let bodyIndent;
      const matchSource = source.match(
        /^\s*((?:async )?\s*(?:\S+\s*=>|\([^)]*\)\s*=>|function\s?\w*\s*\([^)]*\)))([\s\S]*)$/
      );
      if (matchSource) {
        // Normalize so there's always space after "function":
        preamble = matchSource[1].replace(/function(\S)/, 'function $1');
        if (preamble === 'function ()' && name) {
          // fn.bind() doesn't seem to include the name in the .toString() output:
          preamble = `function ${name}()`;
        }
        body = matchSource[2];
        let matchBodyAndIndent = body.match(/^(\s*\{)([\s\S]*?)([ ]*)\}\s*$/);
        let openingBrace;
        let isWrappedInBraces = true;
        let closingBrace = '}';
        let reindentBodyLevel = 0;
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
            const matchInitialNewline = openingBrace.match(/^\n( +)/);
            if (matchInitialNewline) {
              openingBrace = '\n';
              if (/\n/.test(body)) {
                // An arrow function whose body starts with a newline, as prettier likes to output, eg.:
                //        () =>
                //          foo(
                //            1
                //          );
                // Shuffle/hack things around so it will be formatted correctly:
                bodyIndent = matchInitialNewline[1];
                reindentBodyLevel = 1;
              } else {
                body = body.replace(/^\s*/, '  ');
              }
            } else {
              bodyIndent = matchBodyAndIndent[3] || '';
            }
            closingBrace = '';
          }
        }

        // Remove leading indentation unless the function is a one-liner or it uses multiline string literals
        if (/\n/.test(body) && !/\\\n/.test(body)) {
          body = body.replace(new RegExp(`^ {${bodyIndent.length}}`, 'mg'), '');
          const indent = detectIndent(body);
          body = body.replace(
            new RegExp(`^(?:${indent.indent})*`, 'mg'),
            ({ length }) =>
              utils.leftPad(
                '',
                (length / indent.amount + reindentBodyLevel) *
                  output.indentationWidth,
                ' '
              )
          );
        }
        if (!name || name === 'anonymous') {
          name = '';
        }
        if (/^\s*\[native code\]\s*$/.test(body)) {
          body = ' /* native code */ ';
          closingBrace = '}';
        } else if (/^\s*$/.test(body)) {
          body = '';
        } else if (
          /^\s*[^\r\n]{1,30}\s*$/.test(body) &&
          body.indexOf('//') === -1 &&
          isWrappedInBraces
        ) {
          body = ` ${body.trim()} `;
          closingBrace = '}';
        } else {
          body = body.replace(
            /^((?:.*\n){3}( *).*\n)[\s\S]*?\n[\s\S]*?\n((?:.*\n){3})$/,
            '$1$2// ... lines removed ...\n$3'
          );
        }
        if (matchBodyAndIndent) {
          body = openingBrace + body + closingBrace;
        } else {
          // Strip trailing space from arrow function body
          body = body.replace(/[ ]*$/, '');
        }
      } else {
        preamble = `function ${name}( /*...*/ ) `;
        body = '{ /*...*/ }';
      }
      return output.code(preamble + body, 'javascript');
    }
  });

  expect.addType({
    base: 'function',
    name: 'expect.it',
    identify(f) {
      return typeof f === 'function' && f._expectIt;
    },
    inspect({ _expectations, _OR }, depth, output, inspect) {
      output.text('expect.it(');
      let orBranch = false;
      _expectations.forEach((expectation, index) => {
        if (expectation === _OR) {
          orBranch = true;
          return;
        }

        if (orBranch) {
          output.text(')\n      .or(');
        } else if (index > 0) {
          output.text(')\n        .and(');
        }

        const args = Array.prototype.slice.call(expectation);
        args.forEach((arg, i) => {
          if (i > 0) {
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
    identify(obj) {
      return (
        obj && this.baseType.identify(obj) && typeof obj.then === 'function'
      );
    },
    inspect(promise, depth, output, inspect) {
      output.jsFunctionName('Promise');
      if (promise.isPending && promise.isPending()) {
        output.sp().yellow('(pending)');
      } else if (promise.isFulfilled && promise.isFulfilled()) {
        output.sp().green('(fulfilled)');
        if (promise.value) {
          const value = promise.value();
          if (typeof value !== 'undefined') {
            output
              .sp()
              .text('=>')
              .sp()
              .append(inspect(value));
          }
        }
      } else if (promise.isRejected && promise.isRejected()) {
        output.sp().red('(rejected)');
        const reason = promise.reason();
        if (typeof reason !== 'undefined') {
          output
            .sp()
            .text('=>')
            .sp()
            .append(inspect(promise.reason()));
        }
      }
      return output;
    }
  });

  expect.addType({
    name: 'regexp',
    base: 'object',
    identify: isRegExp,
    equal(a, b) {
      return (
        a === b ||
        (a.source === b.source &&
          a.global === b.global &&
          a.ignoreCase === b.ignoreCase &&
          a.multiline === b.multiline)
      );
    },
    inspect(regExp, depth, output) {
      return output.jsRegexp(regExp);
    },
    diff(actual, expected, output, diff, inspect) {
      output.inline = false;
      return output.stringDiff(String(actual), String(expected), {
        type: 'Chars',
        markUpSpecialCharacters: true
      });
    }
  });

  expect.addType({
    name: 'binaryArray',
    base: 'array-like',
    digitWidth: 2,
    hexDumpWidth: 16,
    identify: false,
    prefix(output) {
      return output.code(`${this.name}([`, 'javascript');
    },
    suffix(output) {
      return output.code('])', 'javascript');
    },
    equal(a, b) {
      if (a === b) {
        return true;
      }

      if (a.length !== b.length) {
        return false;
      }

      for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
          return false;
        }
      }

      return true;
    },
    hexDump(obj, maxLength) {
      let hexDump = '';
      if (typeof maxLength !== 'number' || maxLength === 0) {
        maxLength = obj.length;
      }
      for (let i = 0; i < maxLength; i += this.hexDumpWidth) {
        if (hexDump.length > 0) {
          hexDump += '\n';
        }
        let hexChars = '';
        let asciiChars = ' │';

        for (let j = 0; j < this.hexDumpWidth; j += 1) {
          if (i + j < maxLength) {
            const octet = obj[i + j];
            hexChars += `${leftPad(
              octet.toString(16).toUpperCase(),
              this.digitWidth,
              '0'
            )} `;
            asciiChars += String.fromCharCode(octet)
              .replace(/\n/g, '␊')
              .replace(/\r/g, '␍');
          } else if (this.digitWidth === 2) {
            hexChars += '   ';
          }
        }

        if (this.digitWidth === 2) {
          hexDump += `${hexChars + asciiChars}│`;
        } else {
          hexDump += hexChars.replace(/\s+$/, '');
        }
      }
      return hexDump;
    },
    inspect(obj, depth, output) {
      this.prefix(output, obj);
      let codeStr = '';
      for (let i = 0; i < Math.min(this.hexDumpWidth, obj.length); i += 1) {
        if (i > 0) {
          codeStr += ', ';
        }
        const octet = obj[i];
        codeStr += `0x${leftPad(
          octet.toString(16).toUpperCase(),
          this.digitWidth,
          '0'
        )}`;
      }
      if (obj.length > this.hexDumpWidth) {
        codeStr += ` /* ${obj.length - this.hexDumpWidth} more */ `;
      }
      output.code(codeStr, 'javascript');
      this.suffix(output, obj);
      return output;
    },
    diffLimit: 512,
    diff(actual, expected, output, diff, inspect) {
      output.inline = false;
      if (Math.max(actual.length, expected.length) > this.diffLimit) {
        output.jsComment(`Diff suppressed due to size > ${this.diffLimit}`);
      } else {
        output
          .stringDiff(this.hexDump(actual), this.hexDump(expected), {
            type: 'Chars',
            markUpSpecialCharacters: false
          })
          // eslint-disable-next-line no-control-regex
          .replaceText(/[\x00-\x1f\x7f-\xff␊␍]/g, '.')
          .replaceText(/[│ ]/g, function(styles, content) {
            this.text(content);
          });
      }
      return output;
    }
  });

  [8, 16, 32].forEach(function(numBits) {
    ['Int', 'Uint'].forEach(intOrUint => {
      const constructorName = `${intOrUint + numBits}Array`;
      const Constructor = global[constructorName];
      if (typeof Constructor !== 'undefined') {
        expect.addType({
          name: constructorName,
          base: 'binaryArray',
          hexDumpWidth: 128 / numBits,
          digitWidth: numBits / 4,
          identify(obj) {
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
    identify(value) {
      return typeof value === 'string';
    },
    inspect(value, depth, output) {
      return output.singleQuotedString(value);
    },
    diffLimit: 4096,
    diff(actual, expected, output, diff, inspect) {
      if (Math.max(actual.length, expected.length) > this.diffLimit) {
        output.jsComment(`Diff suppressed due to size > ${this.diffLimit}`);
        return output;
      }
      output.stringDiff(actual, expected, {
        type: 'WordsWithSpace',
        markUpSpecialCharacters: true
      });
      output.inline = false;
      return output;
    }
  });

  expect.addType({
    name: 'number',
    identify(value) {
      return typeof value === 'number' && !isNaN(value);
    },
    inspect(value, depth, output) {
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
    identify(value) {
      return typeof value === 'number' && isNaN(value);
    },
    inspect(value, depth, output) {
      return output.jsPrimitive(value);
    }
  });

  expect.addType({
    name: 'boolean',
    identify(value) {
      return typeof value === 'boolean';
    },
    inspect(value, depth, output) {
      return output.jsPrimitive(value);
    }
  });

  expect.addType({
    name: 'undefined',
    identify(value) {
      return typeof value === 'undefined';
    },
    inspect(value, depth, output) {
      return output.jsPrimitive(value);
    }
  });

  expect.addType({
    name: 'null',
    identify(value) {
      return value === null;
    },
    inspect(value, depth, output) {
      return output.jsPrimitive(value);
    }
  });

  expect.addType({
    name: 'assertion',
    identify(value) {
      return value instanceof AssertionString;
    }
  });
};
