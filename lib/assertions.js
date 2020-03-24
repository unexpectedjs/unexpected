const utils = require('./utils');
const arrayChanges = require('array-changes');
const arrayChangesAsync = require('array-changes-async');
const throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');
const objectIs = utils.objectIs;
const extend = utils.extend;

module.exports = expect => {
  expect.addAssertion('<any> [not] to be (ok|truthy)', (expect, subject) => {
    const not = !!expect.flags.not;
    const condition = !!subject;
    if (condition === not) {
      expect.fail();
    }
  });

  expect.addAssertion(
    '<any> [not] to be (ok|truthy) <string>',
    (expect, subject, message) => {
      const not = !!expect.flags.not;
      const condition = !!subject;
      if (condition === not) {
        expect.fail({
          errorMode: 'bubble',
          message
        });
      }
    }
  );

  expect.addAssertion('<any> [not] to be <any>', (expect, subject, value) => {
    if (objectIs(subject, value) === expect.flags.not) {
      expect.fail({
        label: 'should be'
      });
    }
  });

  expect.addAssertion(
    '<string> [not] to be <string>',
    (expect, subject, value) => {
      expect(subject, '[not] to equal', value);
    }
  );

  expect.addAssertion('<boolean> [not] to be true', (expect, subject) => {
    expect(subject, '[not] to be', true);
  });

  expect.addAssertion('<boolean> [not] to be false', (expect, subject) => {
    expect(subject, '[not] to be', false);
  });

  expect.addAssertion('<any> [not] to be falsy', (expect, subject) => {
    expect(subject, '[!not] to be truthy');
  });

  expect.addAssertion(
    '<any> [not] to be falsy <string>',
    (expect, subject, message) => {
      const not = !!expect.flags.not;
      const condition = !!subject;
      if (condition !== not) {
        expect.fail({
          errorMode: 'bubble',
          message
        });
      }
    }
  );

  expect.addAssertion('<any> [not] to be null', (expect, subject) => {
    expect(subject, '[not] to be', null);
  });

  expect.addAssertion('<any> [not] to be undefined', (expect, subject) => {
    expect(typeof subject === 'undefined', '[not] to be truthy');
  });

  expect.addAssertion('<any> [not] to be defined', (expect, subject) => {
    expect(subject, '[!not] to be undefined');
  });

  expect.addAssertion('<number|NaN> [not] to be NaN', (expect, subject) => {
    expect(isNaN(subject), '[not] to be truthy');
  });

  expect.addAssertion(
    '<number> [not] to be close to <number> <number?>',
    (expect, subject, value, epsilon) => {
      expect.errorMode = 'bubble';
      if (typeof epsilon !== 'number') {
        epsilon = 1e-9;
      }

      expect.withError(
        () => {
          expect(
            Math.abs(subject - value),
            '[not] to be less than or equal to',
            epsilon
          );
        },
        e => {
          expect.fail(output => {
            output
              .error('expected ')
              .appendInspected(subject)
              .sp()
              .error(expect.testDescription)
              .sp()
              .appendInspected(value)
              .sp()
              .text('(epsilon: ')
              .jsNumber(epsilon.toExponential())
              .text(')');
          });
        }
      );
    }
  );

  expect.addAssertion(
    '<any> [not] to be (a|an) <type>',
    (expect, subject, type) => {
      expect.argsOutput[0] = output => {
        output.text(type.name);
      };
      expect(type.identify(subject), '[not] to be true');
    }
  );

  expect.addAssertion(
    '<any> [not] to be (a|an) <string>',
    (expect, subject, typeName) => {
      typeName = /^reg(?:exp?|ular expression)$/.test(typeName)
        ? 'regexp'
        : typeName;
      expect.argsOutput[0] = output => {
        output.jsString(typeName);
      };
      if (!expect.getType(typeName)) {
        expect.errorMode = 'nested';
        expect.fail(output => {
          output
            .error('Unknown type:')
            .sp()
            .jsString(typeName);
        });
      }
      expect(expect.subjectType.is(typeName), '[not] to be truthy');
    }
  );

  expect.addAssertion(
    '<any> [not] to be (a|an) <function>',
    (expect, subject, Constructor) => {
      const className = utils.getFunctionName(Constructor);
      if (className) {
        expect.argsOutput[0] = output => {
          output.text(className);
        };
      }
      expect(subject instanceof Constructor, '[not] to be truthy');
    }
  );

  expect.addAssertion(
    '<any> [not] to be one of <array>',
    (expect, subject, superset) => {
      let found = false;

      for (let i = 0; i < superset.length; i += 1) {
        found = found || objectIs(subject, superset[i]);
      }

      if (found === expect.flags.not) {
        expect.fail();
      }
    }
  );

  // Alias for common '[not] to be (a|an)' assertions
  expect.addAssertion(
    '<any> [not] to be an (object|array)',
    (expect, subject) => {
      expect(subject, '[not] to be an', expect.alternations[0]);
    }
  );

  expect.addAssertion(
    '<any> [not] to be a (boolean|number|string|function|regexp|regex|regular expression|date)',
    (expect, subject) => {
      expect(subject, '[not] to be a', expect.alternations[0]);
    }
  );

  expect.addAssertion(
    '<string> to be (the empty|an empty|a non-empty) string',
    (expect, subject) => {
      expect(
        subject,
        expect.alternations[0] === 'a non-empty'
          ? 'not to be empty'
          : 'to be empty'
      );
    }
  );

  expect.addAssertion(
    '<array-like> to be (the empty|an empty|a non-empty) array',
    (expect, subject) => {
      expect(
        subject,
        expect.alternations[0] === 'a non-empty'
          ? 'not to be empty'
          : 'to be empty'
      );
    }
  );

  expect.addAssertion('<string> to match <regexp>', (expect, subject, regexp) =>
    expect.withError(
      () => {
        const captures = subject.match(regexp);
        expect(captures, 'to be truthy');
        return captures;
      },
      e => {
        e.label = 'should match';
        expect.fail(e);
      }
    )
  );

  expect.addAssertion(
    '<string> not to match <regexp>',
    (expect, subject, regexp) =>
      expect.withError(
        () => {
          expect(regexp.test(subject), 'to be false');
        },
        e => {
          expect.fail({
            label: 'should not match',
            diff(output) {
              output.inline = false;
              let lastIndex = 0;
              function flushUntilIndex(i) {
                if (i > lastIndex) {
                  output.text(subject.substring(lastIndex, i));
                  lastIndex = i;
                }
              }
              subject.replace(new RegExp(regexp.source, 'g'), ($0, index) => {
                flushUntilIndex(index);
                lastIndex += $0.length;
                output.removedHighlight($0);
              });
              flushUntilIndex(subject.length);
              return output;
            }
          });
        }
      )
  );

  expect.addAssertion(
    '<object> [not] to have own property <string|Symbol>',
    (expect, subject, key) => {
      expect(
        Object.prototype.hasOwnProperty.call(subject, key),
        '[not] to be truthy'
      );
      return subject[key];
    }
  );

  expect.addAssertion(
    '<object> to have (enumerable|unenumerable|configurable|unconfigurable|writable|unwritable|readonly) property <string|Symbol>',
    (expect, subject, key) => {
      let attribute = expect.alternations[0];
      let negated = false;
      if (attribute.indexOf('un') === 0) {
        attribute = attribute.substr(2);
        negated = true;
      } else if (attribute === 'readonly') {
        attribute = 'writable';
        negated = true;
      }
      const descriptor = Object.getOwnPropertyDescriptor(subject, key);
      expect(descriptor, 'to be defined');
      expect(descriptor[attribute] !== negated, 'to be true');
      return subject[key];
    }
  );

  expect.addAssertion(
    '<object> [not] to have property <string|Symbol>',
    (expect, subject, key) => {
      const subjectType = expect.findTypeOf(subject);
      const subjectKey = subjectType.is('function')
        ? subject[key]
        : subjectType.valueForKey(subject, key);
      expect(subjectKey, '[!not] to be undefined');
      return subjectKey;
    }
  );

  expect.addAssertion(
    '<object> to have [own] property <string|Symbol> <any>',
    (expect, subject, key, expectedPropertyValue) =>
      expect(subject, 'to have [own] property', key).then(
        actualPropertyValue => {
          expect.argsOutput = function() {
            this.appendInspected(key)
              .sp()
              .error('with a value of')
              .sp()
              .appendInspected(expectedPropertyValue);
          };
          expect(actualPropertyValue, 'to equal', expectedPropertyValue);
          return actualPropertyValue;
        }
      )
  );

  expect.addAssertion(
    '<object> [not] to [only] have [own] properties <array>',
    (expect, subject, propertyNames) => {
      const unsupportedPropertyNames = propertyNames.filter(propertyName => {
        const type = typeof propertyName;
        return type !== 'string' && type !== 'number' && type !== 'symbol';
      });
      if (unsupportedPropertyNames.length > 0) {
        expect.errorMode = 'nested';
        expect.fail(function() {
          this.error(
            'All expected properties must be passed as strings, symbols, or numbers, but these are not:'
          ).indentLines();
          unsupportedPropertyNames.forEach(function(propertyName) {
            this.nl()
              .i()
              .appendInspected(propertyName);
          }, this);
          this.outdentLines();
        });
      }

      if (expect.flags.only) {
        if (expect.flags.not) {
          expect.errorMode = 'bubble';
          expect.fail(
            'The "not" flag cannot be used together with "to only have properties".'
          );
        }
        if (expect.flags.own) {
          expect.errorMode = 'bubble';
          expect.fail(
            'The "own" flag cannot be used together with "to only have properties".'
          );
        }
        const subjectType = expect.subjectType;
        const subjectKeys = subjectType.getKeys(subject).filter(
          key =>
            // include only those keys whose value is not undefined
            typeof subjectType.valueForKey(subject, key) !== 'undefined'
        );

        expect.withError(
          () => {
            expect(subjectKeys.length === propertyNames.length, 'to be true');
            // now catch differing property names
            const keyInValue = {};
            propertyNames.forEach(key => {
              keyInValue[key] = true;
            });
            subjectKeys.forEach(key =>
              expect(
                Object.prototype.hasOwnProperty.call(keyInValue, key),
                'to be true'
              )
            );
          },
          () => {
            expect.fail({
              diff: (output, diff, inspect, equal) => {
                output.inline = true;

                const keyInValue = {};
                propertyNames.forEach(key => {
                  keyInValue[key] = true;
                });

                subjectType.prefix(output, subject);
                output.nl().indentLines();

                subjectKeys.forEach((key, index) => {
                  const propertyOutput = subjectType.property(
                    output.clone(),
                    key,
                    inspect(subjectType.valueForKey(subject, key))
                  );
                  const delimiterOutput = subjectType.delimiter(
                    output.clone(),
                    index,
                    subjectKeys.length
                  );

                  output
                    .i()
                    .block(function() {
                      this.append(propertyOutput).amend(delimiterOutput);
                      if (
                        !Object.prototype.hasOwnProperty.call(keyInValue, key)
                      ) {
                        this.sp().annotationBlock(function() {
                          this.error('should be removed');
                        });
                      } else {
                        delete keyInValue[key];
                      }
                    })
                    .nl();
                });

                // list any remaining value properties as missing
                Object.keys(keyInValue).forEach(valueKey => {
                  output
                    .i()
                    .annotationBlock(function() {
                      this.error('missing')
                        .sp()
                        .append(inspect(valueKey));
                    })
                    .nl();
                });

                output.outdentLines();
                subjectType.suffix(output, subject);

                return output;
              }
            });
          }
        );
      } else {
        propertyNames.forEach(propertyName => {
          expect(
            subject,
            '[not] to have [own] property',
            typeof propertyName === 'number'
              ? String(propertyName)
              : propertyName
          );
        });
      }
    }
  );

  expect.addAssertion(
    '<object> to have [own] properties <object>',
    (expect, subject, properties) => {
      expect.withError(
        () => {
          Object.keys(properties).forEach(property => {
            const value = properties[property];
            if (typeof value === 'undefined') {
              expect(subject, 'not to have [own] property', property);
            } else {
              expect(subject, 'to have [own] property', property, value);
            }
          });
        },
        e => {
          expect.fail({
            diff(output, diff) {
              output.inline = false;
              const expected = extend({}, properties);
              const actual = {};
              const propertyNames = expect.findTypeOf(subject).getKeys(subject);
              // Might put duplicates into propertyNames, but that does not matter:
              for (const propertyName in subject) {
                if (
                  !Object.prototype.hasOwnProperty.call(subject, propertyName)
                ) {
                  propertyNames.push(propertyName);
                }
              }
              propertyNames.forEach(propertyName => {
                if (
                  (!expect.flags.own ||
                    Object.prototype.hasOwnProperty.call(
                      subject,
                      propertyName
                    )) &&
                  !(propertyName in properties)
                ) {
                  expected[propertyName] = subject[propertyName];
                }
                if (
                  (!expect.flags.own ||
                    Object.prototype.hasOwnProperty.call(
                      subject,
                      propertyName
                    )) &&
                  !(propertyName in actual)
                ) {
                  actual[propertyName] = subject[propertyName];
                }
              });
              return utils.wrapConstructorNameAroundOutput(
                diff(actual, expected),
                subject
              );
            }
          });
        }
      );
    }
  );

  expect.addAssertion(
    '<string|array-like> [not] to have length <number>',
    (expect, subject, length) => {
      if (!expect.flags.not) {
        expect.errorMode = 'nested';
      }
      expect(subject.length, '[not] to be', length);
    }
  );

  expect.addAssertion(
    '<string|array-like> [not] to be empty',
    (expect, subject) => {
      expect(subject, '[not] to have length', 0);
    }
  );

  expect.addAssertion(
    '<string|array-like|object> to be non-empty',
    (expect, subject) => {
      expect(subject, 'not to be empty');
    }
  );

  expect.addAssertion(
    '<object> to [not] [only] have keys <array>',
    (expect, subject, keys) => {
      const keysInSubject = {};
      const subjectType = expect.findTypeOf(subject);
      const subjectKeys = subjectType.getKeys(subject);
      subjectKeys.forEach(key => {
        keysInSubject[key] = true;
      });

      if (expect.flags.not && keys.length === 0) {
        return;
      }

      const hasKeys = keys.every(key => keysInSubject[key]);

      if (expect.flags.only) {
        expect(hasKeys, 'to be truthy');
        expect.withError(
          () => {
            expect(subjectKeys.length === keys.length, '[not] to be truthy');
          },
          () => {
            expect.fail({
              diff:
                !expect.flags.not &&
                ((output, diff, inspect, equal) => {
                  output.inline = true;
                  const keyInValue = {};
                  keys.forEach(key => {
                    keyInValue[key] = true;
                  });
                  const subjectIsArrayLike = subjectType.is('array-like');

                  subjectType.prefix(output, subject);
                  output.nl().indentLines();

                  subjectKeys.forEach((key, index) => {
                    const propertyOutput = subjectType.property(
                      output.clone(),
                      key,
                      inspect(subjectType.valueForKey(subject, key)),
                      subjectIsArrayLike
                    );
                    const delimiterOutput = subjectType.delimiter(
                      output.clone(),
                      index,
                      subjectKeys.length
                    );

                    output
                      .i()
                      .block(function() {
                        this.append(propertyOutput).amend(delimiterOutput);
                        if (!keyInValue[key]) {
                          this.sp().annotationBlock(function() {
                            this.error('should be removed');
                          });
                        }
                      })
                      .nl();
                  });

                  output.outdentLines();
                  subjectType.suffix(output, subject);

                  return output;
                })
            });
          }
        );
      } else {
        expect(hasKeys, '[not] to be truthy');
      }
    }
  );

  expect.addAssertion('<object> [not] to be empty', (expect, subject) => {
    if (
      expect.flags.not &&
      !expect.findTypeOf(subject).getKeys(subject).length
    ) {
      return expect.fail();
    }
    expect(subject, 'to [not] only have keys', []);
  });

  expect.addAssertion(
    '<object> not to have keys <array>',
    (expect, subject, keys) => {
      expect(subject, 'to not have keys', keys);
    }
  );

  expect.addAssertion(
    '<object> not to have key <string>',
    (expect, subject, value) => {
      expect(subject, 'to not have keys', [value]);
    }
  );

  expect.addAssertion('<object> not to have keys <string+>', function(
    expect,
    subject,
    value
  ) {
    expect(
      subject,
      'to not have keys',
      Array.prototype.slice.call(arguments, 2)
    );
  });

  expect.addAssertion(
    '<object> to [not] [only] have key <string>',
    (expect, subject, value) => {
      expect(subject, 'to [not] [only] have keys', [value]);
    }
  );

  expect.addAssertion('<object> to [not] [only] have keys <string+>', function(
    expect,
    subject
  ) {
    expect(
      subject,
      'to [not] [only] have keys',
      Array.prototype.slice.call(arguments, 2)
    );
  });

  expect.addAssertion('<string> [not] to contain <string+>', function(
    expect,
    subject
  ) {
    const args = Array.prototype.slice.call(arguments, 2);
    args.forEach(arg => {
      if (arg === '') {
        throw new Error(
          `The '${expect.testDescription}' assertion does not support the empty string`
        );
      }
    });
    expect.withError(
      () => {
        args.forEach(arg => {
          expect(subject.indexOf(arg) !== -1, '[not] to be truthy');
        });
      },
      e => {
        expect.fail({
          diff(output) {
            output.inline = false;
            let lastIndex = 0;
            function flushUntilIndex(i) {
              if (i > lastIndex) {
                output.text(subject.substring(lastIndex, i));
                lastIndex = i;
              }
            }
            if (expect.flags.not) {
              subject.replace(
                new RegExp(
                  args.map(arg => utils.escapeRegExpMetaChars(arg)).join('|'),
                  'g'
                ),
                ($0, index) => {
                  flushUntilIndex(index);
                  lastIndex += $0.length;
                  output.removedHighlight($0);
                }
              );
              flushUntilIndex(subject.length);
            } else {
              const ranges = [];
              args.forEach(arg => {
                let needle = arg;
                let partial = false;
                while (needle.length > 1) {
                  let found = false;
                  lastIndex = -1;
                  let index;
                  do {
                    index = subject.indexOf(needle, lastIndex + 1);
                    if (index !== -1) {
                      found = true;
                      ranges.push({
                        startIndex: index,
                        endIndex: index + needle.length,
                        partial
                      });
                    }
                    lastIndex = index;
                  } while (lastIndex !== -1);
                  if (found) {
                    break;
                  }
                  needle = arg.substr(0, needle.length - 1);
                  partial = true;
                }
              });
              lastIndex = 0;
              ranges
                .sort((a, b) => a.startIndex - b.startIndex)
                .forEach(({ startIndex, endIndex, partial }) => {
                  flushUntilIndex(startIndex);
                  const firstUncoveredIndex = Math.max(startIndex, lastIndex);
                  if (endIndex > firstUncoveredIndex) {
                    if (partial) {
                      output.partialMatch(
                        subject.substring(firstUncoveredIndex, endIndex)
                      );
                    } else {
                      output.match(
                        subject.substring(firstUncoveredIndex, endIndex)
                      );
                    }
                    lastIndex = endIndex;
                  }
                });
              flushUntilIndex(subject.length);
            }
            return output;
          }
        });
      }
    );
  });

  expect.addAssertion('<array-like> [not] to contain <any+>', function(
    expect,
    subject
  ) {
    const args = Array.prototype.slice.call(arguments, 2);
    expect.withError(
      () => {
        args.forEach(arg => {
          expect(
            subject &&
              Array.prototype.some.call(subject, item =>
                expect.equal(item, arg)
              ),
            '[not] to be truthy'
          );
        });
      },
      e => {
        expect.fail({
          diff:
            expect.flags.not &&
            ((output, diff, inspect, equal) =>
              diff(
                subject,
                Array.prototype.filter.call(
                  subject,
                  item => !args.some(arg => equal(item, arg))
                )
              ))
        });
      }
    );
  });

  expect.addAssertion(
    [
      '<string> [not] to begin with <string>',
      '<string> [not] to start with <string>'
    ],
    (expect, subject, value) => {
      if (value === '') {
        throw new Error(
          `The '${expect.testDescription}' assertion does not support a prefix of the empty string`
        );
      }
      var isTruncated = false;
      var outputSubject = utils.truncateSubjectStringForBegin(subject, value);
      if (outputSubject === null) {
        outputSubject = subject;
      } else {
        isTruncated = true;
      }
      expect.subjectOutput = output => {
        output = output.jsString(
          "'" + outputSubject.replace(/\n/g, '\\n') + "'"
        );
        if (isTruncated) {
          output.jsComment('...');
        }
      };
      expect.withError(
        () => {
          expect(subject.substr(0, value.length), '[not] to equal', value);
        },
        () => {
          expect.fail({
            diff(output) {
              output.inline = false;
              if (expect.flags.not) {
                output
                  .removedHighlight(value)
                  .text(subject.substr(value.length));
              } else {
                let i = 0;
                while (subject[i] === value[i]) {
                  i += 1;
                }
                if (i === 0) {
                  // No common prefix, omit diff
                  return null;
                } else {
                  output
                    .partialMatch(subject.substr(0, i))
                    .text(outputSubject.substr(i))
                    .jsComment(isTruncated ? '...' : '');
                }
              }
              return output;
            }
          });
        }
      );
    }
  );

  expect.addAssertion(
    '<string> [not] to end with <string>',
    (expect, subject, value) => {
      if (value === '') {
        throw new Error(
          `The '${expect.testDescription}' assertion does not support a suffix of the empty string`
        );
      }
      var isTruncated = false;
      var outputSubject = utils.truncateSubjectStringForEnd(subject, value);
      if (outputSubject === null) {
        outputSubject = subject;
      } else {
        isTruncated = true;
      }
      expect.subjectOutput = output => {
        if (isTruncated) {
          output = output.jsComment('...');
        }
        output.jsString("'" + outputSubject.replace(/\n/g, '\\n') + "'");
      };
      expect.withError(
        () => {
          expect(subject.substr(-value.length), '[not] to equal', value);
        },
        () => {
          expect.fail({
            diff(output) {
              output.inline = false;
              if (expect.flags.not) {
                output
                  .text(subject.substr(0, subject.length - value.length))
                  .removedHighlight(value);
              } else {
                let i = 0;
                while (
                  outputSubject[outputSubject.length - 1 - i] ===
                  value[value.length - 1 - i]
                ) {
                  i += 1;
                }
                if (i === 0) {
                  // No common suffix, omit diff
                  return null;
                }
                output
                  .jsComment(isTruncated ? '...' : '')
                  .text(outputSubject.substr(0, outputSubject.length - i))
                  .partialMatch(
                    outputSubject.substr(
                      outputSubject.length - i,
                      outputSubject.length
                    )
                  );
              }
              return output;
            }
          });
        }
      );
    }
  );

  expect.addAssertion('<number> [not] to be finite', (expect, subject) => {
    expect(isFinite(subject), '[not] to be truthy');
  });

  expect.addAssertion('<number> [not] to be infinite', (expect, subject) => {
    expect(!isNaN(subject) && !isFinite(subject), '[not] to be truthy');
  });

  expect.addAssertion(
    [
      '<number> [not] to be within <number> <number>',
      '<BigInt> [not] to be within <BigInt> <BigInt>',
      '<string> [not] to be within <string> <string>'
    ],
    (expect, subject, start, finish) => {
      expect.argsOutput = output => {
        output
          .appendInspected(start)
          .text('..')
          .appendInspected(finish);
      };
      expect(subject >= start && subject <= finish, '[not] to be truthy');
    }
  );

  expect.addAssertion(
    [
      '<number> [not] to be (less than|below) <number>',
      '<BigInt> [not] to be (less than|below) <BigInt>',
      '<string> [not] to be (less than|below) <string>'
    ],
    (expect, subject, value) => {
      expect(subject < value, '[not] to be truthy');
    }
  );

  expect.addAssertion(
    '<string> [not] to be (less than|below) <string>',
    (expect, subject, value) => {
      expect(subject < value, '[not] to be truthy');
    }
  );

  expect.addAssertion(
    [
      '<number> [not] to be less than or equal to <number>',
      '<BigInt> [not] to be less than or equal to <BigInt>',
      '<string> [not] to be less than or equal to <string>'
    ],
    (expect, subject, value) => {
      expect(subject <= value, '[not] to be truthy');
    }
  );

  expect.addAssertion(
    [
      '<number> [not] to be (greater than|above) <number>',
      '<BigInt> [not] to be (greater than|above) <BigInt>',
      '<string> [not] to be (greater than|above) <string>'
    ],
    (expect, subject, value) => {
      expect(subject > value, '[not] to be truthy');
    }
  );

  expect.addAssertion(
    [
      '<number> [not] to be greater than or equal to <number>',
      '<BigInt> [not] to be greater than or equal to <BigInt>',
      '<string> [not] to be greater than or equal to <string>'
    ],
    (expect, subject, value) => {
      expect(subject >= value, '[not] to be truthy');
    }
  );

  expect.addAssertion('<number> [not] to be positive', (expect, subject) => {
    expect(subject, '[not] to be greater than', 0);
  });

  expect.addAssertion('<BigInt> [not] to be positive', (expect, subject) => {
    expect(subject > 0, '[not] to be true');
  });

  expect.addAssertion('<number> [not] to be negative', (expect, subject) => {
    expect(subject, '[not] to be less than', 0);
  });

  expect.addAssertion('<BigInt> [not] to be negative', (expect, subject) => {
    expect(subject < 0, '[not] to be true');
  });

  expect.addAssertion('<any> to equal <any>', (expect, subject, value) => {
    expect.withError(
      () => {
        expect(expect.equal(value, subject), 'to be truthy');
      },
      e => {
        expect.fail({
          label: 'should equal',
          diff(output, diff) {
            return diff(subject, value);
          }
        });
      }
    );
  });

  expect.addAssertion('<any> not to equal <any>', (expect, subject, value) => {
    expect(expect.equal(value, subject), 'to be falsy');
  });

  expect.addAssertion('<function> to error', (expect, subject) =>
    expect
      .promise(() => subject())
      .then(
        () => {
          expect.fail();
        },
        error => error
      )
  );

  expect.addAssertion(
    '<function> to error [with] <any>',
    (expect, subject, arg) =>
      expect(subject, 'to error').then(error => {
        expect.errorMode = 'nested';
        return expect.withError(
          () => {
            return expect(error, 'to satisfy', arg);
          },
          e => {
            e.originalError = error;
            throw e;
          }
        );
      })
  );

  expect.addAssertion('<function> not to error', (expect, subject) => {
    let threw = false;
    return expect
      .promise(() => {
        try {
          return subject();
        } catch (e) {
          threw = true;
          throw e;
        }
      })
      .caught(error => {
        expect.errorMode = 'nested';
        expect.fail({
          output(output) {
            output
              .error(threw ? 'threw' : 'returned promise rejected with')
              .error(': ')
              .appendErrorMessage(error);
          },
          originalError: error
        });
      });
  });

  expect.addAssertion('<function> not to throw', (expect, subject) => {
    let threw = false;
    let error;

    try {
      subject();
    } catch (e) {
      error = e;
      threw = true;
    }

    if (threw) {
      expect.errorMode = 'nested';
      expect.fail({
        output(output) {
          output.error('threw: ').appendErrorMessage(error);
        },
        originalError: error
      });
    }
  });

  expect.addAssertion(
    '<function> to (throw|throw error|throw exception)',
    (expect, subject) => {
      try {
        subject();
      } catch (e) {
        return e;
      }
      expect.errorMode = 'nested';
      expect.fail('did not throw');
    }
  );

  expect.addAssertion('<object> to satisfy <function>', expect =>
    expect.fail()
  );

  expect.addAssertion(
    '<function> to throw (a|an) <function>',
    (expect, subject, value) => {
      const constructorName = utils.getFunctionName(value);
      if (constructorName) {
        expect.argsOutput[0] = output => {
          output.jsFunctionName(constructorName);
        };
      }
      expect.errorMode = 'nested';
      return expect(subject, 'to throw').tap(error => {
        expect(error, 'to be a', value);
      });
    }
  );

  expect.addAssertion(
    '<function> to (throw|throw error|throw exception) <any>',
    (expect, subject, arg) => {
      expect.errorMode = 'nested';
      return expect(subject, 'to throw').then(error => {
        // in the presence of a matcher an error must have been thrown.

        expect.errorMode = 'nested';
        return expect.withError(
          () => {
            return expect(error, 'to satisfy', arg);
          },
          err => {
            err.originalError = error;
            throw err;
          }
        );
      });
    }
  );

  expect.addAssertion(
    '<function> to have arity <number>',
    (expect, { length }, value) => {
      expect(length, 'to equal', value);
    }
  );

  expect.addAssertion(
    [
      '<object> to have values [exhaustively] satisfying <any>',
      '<object> to have values [exhaustively] satisfying <assertion>',
      '<object> to be (a map|a hash|an object) whose values [exhaustively] satisfy <any>',
      '<object> to be (a map|a hash|an object) whose values [exhaustively] satisfy <assertion>'
    ],
    (expect, subject, nextArg) => {
      expect.errorMode = 'nested';
      expect(subject, 'not to be empty');
      expect.errorMode = 'bubble';

      const keys = expect.subjectType.getKeys(subject);
      const expected = {};
      keys.forEach(key => {
        if (typeof nextArg === 'string') {
          expected[key] = expect.it(s => expect.shift(s));
        } else {
          expected[key] = nextArg;
        }
      });
      return expect.withError(
        () => expect(subject, 'to [exhaustively] satisfy', expected),
        err => {
          expect.fail({
            message(output) {
              output.append(
                expect.standardErrorMessage(output.clone(), {
                  compact: err && err._isUnexpected && err.hasDiff()
                })
              );
            },
            diff(output) {
              const diff = err.getDiff({ output });
              diff.inline = true;
              return diff;
            }
          });
        }
      );
    }
  );

  expect.addAssertion(
    [
      '<array-like> to have items [exhaustively] satisfying <any>',
      '<array-like> to have items [exhaustively] satisfying <assertion>',
      '<array-like> to be an array whose items [exhaustively] satisfy <any>',
      '<array-like> to be an array whose items [exhaustively] satisfy <assertion>'
    ],
    (expect, subject, ...rest) => {
      // ...
      expect.errorMode = 'nested';
      expect(subject, 'not to be empty');
      expect.errorMode = 'bubble';

      return expect.withError(
        () =>
          expect(subject, 'to have values [exhaustively] satisfying', ...rest),
        err => {
          expect.fail({
            message(output) {
              output.append(
                expect.standardErrorMessage(output.clone(), {
                  compact: err && err._isUnexpected && err.hasDiff()
                })
              );
            },
            diff(output) {
              const diff = err.getDiff({ output });
              diff.inline = true;
              return diff;
            }
          });
        }
      );
    }
  );

  expect.addAssertion(
    [
      '<object> to have keys satisfying <any>',
      '<object> to have keys satisfying <assertion>',
      '<object> to be (a map|a hash|an object) whose (keys|properties) satisfy <any>',
      '<object> to be (a map|a hash|an object) whose (keys|properties) satisfy <assertion>'
    ],
    (expect, subject, ...rest) => {
      expect.errorMode = 'nested';
      expect(subject, 'not to be empty');
      expect.errorMode = 'default';

      const keys = expect.subjectType.getKeys(subject);
      return expect(keys, 'to have items satisfying', ...rest);
    }
  );

  expect.addAssertion(
    [
      '<object> [not] to have a value [exhaustively] satisfying <any>',
      '<object> [not] to have a value [exhaustively] satisfying <assertion>'
    ],
    (expect, subject, nextArg) => {
      expect.errorMode = 'nested';
      expect(subject, 'not to be empty');
      expect.errorMode = 'bubble';

      const subjectType = expect.findTypeOf(subject);
      const keys = subjectType.getKeys(subject);
      const not = !!expect.flags.not;

      const keyResults = new Array(keys.length);

      expect.withError(
        () =>
          expect.promise[not ? 'all' : 'any'](
            keys.map(key => {
              let expected;
              if (typeof nextArg === 'string') {
                expected = expect.it(s => expect.shift(s));
              } else {
                expected = nextArg;
              }

              keyResults[key] = expect.promise(() =>
                expect(
                  subjectType.valueForKey(subject, key),
                  '[not] to [exhaustively] satisfy',
                  expected
                )
              );
              return keyResults[key];
            })
          ),
        err => {
          expect.fail({
            message(output) {
              output.append(
                expect.standardErrorMessage(output.clone(), {
                  compact: err && err._isUnexpected && err.hasDiff()
                })
              );
            },
            diff:
              expect.flags.not &&
              ((output, diff, inspect, equal) => {
                const expectedObject = subjectType.is('array-like') ? [] : {};
                keys.forEach(key => {
                  if (keyResults[key].isFulfilled()) {
                    expectedObject[key] = subjectType.valueForKey(subject, key);
                  }
                });

                return diff(subject, expectedObject);
              })
          });
        }
      );
    }
  );

  expect.addAssertion(
    [
      '<array-like> [not] to have an item [exhaustively] satisfying <any>',
      '<array-like> [not] to have an item [exhaustively] satisfying <assertion>'
    ],
    (expect, subject, ...rest) => {
      expect.errorMode = 'nested';
      expect(subject, 'not to be empty');
      expect.errorMode = 'default';

      return expect(
        subject,
        '[not] to have a value [exhaustively] satisfying',
        ...rest
      );
    }
  );

  expect.addAssertion('<object> to be canonical', (expect, subject) => {
    const stack = [];

    (function traverse(obj) {
      let i;
      for (i = 0; i < stack.length; i += 1) {
        if (stack[i] === obj) {
          return;
        }
      }
      if (obj && typeof obj === 'object') {
        const keys = Object.keys(obj);
        for (i = 0; i < keys.length - 1; i += 1) {
          expect(keys[i], 'to be less than', keys[i + 1]);
        }
        stack.push(obj);
        keys.forEach(key => {
          traverse(obj[key]);
        });
        stack.pop();
      }
    })(subject);
  });

  expect.addAssertion(
    '<Error> to have message <any>',
    (expect, subject, value) => {
      expect.errorMode = 'nested';
      return expect(
        subject.isUnexpected
          ? subject.getErrorMessage('text').toString()
          : subject.message,
        'to satisfy',
        value
      );
    }
  );

  expect.addAssertion(
    '<Error> to [exhaustively] satisfy <Error>',
    (expect, subject, value) => {
      expect(subject.constructor, 'to be', value.constructor);

      const unwrappedValue = expect.argTypes[0].unwrap(value);
      return expect.withError(
        () => expect(subject, 'to [exhaustively] satisfy', unwrappedValue),
        e => {
          expect.fail({
            diff(output, diff) {
              output.inline = false;
              const unwrappedSubject = expect.subjectType.unwrap(subject);
              return utils.wrapConstructorNameAroundOutput(
                diff(unwrappedSubject, unwrappedValue),
                subject
              );
            }
          });
        }
      );
    }
  );

  expect.addAssertion(
    '<Error> to [exhaustively] satisfy <object>',
    (expect, subject, value) => {
      const valueType = expect.argTypes[0];
      const subjectKeys = expect.subjectType.getKeys(subject);
      const valueKeys = valueType.getKeys(value);
      const convertedSubject = {};
      subjectKeys.concat(valueKeys).forEach(key => {
        convertedSubject[key] = subject[key];
      });
      return expect(convertedSubject, 'to [exhaustively] satisfy', value);
    }
  );

  expect.addAssertion(
    '<Error> to [exhaustively] satisfy <regexp|string|any>',
    (expect, { message }, value) =>
      expect(message, 'to [exhaustively] satisfy', value)
  );

  expect.addAssertion(
    '<UnexpectedError> to [exhaustively] satisfy <regexp|string>',
    (expect, error, value) => {
      expect.errorMode = 'bubble';
      return expect(error, 'to have message', value);
    }
  );

  expect.addAssertion(
    '<binaryArray> to [exhaustively] satisfy <expect.it>',
    (expect, subject, value) =>
      expect.withError(
        () => value(subject, expect.context),
        e => {
          expect.fail({
            diff(output, diff, inspect, equal) {
              output.inline = false;
              return output.appendErrorMessage(e);
            }
          });
        }
      )
  );

  expect.addAssertion(
    '<any|Error> to [exhaustively] satisfy <expect.it>',
    (expect, subject, value) => expect.promise(() => value(subject))
  );

  if (typeof Buffer !== 'undefined') {
    expect.addAssertion(
      '<Buffer> [when] decoded as <string> <assertion?>',
      (expect, subject, value) => expect.shift(subject.toString(value))
    );
  }

  expect.addAssertion(
    '<any> not to [exhaustively] satisfy [assertion] <any>',
    (expect, subject, value) =>
      expect.promise((resolve, reject) =>
        expect
          .promise(() =>
            expect(subject, 'to [exhaustively] satisfy [assertion]', value)
          )
          .then(() => {
            try {
              expect.fail();
            } catch (e) {
              reject(e);
            }
          })
          .caught(e => {
            if (!e || !e._isUnexpected) {
              reject(e);
            } else {
              resolve();
            }
          })
      )
  );

  expect.addAssertion(
    '<any> to [exhaustively] satisfy assertion <any>',
    (expect, subject, value) => {
      expect.errorMode = 'bubble'; // to satisfy assertion 'to be a number' => to be a number
      return expect(subject, 'to [exhaustively] satisfy', value);
    }
  );

  expect.addAssertion(
    '<any> to [exhaustively] satisfy assertion <assertion>',
    (expect, subject) => {
      expect.errorMode = 'bubble'; // to satisfy assertion 'to be a number' => to be a number
      return expect.shift();
    }
  );

  expect.addAssertion(
    '<any|object> to [exhaustively] satisfy [assertion] <expect.it>',
    (expect, subject, value) =>
      expect.withError(
        () => value(subject, expect.context),
        e => {
          expect.fail({
            diff(output) {
              output.inline = false;
              return output.appendErrorMessage(e);
            }
          });
        }
      )
  );

  expect.addAssertion(
    '<regexp> to [exhaustively] satisfy <regexp>',
    (expect, subject, value) => {
      expect(subject, 'to equal', value);
    }
  );

  expect.addAssertion(
    '<string> to [exhaustively] satisfy <regexp>',
    (expect, subject, value) => {
      expect.errorMode = 'bubble';
      return expect(subject, 'to match', value);
    }
  );

  expect.addAssertion(
    '<function> to [exhaustively] satisfy <function>',
    (expect, subject, value) => {
      expect.errorMode = 'bubble';
      expect(subject, 'to be', value);
    }
  );

  expect.addAssertion(
    '<binaryArray> to [exhaustively] satisfy <binaryArray>',
    (expect, subject, value) => {
      expect.errorMode = 'bubble';
      expect(subject, 'to equal', value);
    }
  );

  expect.addAssertion(
    '<any> to [exhaustively] satisfy <any>',
    (expect, subject, value) => {
      expect.errorMode = 'bubble';
      expect(subject, 'to equal', value);
    }
  );

  expect.addAssertion(
    '<array-like> to [exhaustively] satisfy <array-like>',
    (expect, subject, value) => {
      expect.errorMode = 'bubble';
      const subjectType = expect.subjectType;
      const subjectKeys = subjectType.getKeys(subject);
      const valueType = expect.argTypes[0];
      const valueKeys = valueType.getKeys(value).filter(
        key =>
          utils.numericalRegExp.test(key) ||
          typeof key === 'symbol' ||
          // include keys whose value is not undefined on either LHS or RHS
          typeof valueType.valueForKey(value, key) !== 'undefined' ||
          typeof subjectType.valueForKey(subject, key) !== 'undefined'
      );
      const keyPromises = {};
      valueKeys.forEach(function(keyInValue) {
        keyPromises[keyInValue] = expect.promise(function() {
          const subjectKey = subjectType.valueForKey(subject, keyInValue);
          const valueKey = valueType.valueForKey(value, keyInValue);
          const valueKeyType = expect.findTypeOf(valueKey);

          if (valueKeyType.is('expect.it')) {
            expect.context.thisObject = subject;
            return valueKey(subjectKey, expect.context);
          } else {
            return expect(subjectKey, 'to [exhaustively] satisfy', valueKey);
          }
        });
      });
      return expect.promise
        .all([
          expect.promise(() => {
            // create subject key presence object
            const remainingKeysInSubject = {};
            subjectKeys.forEach(key => {
              remainingKeysInSubject[key] = 1; // present in subject
            });
            // discard or mark missing each previously seen value key
            valueKeys.forEach(key => {
              if (
                !remainingKeysInSubject[key] &&
                (utils.numericalRegExp.test(key) || expect.flags.exhaustively)
              ) {
                remainingKeysInSubject[key] = 2; // present in value
              } else {
                delete remainingKeysInSubject[key];
              }
            });
            // check whether there are any outstanding keys we cannot account for
            const outstandingKeys = Object.keys(remainingKeysInSubject).filter(
              key =>
                utils.numericalRegExp.test(key) ||
                typeof key === 'symbol' ||
                (typeof subjectType.valueForKey(subject, key) !== 'undefined' &&
                  // key was only in the value
                  remainingKeysInSubject[key] === 2)
            );
            // key checking succeeds with no outstanding keys
            expect(outstandingKeys.length === 0, 'to be truthy');
          }),
          expect.promise.all(keyPromises)
        ])
        .caught(() => {
          let i = 0;
          return expect.promise.settle(keyPromises).then(() => {
            const toSatisfyMatrix = new Array(subject.length);
            for (i = 0; i < subject.length; i += 1) {
              toSatisfyMatrix[i] = new Array(value.length);
              if (i < value.length) {
                toSatisfyMatrix[i][i] =
                  keyPromises[i].isFulfilled() || keyPromises[i].reason();
              }
            }
            if (subject.length > 10 || value.length > 10) {
              const indexByIndexChanges = [];
              for (i = 0; i < subject.length; i += 1) {
                const promise = keyPromises[i];
                if (i < value.length) {
                  indexByIndexChanges.push({
                    type: promise.isFulfilled() ? 'equal' : 'similar',
                    value: subject[i],
                    expected: value[i],
                    actualIndex: i,
                    expectedIndex: i,
                    last: i === Math.max(subject.length, value.length) - 1
                  });
                } else {
                  indexByIndexChanges.push({
                    type: 'remove',
                    value: subject[i],
                    actualIndex: i,
                    last: i === subject.length - 1
                  });
                }
              }
              for (i = subject.length; i < value.length; i += 1) {
                indexByIndexChanges.push({
                  type: 'insert',
                  value: value[i],
                  expectedIndex: i
                });
              }
              return failWithChanges(indexByIndexChanges);
            }

            let isAsync = false;
            const subjectElements = utils.duplicateArrayLikeUsingType(
              subject,
              subjectType
            );
            const valueElements = utils.duplicateArrayLikeUsingType(
              value,
              valueType
            );
            const nonNumericalKeysAndSymbols =
              !subjectType.numericalPropertiesOnly &&
              utils.uniqueNonNumericalStringsAndSymbols(subjectKeys, valueKeys);

            const changes = arrayChanges(
              subjectElements,
              valueElements,
              function equal(a, b, aIndex, bIndex) {
                toSatisfyMatrix[aIndex] = toSatisfyMatrix[aIndex] || [];
                const existingResult = toSatisfyMatrix[aIndex][bIndex];
                if (typeof existingResult !== 'undefined') {
                  return existingResult === true;
                }
                let result;
                try {
                  result = expect(a, 'to [exhaustively] satisfy', b);
                } catch (err) {
                  throwIfNonUnexpectedError(err);
                  toSatisfyMatrix[aIndex][bIndex] = err;
                  return false;
                }
                result.then(
                  () => {},
                  () => {}
                );
                if (result.isPending()) {
                  isAsync = true;
                  return false;
                }
                toSatisfyMatrix[aIndex][bIndex] = true;
                return true;
              },
              (a, b) => subjectType.similar(a, b),
              {
                includeNonNumericalProperties: nonNumericalKeysAndSymbols
              }
            );
            if (isAsync) {
              return expect
                .promise((resolve, reject) => {
                  arrayChangesAsync(
                    subject,
                    value,
                    function equal(a, b, aIndex, bIndex, fn) {
                      toSatisfyMatrix[aIndex] = toSatisfyMatrix[aIndex] || [];
                      const existingResult = toSatisfyMatrix[aIndex][bIndex];
                      if (typeof existingResult !== 'undefined') {
                        return fn(existingResult === true);
                      }
                      expect
                        .promise(() =>
                          expect(a, 'to [exhaustively] satisfy', b)
                        )
                        .then(
                          () => {
                            toSatisfyMatrix[aIndex][bIndex] = true;
                            fn(true);
                          },
                          err => {
                            toSatisfyMatrix[aIndex][bIndex] = err;
                            fn(false);
                          }
                        );
                    },
                    (a, b, aIndex, bIndex, fn) => {
                      fn(subjectType.similar(a, b));
                    },
                    nonNumericalKeysAndSymbols,
                    resolve
                  );
                })
                .then(failWithChanges);
            } else {
              return failWithChanges(changes);
            }

            function failWithChanges(changes) {
              expect.errorMode = 'default';
              expect.fail({
                diff(output, diff, inspect, equal) {
                  output.inline = true;
                  const indexOfLastNonInsert = changes.reduce(
                    (previousValue, { type }, index) =>
                      type === 'insert' ? previousValue : index,
                    -1
                  );
                  const prefixOutput = subjectType.prefix(
                    output.clone(),
                    subject
                  );
                  output
                    .append(prefixOutput)
                    .nl(prefixOutput.isEmpty() ? 0 : 1);

                  if (subjectType.indent) {
                    output.indentLines();
                  }
                  const packing = utils.packArrows(changes); // NOTE: Will have side effects in changes if the packing results in too many arrow lanes
                  output.arrowsAlongsideChangeOutputs(
                    packing,
                    changes.map((diffItem, index) => {
                      const delimiterOutput = subjectType.delimiter(
                        output.clone(),
                        index,
                        indexOfLastNonInsert + 1
                      );
                      const type = diffItem.type;
                      if (type === 'moveTarget') {
                        return output.clone();
                      } else {
                        return output.clone().block(function() {
                          if (type === 'moveSource') {
                            const propertyOutput = subjectType.property(
                              output.clone(),
                              diffItem.actualIndex,
                              inspect(diffItem.value),
                              true
                            );

                            this.append(propertyOutput)
                              .amend(delimiterOutput)
                              .sp()
                              .error('// should be moved');
                          } else if (type === 'insert') {
                            this.annotationBlock(function() {
                              if (
                                expect
                                  .findTypeOf(diffItem.value)
                                  .is('expect.it')
                              ) {
                                this.error('missing: ').block(function() {
                                  this.omitSubject = undefined;
                                  const promise =
                                    keyPromises[diffItem.expectedIndex];
                                  if (promise.isRejected()) {
                                    this.appendErrorMessage(promise.reason());
                                  } else {
                                    this.appendInspected(diffItem.value);
                                  }
                                });
                              } else {
                                const index =
                                  typeof diffItem.actualIndex !== 'undefined'
                                    ? diffItem.actualIndex
                                    : diffItem.expectedIndex;
                                const propertyOutput = subjectType.property(
                                  output.clone(),
                                  index,
                                  inspect(diffItem.value),
                                  true
                                );
                                this.error('missing ').append(propertyOutput);
                              }
                            });
                          } else {
                            const propertyOutput = subjectType.property(
                              output.clone(),
                              diffItem.actualIndex,
                              inspect(diffItem.value),
                              true
                            );

                            this.block(function() {
                              if (type === 'remove') {
                                this.append(propertyOutput)
                                  .amend(delimiterOutput)
                                  .sp()
                                  .error('// should be removed');
                              } else if (type === 'equal') {
                                this.append(propertyOutput).amend(
                                  delimiterOutput
                                );
                              } else {
                                const toSatisfyResult =
                                  toSatisfyMatrix[diffItem.actualIndex][
                                    diffItem.expectedIndex
                                  ];
                                const valueDiff =
                                  toSatisfyResult &&
                                  toSatisfyResult !== true &&
                                  toSatisfyResult.getDiff({
                                    output: output.clone()
                                  });
                                if (valueDiff && valueDiff.inline) {
                                  this.append(valueDiff).amend(delimiterOutput);
                                } else {
                                  this.append(propertyOutput)
                                    .amend(delimiterOutput)
                                    .sp()
                                    .annotationBlock(function() {
                                      this.omitSubject = diffItem.value;
                                      const label = toSatisfyResult.getLabel();
                                      if (label) {
                                        this.error(label)
                                          .sp()
                                          .block(inspect(diffItem.expected));
                                        if (valueDiff) {
                                          this.nl(2).append(valueDiff);
                                        }
                                      } else {
                                        this.appendErrorMessage(
                                          toSatisfyResult
                                        );
                                      }
                                    });
                                }
                              }
                            });
                          }
                        });
                      }
                    })
                  );

                  if (subjectType.indent) {
                    output.outdentLines();
                  }
                  const suffixOutput = subjectType.suffix(
                    output.clone(),
                    subject
                  );
                  output
                    .nl(suffixOutput.isEmpty() ? 0 : 1)
                    .append(suffixOutput);

                  return output;
                }
              });
            }
          });
        });
    }
  );

  expect.addAssertion(
    '<object> to [exhaustively] satisfy <object>',
    (expect, subject, value) => {
      const valueType = expect.argTypes[0];
      const subjectType = expect.subjectType;
      const subjectIsArrayLike = subjectType.is('array-like');
      if (subject === value) {
        return;
      }
      if (valueType.is('array-like') && !subjectIsArrayLike) {
        expect.fail();
      }

      const subjectKeys = subjectType.getKeys(subject);
      const valueKeys = valueType.getKeys(value);
      // calculate the unique keys early given enumerability no
      // longer affects what is included in the list of keys
      const uniqueKeys = subjectType.uniqueKeys(subjectKeys, valueKeys);

      const promiseByKey = {};
      let forceExhaustivelyComparison = false;
      uniqueKeys.forEach((key, index) => {
        const subjectHasKey = subjectType.hasKey(subject, key);
        const valueKey = valueType.hasKey(value, key, true)
          ? valueType.valueForKey(value, key)
          : undefined;
        const valueKeyType = expect.findTypeOf(valueKey);
        if (expect.flags.exhaustively) {
          if (valueKeyType.is('expect.it') && !subjectHasKey) {
            // ensure value only expect.it key is marked missing
            forceExhaustivelyComparison = true;
          }
        } else if (subjectHasKey && typeof valueKey === 'undefined') {
          // ignore subject only keys unless we are being exhaustive
          return;
        }
        const subjectKey = subjectHasKey
          ? subjectType.valueForKey(subject, key)
          : undefined;

        promiseByKey[key] = expect.promise(() => {
          if (valueKeyType.is('expect.it')) {
            expect.context.thisObject = subject;
            return valueKey(subjectKey, expect.context);
          } else {
            return expect(subjectKey, 'to [exhaustively] satisfy', valueKey);
          }
        });
      });

      return expect.promise
        .all([
          expect.promise(() => {
            if (forceExhaustivelyComparison) {
              throw new Error('exhaustive comparison failure');
            }
          }),
          expect.promise.all(promiseByKey)
        ])
        .caught(() =>
          expect.promise.settle(promiseByKey).then(() => {
            expect.fail({
              diff(output, diff, inspect, equal) {
                output.inline = true;
                const subjectIsArrayLike = subjectType.is('array-like');
                // Skip missing keys expected to be missing so they don't get rendered in the diff
                const keys = uniqueKeys.filter(key => {
                  return (
                    subjectType.hasKey(subject, key) ||
                    typeof valueType.valueForKey(value, key) !== 'undefined'
                  );
                });
                const prefixOutput = subjectType.prefix(
                  output.clone(),
                  subject
                );
                output.append(prefixOutput).nl(prefixOutput.isEmpty() ? 0 : 1);

                if (subjectType.indent) {
                  output.indentLines();
                }
                keys.forEach((key, index) => {
                  const subjectKey = subjectType.valueForKey(subject, key);
                  const valueKey = valueType.valueForKey(value, key);
                  output
                    .nl(index > 0 ? 1 : 0)
                    .i()
                    .block(function() {
                      let valueOutput;
                      const annotation = output.clone();
                      let conflicting;

                      if (
                        Object.prototype.hasOwnProperty.call(
                          promiseByKey,
                          key
                        ) &&
                        promiseByKey[key].isRejected()
                      ) {
                        conflicting = promiseByKey[key].reason();
                      }

                      const missingArrayIndex =
                        subjectType.is('array-like') &&
                        !subjectType.hasKey(subject, key);

                      let isInlineDiff = true;

                      output.omitSubject = subjectKey;
                      if (!valueType.hasKey(value, key)) {
                        if (expect.flags.exhaustively) {
                          annotation.error('should be removed');
                        } else {
                          conflicting = null;
                        }
                      } else if (!subjectType.hasKey(subject, key)) {
                        if (expect.findTypeOf(valueKey).is('expect.it')) {
                          if (promiseByKey[key].isRejected()) {
                            output.error('// missing:').sp();
                            valueOutput = output
                              .clone()
                              .appendErrorMessage(promiseByKey[key].reason());
                          } else {
                            output.error('// missing').sp();
                            valueOutput = output
                              .clone()
                              .error('should satisfy')
                              .sp()
                              .block(inspect(value[key]));
                          }
                        } else {
                          output.error('// missing').sp();
                          valueOutput = inspect(valueKey);
                        }
                      } else if (conflicting || missingArrayIndex) {
                        const keyDiff =
                          conflicting && conflicting.getDiff({ output });
                        isInlineDiff = !keyDiff || keyDiff.inline;
                        if (missingArrayIndex) {
                          output.error('// missing').sp();
                        }
                        if (keyDiff && keyDiff.inline) {
                          valueOutput = keyDiff;
                        } else if (
                          expect.findTypeOf(valueKey).is('expect.it')
                        ) {
                          isInlineDiff = false;
                          annotation.appendErrorMessage(conflicting);
                        } else if (!keyDiff || (keyDiff && !keyDiff.inline)) {
                          annotation
                            .error(
                              (conflicting && conflicting.getLabel()) ||
                                'should satisfy'
                            )
                            .sp()
                            .block(inspect(valueKey));

                          if (keyDiff) {
                            annotation.nl(2).append(keyDiff);
                          }
                        } else {
                          valueOutput = keyDiff;
                        }
                      }

                      if (!valueOutput) {
                        if (
                          missingArrayIndex ||
                          !subjectType.hasKey(subject, key)
                        ) {
                          valueOutput = output.clone();
                        } else {
                          valueOutput = inspect(subjectKey);
                        }
                      }

                      const omitDelimiter =
                        missingArrayIndex || index >= subjectKeys.length - 1;

                      if (!omitDelimiter) {
                        const delimiterOutput = subjectType.delimiter(
                          output.clone(),
                          index,
                          keys.length
                        );
                        valueOutput.amend(delimiterOutput);
                      }

                      const annotationOnNextLine =
                        !isInlineDiff &&
                        output.preferredWidth <
                          this.size().width +
                            valueOutput.size().width +
                            annotation.size().width;

                      if (!annotation.isEmpty()) {
                        if (!valueOutput.isEmpty()) {
                          if (annotationOnNextLine) {
                            valueOutput.nl();
                          } else {
                            valueOutput.sp();
                          }
                        }

                        valueOutput.annotationBlock(function() {
                          this.append(annotation);
                        });
                      }

                      if (!isInlineDiff) {
                        valueOutput = output.clone().block(valueOutput);
                      }

                      const propertyOutput = subjectType.property(
                        output.clone(),
                        key,
                        valueOutput,
                        subjectIsArrayLike
                      );

                      this.append(propertyOutput);
                    });
                });

                if (subjectType.indent) {
                  output.outdentLines();
                }
                const suffixOutput = subjectType.suffix(
                  output.clone(),
                  subject
                );
                return output
                  .nl(suffixOutput.isEmpty() ? 0 : 1)
                  .append(suffixOutput);
              }
            });
          })
        );
    }
  );

  function wrapDiffWithTypePrefixAndSuffix(e, type, subject) {
    const createDiff = e.getDiffMethod();
    if (createDiff) {
      return function(output, ...rest) {
        type.prefix(output, subject);
        const result = createDiff.call(this, output, ...rest);
        type.suffix(output, subject);
        return result;
      };
    }
  }

  expect.addAssertion(
    '<wrapperObject> to [exhaustively] satisfy <wrapperObject>',
    (expect, subject, value) => {
      const type = expect.findCommonType(subject, value);
      expect(type.is('wrapperObject'), 'to be truthy');
      return expect.withError(
        () =>
          expect(
            type.unwrap(subject),
            'to [exhaustively] satisfy',
            type.unwrap(value)
          ),
        e => {
          expect.fail({
            label: e.getLabel(),
            diff: wrapDiffWithTypePrefixAndSuffix(e, type, subject)
          });
        }
      );
    }
  );

  expect.addAssertion(
    '<wrapperObject> to [exhaustively] satisfy <any>',
    (expect, subject, value) => {
      const subjectType = expect.subjectType;

      return expect.withError(
        () =>
          expect(
            subjectType.unwrap(subject),
            'to [exhaustively] satisfy',
            value
          ),
        e => {
          expect.fail({
            label: e.getLabel(),
            diff: wrapDiffWithTypePrefixAndSuffix(e, subjectType, subject)
          });
        }
      );
    }
  );

  expect.addAssertion(
    '<function> [when] called with <array-like> <assertion?>',
    (expect, subject, args) => {
      // ...
      expect.errorMode = 'nested';
      expect.argsOutput[0] = output => {
        output.appendItems(args, ', ');
      };

      const thisObject = expect.context.thisObject || null;

      return expect.shift(subject.apply(thisObject, args));
    }
  );

  expect.addAssertion(
    '<function> [when] called <assertion?>',
    (expect, subject) => {
      expect.errorMode = 'nested';

      const thisObject = expect.context.thisObject || null;

      return expect.shift(subject.call(thisObject));
    }
  );

  function instantiate(Constructor, args) {
    function ProxyConstructor() {
      return Constructor.apply(this, args);
    }
    ProxyConstructor.prototype = Constructor.prototype;
    return new ProxyConstructor();
  }

  expect.addAssertion(
    [
      '<array-like> [when] passed as parameters to [async] <function> <assertion?>',
      '<array-like> [when] passed as parameters to [constructor] <function> <assertion?>'
    ],
    (expect, subject, fn) => {
      // ...
      expect.errorMode = 'nested';
      let args = subject;
      if (expect.flags.async) {
        return expect.promise(run => {
          args = [
            ...args,
            run((err, result) => {
              expect(err, 'to be falsy');
              return expect.shift(result);
            })
          ];
          fn(...args);
        });
      } else {
        return expect.shift(
          expect.flags.constructor ? instantiate(fn, args) : fn(...args)
        );
      }
    }
  );

  expect.addAssertion(
    [
      '<any> [when] passed as parameter to [async] <function> <assertion?>',
      '<any> [when] passed as parameter to [constructor] <function> <assertion?>'
    ],
    (expect, subject, fn) => {
      // ...
      expect.errorMode = 'nested';
      let args = [subject];
      if (expect.flags.async) {
        return expect.promise(run => {
          args = [
            ...args,
            run((err, result) => {
              expect(err, 'to be falsy');
              return expect.shift(result);
            })
          ];
          fn(...args);
        });
      } else {
        return expect.shift(
          expect.flags.constructor ? instantiate(fn, args) : fn(...args)
        );
      }
    }
  );

  expect.addAssertion(
    [
      '<array-like> [when] sorted [numerically] <assertion?>',
      '<array-like> [when] sorted by <function> <assertion?>'
    ],
    (expect, subject, compareFunction) => {
      if (expect.flags.numerically) {
        compareFunction = (a, b) => a - b;
      }
      return expect.shift(
        Array.prototype.slice
          .call(subject)
          .sort(
            typeof compareFunction === 'function' ? compareFunction : undefined
          )
      );
    }
  );

  expect.addAssertion('<Promise> to be rejected', (expect, subject) => {
    expect.errorMode = 'nested';
    return expect
      .promise(() => subject)
      .then(
        obj => {
          expect.fail(output => {
            output
              .appendInspected(subject)
              .sp()
              .text('unexpectedly fulfilled');
            if (typeof obj !== 'undefined') {
              output
                .sp()
                .text('with')
                .sp()
                .appendInspected(obj);
            }
          });
        },
        err => err
      );
  });

  expect.addAssertion('<function> to be rejected', (expect, subject) => {
    expect.errorMode = 'nested';
    return expect(
      expect.promise(() => subject()),
      'to be rejected'
    );
  });

  expect.addAssertion(
    [
      '<Promise> to be rejected with <any>',
      '<Promise> to be rejected with error [exhaustively] satisfying <any>'
    ],
    (expect, subject, value) => {
      expect.errorMode = 'nested';
      return expect(subject, 'to be rejected').tap(err =>
        expect.withError(
          () => expect(err, 'to [exhaustively] satisfy', value),
          e => {
            e.originalError = err;
            throw e;
          }
        )
      );
    }
  );

  expect.addAssertion(
    [
      '<function> to be rejected with <any>',
      '<function> to be rejected with error [exhaustively] satisfying <any>'
    ],
    (expect, subject, value) => {
      expect.errorMode = 'nested';
      return expect(
        expect.promise(() => subject()),
        'to be rejected with error [exhaustively] satisfying',
        value
      );
    }
  );

  expect.addAssertion('<Promise> to be fulfilled', (expect, subject) => {
    expect.errorMode = 'nested';
    return expect
      .promise(() => subject)
      .caught(err => {
        expect.fail({
          output(output) {
            output
              .appendInspected(subject)
              .sp()
              .text('unexpectedly rejected');
            if (typeof err !== 'undefined') {
              output
                .sp()
                .text('with')
                .sp()
                .appendInspected(err);
            }
          },
          originalError: err
        });
      });
  });

  expect.addAssertion('<function> to be fulfilled', (expect, subject) => {
    expect.errorMode = 'nested';
    return expect(
      expect.promise(() => subject()),
      'to be fulfilled'
    );
  });

  expect.addAssertion(
    [
      '<Promise> to be fulfilled with <any>',
      '<Promise> to be fulfilled with value [exhaustively] satisfying <any>'
    ],
    (expect, subject, value) => {
      expect.errorMode = 'nested';
      return expect(subject, 'to be fulfilled').tap(fulfillmentValue =>
        expect(fulfillmentValue, 'to [exhaustively] satisfy', value)
      );
    }
  );

  expect.addAssertion(
    [
      '<function> to be fulfilled with <any>',
      '<function> to be fulfilled with value [exhaustively] satisfying <any>'
    ],
    (expect, subject, value) => {
      expect.errorMode = 'nested';
      return expect(
        expect.promise(() => subject()),
        'to be fulfilled with value [exhaustively] satisfying',
        value
      );
    }
  );

  expect.addAssertion(
    '<Promise> when rejected <assertion>',
    (expect, subject, nextAssertion) => {
      expect.errorMode = 'nested';
      return expect
        .promise(() => subject)
        .then(
          fulfillmentValue => {
            if (typeof nextAssertion === 'string') {
              expect.argsOutput = output => {
                output.error(nextAssertion);
                const rest = expect.args.slice(1);
                if (rest.length > 0) {
                  output.sp().appendItems(rest, ', ');
                }
              };
            }
            expect.fail(output => {
              output
                .appendInspected(subject)
                .sp()
                .text('unexpectedly fulfilled');
              if (typeof fulfillmentValue !== 'undefined') {
                output
                  .sp()
                  .text('with')
                  .sp()
                  .appendInspected(fulfillmentValue);
              }
            });
          },
          err => {
            if (
              err.isOperational &&
              !Object.prototype.propertyIsEnumerable.call(err, 'isOperational')
            ) {
              delete err.isOperational;
            }

            expect.withError(
              () => expect.shift(err),
              e => {
                e.originalError = err;
                throw e;
              }
            );
          }
        );
    }
  );

  expect.addAssertion(
    '<function> when rejected <assertion>',
    (expect, subject, ...rest) => {
      expect.errorMode = 'nested';
      return expect(
        expect.promise(() => subject()),
        'when rejected',
        ...rest
      );
    }
  );

  expect.addAssertion(
    '<Promise> when fulfilled <assertion>',
    (expect, subject, nextAssertion) => {
      expect.errorMode = 'nested';
      return expect
        .promise(() => subject)
        .then(
          fulfillmentValue => expect.shift(fulfillmentValue),
          err => {
            // typeof nextAssertion === 'string' because expect.it is handled by the above (and shift only supports those two):
            expect.argsOutput = output => {
              output.error(nextAssertion);
              const rest = expect.args.slice(1);
              if (rest.length > 0) {
                output.sp().appendItems(rest, ', ');
              }
            };
            expect.fail({
              output(output) {
                output
                  .appendInspected(subject)
                  .sp()
                  .text('unexpectedly rejected');
                if (typeof err !== 'undefined') {
                  output
                    .sp()
                    .text('with')
                    .sp()
                    .appendInspected(err);
                }
              },
              originalError: err
            });
          }
        );
    }
  );

  expect.addAssertion(
    '<function> when fulfilled <assertion>',
    (expect, subject, ...rest) => {
      expect.errorMode = 'nested';
      return expect(
        expect.promise(() => subject()),
        'when fulfilled',
        ...rest
      );
    }
  );

  expect.addAssertion('<function> to call the callback', (expect, subject) => {
    expect.errorMode = 'nested';
    return expect.promise(run => {
      let async = false;
      let calledTwice = false;
      let callbackArgs;
      function cb(...args) {
        if (callbackArgs) {
          calledTwice = true;
        } else {
          callbackArgs = Array.prototype.slice.call(args);
        }
        if (async) {
          setTimeout(assert, 0);
        }
      }

      var assert = run(() => {
        if (calledTwice) {
          expect.fail(function() {
            this.error('The callback was called twice');
          });
        }
        return callbackArgs;
      });

      subject(cb);
      async = true;
      if (callbackArgs) {
        return assert();
      }
    });
  });

  expect.addAssertion(
    '<function> to call the callback without error',
    (expect, subject) =>
      expect(subject, 'to call the callback').then(callbackArgs => {
        const err = callbackArgs[0];
        if (err) {
          expect.errorMode = 'nested';
          expect.fail({
            message(output) {
              output.error('called the callback with: ');
              if (err.getErrorMessage) {
                output.appendErrorMessage(err);
              } else {
                output.appendInspected(err);
              }
            }
          });
        } else {
          return callbackArgs.slice(1);
        }
      })
  );

  expect.addAssertion(
    '<function> to call the callback with error',
    (expect, subject) =>
      expect(subject, 'to call the callback').spread(err => {
        expect(err, 'to be truthy');
        return err;
      })
  );

  expect.addAssertion(
    '<function> to call the callback with error <any>',
    (expect, subject, value) =>
      expect(subject, 'to call the callback with error').tap(err => {
        expect.errorMode = 'nested';
        expect(err, 'to satisfy', value);
      })
  );
};
