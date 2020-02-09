const createStandardErrorMessage = require('./createStandardErrorMessage');
const utils = require('./utils');
const magicpen = require('magicpen');
const extend = utils.extend;
const ukkonen = require('ukkonen');
const makePromise = require('./makePromise');
const addAdditionalPromiseMethods = require('./addAdditionalPromiseMethods');
const wrapPromiseIfNecessary = require('./wrapPromiseIfNecessary');
const oathbreaker = require('./oathbreaker');
const UnexpectedError = require('./UnexpectedError');
const notifyPendingPromise = require('./notifyPendingPromise');
const defaultDepth = require('./defaultDepth');
const AssertionString = require('./AssertionString');
const Context = require('./Context');
const throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');
const ensureValidUseOfParenthesesOrBrackets = require('./ensureValidUseOfParenthesesOrBrackets');
const expandAssertion = require('./expandAssertion');
const nodeJsCustomInspect = require('./nodeJsCustomInspect');

function isAssertionArg({ type }) {
  return type.is('assertion');
}

const anyType = {
  _unexpectedType: true,
  name: 'any',
  level: 0,
  identify() {
    return true;
  },
  equal: utils.objectIs,
  inspect(value, depth, output) {
    if (output && output.isMagicPen) {
      return output.text(value);
    } else {
      // Guard against node.js' require('util').inspect eagerly calling .inspect() on objects
      return `type: ${this.name}`;
    }
  },
  diff(actual, expected, output, diff, inspect) {
    return null;
  },
  typeEqualityCache: {},
  is(typeOrTypeName) {
    let typeName;
    if (typeof typeOrTypeName === 'string') {
      typeName = typeOrTypeName;
    } else {
      typeName = typeOrTypeName.name;
    }

    const cachedValue = this.typeEqualityCache[typeName];
    if (typeof cachedValue !== 'undefined') {
      return cachedValue;
    }

    let result = false;
    if (this.name === typeName) {
      result = true;
    } else if (this.baseType) {
      result = this.baseType.is(typeName);
    }
    this.typeEqualityCache[typeName] = result;
    return result;
  }
};

if (nodeJsCustomInspect !== 'inspect') {
  anyType[nodeJsCustomInspect] = function() {
    return `type: ${this.name}`;
  };
}

const OR = {};
function getOrGroups(expectations) {
  const orGroups = [[]];
  expectations.forEach(expectation => {
    if (expectation === OR) {
      orGroups.push([]);
    } else {
      orGroups[orGroups.length - 1].push(expectation);
    }
  });
  return orGroups;
}

function evaluateGroup(expect, context, subject, orGroup, forwardedFlags) {
  return orGroup.map(expectation => {
    const args = Array.prototype.slice.call(expectation);
    args.unshift(subject);
    return {
      expectation: args,
      promise: makePromise(() => {
        if (typeof args[1] === 'function') {
          if (args.length > 2) {
            throw new Error(
              'expect.it(<function>) does not accept additional arguments'
            );
          } else {
            // expect.it(function (value) { ... })
            return args[1](args[0]);
          }
        } else {
          return expect._expect(context.child(), args, forwardedFlags);
        }
      })
    };
  });
}

function writeGroupEvaluationsToOutput(output, groupEvaluations) {
  const hasOrClauses = groupEvaluations.length > 1;
  const hasAndClauses = groupEvaluations.some(({ length }) => length > 1);
  groupEvaluations.forEach((groupEvaluation, i) => {
    if (i > 0) {
      if (hasAndClauses) {
        output.nl();
      } else {
        output.sp();
      }
      output.jsComment('or').nl();
    }

    let groupFailed = false;
    groupEvaluation.forEach((evaluation, j) => {
      if (j > 0) {
        output.jsComment(' and').nl();
      }
      const isRejected = evaluation.promise.isRejected();
      if (isRejected && !groupFailed) {
        groupFailed = true;
        const err = evaluation.promise.reason();

        if (hasAndClauses || hasOrClauses) {
          output.error('⨯ ');
        }

        output.block(output => {
          output.append(err.getErrorMessage(output));
        });
      } else {
        if (isRejected) {
          output.error('⨯ ');
        } else {
          output.success('✓ ');
        }

        const expectation = evaluation.expectation;
        output.block(output => {
          const subject = expectation[0];
          const subjectOutput = output => {
            output.appendInspected(subject);
          };
          const args = expectation.slice(2);
          const argsOutput = args.map(arg => output => {
            output.appendInspected(arg);
          });
          const testDescription = expectation[1];
          createStandardErrorMessage(
            output,
            subjectOutput,
            testDescription,
            argsOutput,
            {
              subject
            }
          );
        });
      }
    });
  });
}

function createExpectIt(expect, expectations, forwardedFlags) {
  const orGroups = getOrGroups(expectations);

  function expectIt(subject, context) {
    context =
      context && typeof context === 'object' && context instanceof Context
        ? context
        : new Context();

    if (
      orGroups.length === 1 &&
      orGroups[0].length === 1 &&
      orGroups[0][0].length === 1 &&
      typeof orGroups[0][0][0] === 'function'
    ) {
      // expect.it(subject => ...)
      return oathbreaker(orGroups[0][0][0](subject));
    }

    const groupEvaluations = [];
    const promises = [];
    orGroups.forEach(orGroup => {
      const evaluations = evaluateGroup(
        expect,
        context,
        subject,
        orGroup,
        forwardedFlags
      );
      evaluations.forEach(({ promise }) => {
        promises.push(promise);
      });
      groupEvaluations.push(evaluations);
    });

    return oathbreaker(
      makePromise.settle(promises).then(() => {
        groupEvaluations.forEach(groupEvaluation => {
          groupEvaluation.forEach(({ promise }) => {
            if (
              promise.isRejected() &&
              promise.reason().errorMode === 'bubbleThrough'
            ) {
              throw promise.reason();
            }
          });
        });

        if (
          !groupEvaluations.some(groupEvaluation =>
            groupEvaluation.every(({ promise }) => promise.isFulfilled())
          )
        ) {
          expect.fail(output => {
            writeGroupEvaluationsToOutput(output, groupEvaluations);
          });
        }
      })
    );
  }
  expectIt._expectIt = true;
  expectIt._expectations = expectations;
  expectIt._OR = OR;
  expectIt.and = function(...args) {
    const copiedExpectations = expectations.slice();
    copiedExpectations.push(args);
    return createExpectIt(expect, copiedExpectations, forwardedFlags);
  };
  expectIt.or = function(...args) {
    const copiedExpectations = expectations.slice();
    copiedExpectations.push(OR, args);
    return createExpectIt(expect, copiedExpectations, forwardedFlags);
  };
  return expectIt;
}

const expectPrototype = {
  promise: makePromise,
  notifyPendingPromise,
  errorMode: 'default'
};
utils.setPrototypeOfOrExtend(expectPrototype, Function.prototype);

expectPrototype.it = function(...args) {
  return createExpectIt(this._topLevelExpect, [args], this.flags);
};

expectPrototype.equal = function(actual, expected, depth, seen) {
  depth = typeof depth === 'number' ? depth : 100;
  if (depth <= 0) {
    // detect recursive loops in the structure
    seen = seen || [];
    if (seen.indexOf(actual) !== -1) {
      throw new Error('Cannot compare circular structures');
    }
    seen.push(actual);
  }

  return this.findCommonType(actual, expected).equal(actual, expected, (a, b) =>
    this.equal(a, b, depth - 1, seen)
  );
};

expectPrototype.inspect = function(obj, depth, outputOrFormat) {
  let seen = [];
  const printOutput = (obj, currentDepth, output) => {
    const objType = this.findTypeOf(obj);
    if (currentDepth <= 0 && objType.is('object') && !objType.is('expect.it')) {
      return output.text('...');
    }

    seen = seen || [];
    if (seen.indexOf(obj) !== -1) {
      return output.text('[Circular]');
    }

    return objType.inspect(obj, currentDepth, output, (v, childDepth) => {
      output = output.clone();
      seen.push(obj);
      if (typeof childDepth === 'undefined') {
        childDepth = currentDepth - 1;
      }
      output = printOutput(v, childDepth, output) || output;
      seen.pop();
      return output;
    });
  };

  let output =
    typeof outputOrFormat === 'string'
      ? this.createOutput(outputOrFormat)
      : outputOrFormat;
  output = output || this.createOutput();
  return (
    printOutput(
      obj,
      typeof depth === 'number' ? depth : defaultDepth,
      output
    ) || output
  );
};

if (nodeJsCustomInspect !== 'inspect') {
  expectPrototype[nodeJsCustomInspect] = expectPrototype.inspect;
}

expectPrototype.expandTypeAlternations = function(assertion) {
  const createPermutations = (args, i) => {
    if (i === args.length) {
      return [];
    }

    const result = [];
    args[i].forEach(arg => {
      const tails = createPermutations(args, i + 1);
      if (tails.length) {
        tails.forEach(tail => {
          result.push([arg].concat(tail));
        });
      } else if (arg.type.is('assertion')) {
        result.push([
          { type: arg.type, minimum: 1, maximum: 1 },
          { type: this.getType('any'), minimum: 0, maximum: Infinity }
        ]);
        result.push([
          { type: this.getType('expect.it'), minimum: 1, maximum: 1 }
        ]);
        if (arg.minimum === 0) {
          // <assertion?>
          result.push([]);
        }
      } else {
        result.push([arg]);
      }
    });
    return result;
  };
  const result = [];
  assertion.subject.forEach(subjectRequirement => {
    if (assertion.args.length) {
      createPermutations(assertion.args, 0).forEach(args => {
        result.push(
          extend({}, assertion, {
            subject: subjectRequirement,
            args
          })
        );
      });
    } else {
      result.push(
        extend({}, assertion, {
          subject: subjectRequirement,
          args: []
        })
      );
    }
  });
  return result;
};

expectPrototype.parseAssertion = function(assertionString) {
  const tokens = [];
  let nextIndex = 0;

  const parseTypeToken = typeToken => {
    return typeToken.split('|').map(typeDeclaration => {
      const matchNameAndOperator = typeDeclaration.match(
        /^([a-z_](?:|[a-z0-9_.-]*[_a-z0-9]))([+*?]|)$/i
      );
      if (!matchNameAndOperator) {
        throw new SyntaxError(
          `Cannot parse type declaration:${typeDeclaration}`
        );
      }
      const type = this.getType(matchNameAndOperator[1]);
      if (!type) {
        throw new Error(
          `Unknown type: ${matchNameAndOperator[1]} in ${assertionString}`
        );
      }
      const operator = matchNameAndOperator[2];
      return {
        minimum: !operator || operator === '+' ? 1 : 0,
        maximum: operator === '*' || operator === '+' ? Infinity : 1,
        type
      };
    });
  };

  function hasVarargs(types) {
    return types.some(({ minimum, maximum }) => minimum !== 1 || maximum !== 1);
  }
  assertionString.replace(
    /\s*<((?:[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])[?*+]?)(?:\|(?:[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])[?*+]?))*)>|\s*([^<]+)/gi,
    ({ length }, $1, $2, index) => {
      if (index !== nextIndex) {
        throw new SyntaxError(
          `Cannot parse token at index ${nextIndex} in ${assertionString}`
        );
      }
      if ($1) {
        tokens.push(parseTypeToken($1));
      } else {
        tokens.push($2.trim());
      }
      nextIndex += length;
    }
  );

  let assertion;
  if (tokens.length === 1 && typeof tokens[0] === 'string') {
    if (!this._legacyTypelessAssertionWarned) {
      console.warn(
        'The typeless expect.addAssertion syntax is deprecated and will be removed in a future update\n' +
          'Please refer to http://unexpected.js.org/api/addAssertion/'
      );
      this._legacyTypelessAssertionWarned = true;
    }
    assertion = {
      subject: parseTypeToken('any'),
      assertion: tokens[0],
      args: [parseTypeToken('any*')]
    };
  } else {
    assertion = {
      subject: tokens[0],
      assertion: tokens[1],
      args: tokens.slice(2)
    };
  }

  if (!Array.isArray(assertion.subject)) {
    throw new SyntaxError(`Missing subject type in ${assertionString}`);
  }
  if (typeof assertion.assertion !== 'string') {
    throw new SyntaxError(`Missing assertion in ${assertionString}`);
  }
  if (hasVarargs(assertion.subject)) {
    throw new SyntaxError(
      `The subject type cannot have varargs: ${assertionString}`
    );
  }
  if (assertion.args.some(arg => typeof arg === 'string')) {
    throw new SyntaxError('Only one assertion string is supported (see #225)');
  }

  if (assertion.args.slice(0, -1).some(hasVarargs)) {
    throw new SyntaxError(
      `Only the last argument type can have varargs: ${assertionString}`
    );
  }
  if (
    [assertion.subject]
      .concat(assertion.args.slice(0, -1))
      .some(argRequirements =>
        argRequirements.some(({ type }) => type.is('assertion'))
      )
  ) {
    throw new SyntaxError(
      `Only the last argument type can be <assertion>: ${assertionString}`
    );
  }

  const lastArgRequirements = assertion.args[assertion.args.length - 1] || [];
  const assertionRequirements = lastArgRequirements.filter(({ type }) =>
    type.is('assertion')
  );

  if (assertionRequirements.length > 0 && lastArgRequirements.length > 1) {
    throw new SyntaxError(
      `<assertion> cannot be alternated with other types: ${assertionString}`
    );
  }

  if (assertionRequirements.some(({ maximum }) => maximum !== 1)) {
    throw new SyntaxError(
      `<assertion+> and <assertion*> are not allowed: ${assertionString}`
    );
  }
  return this.expandTypeAlternations(assertion);
};

const placeholderSplitRegexp = /(\{(?:\d+)\})/g;
const placeholderRegexp = /\{(\d+)\}/;
expectPrototype._fail = function(arg) {
  if (arg instanceof UnexpectedError) {
    arg._hasSerializedErrorMessage = false;
    throw arg;
  }

  if (utils.isError(arg)) {
    throw arg;
  }

  const error = new UnexpectedError(this);
  if (typeof arg === 'function') {
    error.errorMode = 'bubble';
    error.output = arg;
  } else if (arg && typeof arg === 'object') {
    if (typeof arg.message !== 'undefined') {
      error.errorMode = 'bubble';
    }
    error.output = output => {
      if (typeof arg.message !== 'undefined') {
        if (arg.message.isMagicPen) {
          output.append(arg.message);
        } else if (typeof arg.message === 'function') {
          arg.message.call(output, output);
        } else {
          output.text(String(arg.message));
        }
      } else {
        output.error('Explicit failure');
      }
    };
    Object.keys(arg).forEach(function(key) {
      const value = arg[key];
      if (key === 'diff') {
        if (typeof value === 'function' && this.parent) {
          error.createDiff = (output, diff, inspect, equal) => {
            const childOutput = this.createOutput(output.format);
            childOutput.inline = output.inline;
            childOutput.output = output.output;
            return value(
              childOutput,
              (actual, expected) => {
                return this.diff(actual, expected, childOutput.clone());
              },
              (v, depth) =>
                childOutput
                  .clone()
                  .appendInspected(v, (depth || defaultDepth) - 1),
              (actual, expected) => this.equal(actual, expected)
            );
          };
        } else {
          error.createDiff = value;
        }
      } else if (key !== 'message') {
        error[key] = value;
      }
    }, this);
  } else {
    let placeholderArgs;
    if (arguments.length > 0) {
      placeholderArgs = new Array(arguments.length - 1);
      for (let i = 1; i < arguments.length; i += 1) {
        placeholderArgs[i - 1] = arguments[i];
      }
    }
    error.errorMode = 'bubble';
    error.output = output => {
      const message = arg ? String(arg) : 'Explicit failure';
      const tokens = message.split(placeholderSplitRegexp);
      tokens.forEach(token => {
        const match = placeholderRegexp.exec(token);
        if (match) {
          const index = match[1];
          if (index in placeholderArgs) {
            const placeholderArg = placeholderArgs[index];
            if (placeholderArg && placeholderArg.isMagicPen) {
              output.append(placeholderArg);
            } else {
              output.appendInspected(placeholderArg);
            }
          } else {
            output.text(match[0]);
          }
        } else {
          output.error(token);
        }
      });
    };
  }

  throw error;
};

function compareSpecificities(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    const c = b[i] - a[i];
    if (c !== 0) {
      return c;
    }
  }
  return b.length - a.length;
}

function calculateAssertionSpecificity({ subject, args }) {
  return [subject.type.level].concat(
    args.map(({ minimum, maximum, type }) => {
      const bonus = minimum === 1 && maximum === 1 ? 0.5 : 0;
      return bonus + type.level;
    })
  );
}

function calculateLimits(items) {
  let minimum = 0;
  let maximum = 0;
  items.forEach(item => {
    minimum += item.minimum;
    maximum += item.maximum;
  });
  return {
    minimum,
    maximum
  };
}

expectPrototype.addAssertion = function(
  patternOrPatterns,
  handler,
  childExpect
) {
  if (this._frozen) {
    throw new Error(
      'Cannot add an assertion to a frozen instance, please run .clone() first'
    );
  }
  let maxArguments;
  if (typeof childExpect === 'function') {
    maxArguments = 3;
  } else {
    maxArguments = 2;
  }
  if (
    arguments.length > maxArguments ||
    typeof handler !== 'function' ||
    (typeof patternOrPatterns !== 'string' && !Array.isArray(patternOrPatterns))
  ) {
    let errorMessage =
      'Syntax: expect.addAssertion(<string|array[string]>, function (expect, subject, ...) { ... });';
    if (
      (typeof handler === 'string' || Array.isArray(handler)) &&
      typeof arguments[2] === 'function'
    ) {
      errorMessage +=
        '\nAs of Unexpected 10, the syntax for adding assertions that apply only to specific\n' +
        'types has changed. See http://unexpected.js.org/api/addAssertion/';
    }
    throw new Error(errorMessage);
  }
  const patterns = Array.isArray(patternOrPatterns)
    ? patternOrPatterns
    : [patternOrPatterns];
  patterns.forEach(pattern => {
    if (typeof pattern !== 'string' || pattern === '') {
      throw new Error('Assertion patterns must be a non-empty string');
    } else {
      if (pattern !== pattern.trim()) {
        throw new Error(
          `Assertion patterns can't start or end with whitespace:\n\n    ${JSON.stringify(
            pattern
          )}`
        );
      }
    }
  });

  const assertions = this.assertions;

  const defaultValueByFlag = {};
  const assertionHandlers = [];
  let maxNumberOfArgs = 0;
  patterns.forEach(pattern => {
    const assertionDeclarations = this.parseAssertion(pattern);
    assertionDeclarations.forEach(({ assertion, args, subject }) => {
      ensureValidUseOfParenthesesOrBrackets(assertion);
      const expandedAssertions = expandAssertion(assertion);
      expandedAssertions.forEach(({ flags, alternations, text }) => {
        Object.keys(flags).forEach(flag => {
          defaultValueByFlag[flag] = false;
        });
        maxNumberOfArgs = Math.max(
          maxNumberOfArgs,
          args.reduce(
            (previous, { maximum }) =>
              previous + (maximum === null ? Infinity : maximum),
            0
          )
        );
        const limits = calculateLimits(args);
        assertionHandlers.push({
          handler,
          alternations,
          flags,
          subject,
          args,
          testDescriptionString: text,
          declaration: pattern,
          expect: childExpect,
          minimum: limits.minimum,
          maximum: limits.maximum
        });
      });
    });
  });
  if (handler.length - 2 > maxNumberOfArgs) {
    throw new Error(
      `The provided assertion handler takes ${handler.length -
        2} parameters, but the type signature specifies a maximum of ${maxNumberOfArgs}:\n\n    ${JSON.stringify(
        patterns
      )}`
    );
  }

  assertionHandlers.forEach(handler => {
    // Make sure that all flags are defined.
    handler.flags = extend({}, defaultValueByFlag, handler.flags);

    const assertionHandlers = assertions[handler.testDescriptionString];
    handler.specificity = calculateAssertionSpecificity(handler);
    if (!assertionHandlers) {
      assertions[handler.testDescriptionString] = [handler];
    } else {
      let i = 0;
      while (
        i < assertionHandlers.length &&
        compareSpecificities(
          handler.specificity,
          assertionHandlers[i].specificity
        ) > 0
      ) {
        i += 1;
      }
      assertionHandlers.splice(i, 0, handler);
    }
  });

  return this; // for chaining
};

expectPrototype.addType = function(type, childExpect) {
  if (this._frozen) {
    throw new Error(
      'Cannot add a type to a frozen instance, please run .clone() first'
    );
  }

  let baseType;
  if (
    typeof type.name !== 'string' ||
    !/^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$/i.test(type.name)
  ) {
    throw new Error(
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  }

  if (typeof type.identify !== 'function' && type.identify !== false) {
    throw new Error(
      `Type ${type.name} must specify an identify function or be declared abstract by setting identify to false`
    );
  }

  if (this.typeByName[type.name]) {
    throw new Error(`The type with the name ${type.name} already exists`);
  }

  if (type.base) {
    baseType = this.getType(type.base);

    if (!baseType) {
      throw new Error(`Unknown base type: ${type.base}`);
    }
  } else {
    baseType = anyType;
  }

  const extendedBaseType = Object.create(baseType);
  extendedBaseType.inspect = (value, depth, output) => {
    if (!output || !output.isMagicPen) {
      throw new Error(
        'You need to pass the output to baseType.inspect() as the third parameter'
      );
    }

    return baseType.inspect(value, depth, output, (value, depth) =>
      output.clone().appendInspected(value, depth)
    );
  };

  if (nodeJsCustomInspect !== 'inspect') {
    extendedBaseType[nodeJsCustomInspect] = extendedBaseType.inspect;
  }

  extendedBaseType.diff = (actual, expected, output) => {
    if (!output || !output.isMagicPen) {
      throw new Error(
        'You need to pass the output to baseType.diff() as the third parameter'
      );
    }

    return baseType.diff(
      actual,
      expected,
      output.clone(),
      (actual, expected) => this.diff(actual, expected, output.clone()),
      (value, depth) => output.clone().appendInspected(value, depth),
      this.equal.bind(this)
    );
  };

  extendedBaseType.equal = (actual, expected) =>
    baseType.equal(actual, expected, this.equal.bind(this));

  const extendedType = extend({}, baseType, type, {
    baseType: extendedBaseType
  });
  const originalInspect = extendedType.inspect;

  // Prevent node.js' util.inspect from complaining about our inspect method:
  if (nodeJsCustomInspect !== 'inspect') {
    extendedType[nodeJsCustomInspect] = function() {
      return `type: ${type.name}`;
    };
  }

  extendedType.inspect = function(obj, depth, output, inspect) {
    if (arguments.length < 2 || !output || !output.isMagicPen) {
      return `type: ${type.name}`;
    } else if (childExpect) {
      const childOutput = childExpect.createOutput(output.format);
      return (
        originalInspect.call(this, obj, depth, childOutput, inspect) ||
        childOutput
      );
    } else {
      return originalInspect.call(this, obj, depth, output, inspect) || output;
    }
  };

  if (childExpect) {
    extendedType.childExpect = childExpect;
    const originalDiff = extendedType.diff;
    extendedType.diff = function(
      actual,
      expected,
      output,
      inspect,
      diff,
      equal
    ) {
      const childOutput = childExpect.createOutput(output.format);
      // Make sure that already buffered up output is preserved:
      childOutput.output = output.output;
      return (
        originalDiff.call(
          this,
          actual,
          expected,
          childOutput,
          inspect,
          diff,
          equal
        ) || output
      );
    };
  }

  if (extendedType.identify === false) {
    this.types.push(extendedType);
  } else {
    this.types.unshift(extendedType);
  }

  extendedType.level = baseType.level + 1;
  extendedType.typeEqualityCache = {};
  this.typeByName[extendedType.name] = extendedType;

  return this;
};

expectPrototype.getType = function(typeName) {
  return (
    this.typeByName[typeName] || (this.parent && this.parent.getType(typeName))
  );
};

expectPrototype.findTypeOf = function(obj) {
  return (
    utils.findFirst(
      this.types || [],
      type => type.identify && type.identify(obj)
    ) ||
    (this.parent && this.parent.findTypeOf(obj))
  );
};

expectPrototype.findTypeOfWithParentType = function(obj, requiredParentType) {
  return (
    utils.findFirst(
      this.types || [],
      type =>
        type.identify &&
        type.identify(obj) &&
        (!requiredParentType || type.is(requiredParentType))
    ) ||
    (this.parent &&
      this.parent.findTypeOfWithParentType(obj, requiredParentType))
  );
};

expectPrototype.findCommonType = function(a, b) {
  const aAncestorIndex = {};
  let current = this.findTypeOf(a);
  while (current) {
    aAncestorIndex[current.name] = current;
    current = current.baseType;
  }
  current = this.findTypeOf(b);
  while (current) {
    if (aAncestorIndex[current.name]) {
      return current;
    }
    current = current.baseType;
  }
};

expectPrototype.addStyle = function(...args) {
  if (this._frozen) {
    throw new Error(
      'Cannot add a style to a frozen instance, please run .clone() first'
    );
  }
  this.output.addStyle(...args);
  return this;
};

expectPrototype.installTheme = function(...args) {
  if (this._frozen) {
    throw new Error(
      'Cannot install a theme into a frozen instance, please run .clone() first'
    );
  }
  this.output.installTheme(...args);
  return this;
};

function getPluginName(plugin) {
  if (typeof plugin === 'function') {
    return utils.getFunctionName(plugin);
  } else {
    return plugin.name;
  }
}

expectPrototype.use = function(plugin) {
  this._assertTopLevelExpect();
  if (this._frozen) {
    throw new Error(
      'Cannot install a plugin into a frozen instance, please run .clone() first'
    );
  }
  if (
    (typeof plugin !== 'function' &&
      (typeof plugin !== 'object' ||
        typeof plugin.installInto !== 'function')) ||
    (typeof plugin.name !== 'undefined' && typeof plugin.name !== 'string')
  ) {
    throw new Error(
      'Plugins must be functions or adhere to the following interface\n' +
        '{\n' +
        '  name: <an optional plugin name>,\n' +
        '  version: <an optional semver version string>,\n' +
        '  installInto: <a function that will update the given expect instance>\n' +
        '}'
    );
  }

  const pluginName = getPluginName(plugin);

  const existingPlugin = utils.findFirst(
    this.installedPlugins,
    installedPlugin => {
      if (installedPlugin === plugin) {
        return true;
      } else {
        return pluginName && pluginName === getPluginName(installedPlugin);
      }
    }
  );

  if (existingPlugin) {
    if (
      existingPlugin === plugin ||
      (typeof plugin.version !== 'undefined' &&
        plugin.version === existingPlugin.version)
    ) {
      // No-op
      return this;
    } else {
      throw new Error(
        `Another instance of the plugin '${pluginName}' is already installed${
          typeof existingPlugin.version !== 'undefined'
            ? ` (version ${existingPlugin.version}${
                typeof plugin.version !== 'undefined'
                  ? `, trying to install ${plugin.version}`
                  : ''
              })`
            : ''
        }. Please check your node_modules folder for unmet peerDependencies.`
      );
    }
  }

  if (pluginName === 'unexpected-promise') {
    throw new Error(
      'The unexpected-promise plugin was pulled into Unexpected as of 8.5.0. This means that the plugin is no longer supported.'
    );
  }

  this.installedPlugins.push(plugin);
  if (typeof plugin === 'function') {
    plugin(this);
  } else {
    plugin.installInto(this);
  }

  return this; // for chaining
};

expectPrototype.withError = (body, handler) =>
  oathbreaker(
    makePromise(body).caught(e => {
      throwIfNonUnexpectedError(e);
      return handler(e);
    })
  );

expectPrototype.installPlugin = expectPrototype.use; // Legacy alias

expectPrototype.throwAssertionNotFoundError = function(
  subject,
  testDescriptionString,
  args
) {
  let candidateHandlers = this.assertions[testDescriptionString];

  let instance = this;
  while (instance && !candidateHandlers) {
    candidateHandlers = instance.assertions[testDescriptionString];
    instance = instance.parent;
  }

  if (candidateHandlers) {
    this.fail({
      message: output => {
        const subjectOutput = output => {
          output.appendInspected(subject);
        };
        const argsOutput = output => {
          output.appendItems(args, ', ');
        };
        output
          .append(
            createStandardErrorMessage(
              output.clone(),
              subjectOutput,
              testDescriptionString,
              argsOutput
            )
          )
          .nl()
          .indentLines();
        output
          .i()
          .error('The assertion does not have a matching signature for:')
          .nl()
          .indentLines()
          .i()
          .text('<')
          .text(this.findTypeOf(subject).name)
          .text('>')
          .sp()
          .text(testDescriptionString);

        args.forEach((arg, i) => {
          output
            .sp()
            .text('<')
            .text(this.findTypeOf(arg).name)
            .text('>');
        });

        output
          .outdentLines()
          .nl()
          .i()
          .text('did you mean:')
          .indentLines()
          .nl();
        const assertionDeclarations = Object.keys(
          candidateHandlers.reduce((result, { declaration }) => {
            result[declaration] = true;
            return result;
          }, {})
        ).sort();
        assertionDeclarations.forEach((declaration, i) => {
          output
            .nl(i > 0 ? 1 : 0)
            .i()
            .text(declaration);
        });
        output.outdentLines();
      }
    });
  }

  const assertionsWithScore = [];
  const assertionStrings = [];
  instance = this;
  while (instance) {
    assertionStrings.push(...Object.keys(instance.assertions));
    instance = instance.parent;
  }

  const compareAssertions = (a, b) => {
    const aAssertion = this.lookupAssertionRule(subject, a, args);
    const bAssertion = this.lookupAssertionRule(subject, b, args);
    if (!aAssertion && !bAssertion) {
      return 0;
    }
    if (aAssertion && !bAssertion) {
      return -1;
    }
    if (!aAssertion && bAssertion) {
      return 1;
    }

    return compareSpecificities(aAssertion.specificity, bAssertion.specificity);
  };

  assertionStrings.forEach(assertionString => {
    const score = ukkonen(testDescriptionString, assertionString);

    assertionsWithScore.push({
      assertion: assertionString,
      score
    });
  });

  const bestMatch = assertionsWithScore
    .sort((a, b) => {
      const c = a.score - b.score;
      if (c !== 0) {
        return c;
      }

      if (a.assertion < b.assertion) {
        return -1;
      } else {
        return 1;
      }
    })
    .slice(0, 10)
    .filter(({ score }, i, arr) => Math.abs(score - arr[0].score) <= 2)
    .sort((a, b) => {
      const c = compareAssertions(a.assertion, b.assertion);
      if (c !== 0) {
        return c;
      }

      return a.score - b.score;
    })[0];

  this.fail({
    errorMode: 'bubbleThrough',
    message(output) {
      output
        .error("Unknown assertion '")
        .jsString(testDescriptionString)
        .error("', did you mean: '")
        .jsString(bestMatch.assertion)
        .error("'");
    }
  });
};

expectPrototype.lookupAssertionRule = function(
  subject,
  testDescriptionString,
  args,
  requireAssertionSuffix
) {
  if (typeof testDescriptionString !== 'string') {
    throw new Error(
      'The expect function requires the second parameter to be a string or an expect.it.'
    );
  }
  let handlers;
  let instance = this;
  while (instance) {
    const instanceHandlers = instance.assertions[testDescriptionString];
    if (instanceHandlers) {
      handlers = handlers
        ? handlers.concat(instanceHandlers)
        : instanceHandlers;
    }
    instance = instance.parent;
  }
  if (!handlers) {
    return null;
  }
  const cachedTypes = {};

  const findTypeOf = (value, key) => {
    let type = cachedTypes[key];
    if (!type) {
      type = this.findTypeOf(value);
      cachedTypes[key] = type;
    }
    return type;
  };

  const matches = (value, assertionType, key, relaxed) => {
    if (assertionType.is('assertion') && typeof value === 'string') {
      return true;
    }

    if (relaxed) {
      if (assertionType.identify === false) {
        return this.types.some(
          type =>
            type.identify && type.is(assertionType) && type.identify(value)
        );
      }
      return assertionType.identify(value);
    } else {
      return findTypeOf(value, key).is(assertionType);
    }
  };

  function matchesHandler(handler, relaxed) {
    if (!matches(subject, handler.subject.type, 'subject', relaxed)) {
      return false;
    }
    if (requireAssertionSuffix && !handler.args.some(isAssertionArg)) {
      return false;
    }

    if (args.length < handler.minimum || handler.maximum < args.length) {
      return false;
    } else if (args.length === 0 && handler.maximum === 0) {
      return true;
    }

    const lastRequirement = handler.args[handler.args.length - 1];
    return args.every((arg, i) => {
      if (i < handler.args.length - 1) {
        return matches(arg, handler.args[i].type, i, relaxed);
      } else {
        return matches(arg, lastRequirement.type, i, relaxed);
      }
    });
  }

  let j, handler;
  for (j = 0; j < handlers.length; j += 1) {
    handler = handlers[j];
    if (matchesHandler(handler)) {
      return handler;
    }
  }
  for (j = 0; j < handlers.length; j += 1) {
    handler = handlers[j];
    if (matchesHandler(handler, true)) {
      return handler;
    }
  }

  return null;
};

expectPrototype._assertTopLevelExpect = function() {
  // Cannot use this !== this._topLevelExpect due to https://github.com/unexpectedjs/unexpected/issues/631
  if (this.flags) {
    throw new Error('This method only works on the top level expect function');
  }
};

expectPrototype._assertWrappedExpect = function() {
  // Cannot use this === this._topLevelExpect due to https://github.com/unexpectedjs/unexpected/issues/631
  if (!this.flags) {
    throw new Error(
      'This method only works on the expect function handed to an assertion'
    );
  }
};

expectPrototype.setErrorMessage = function(err) {
  err.serializeMessage(this.outputFormat());
};

expectPrototype._createWrappedExpect = function(
  assertionRule,
  subject,
  args,
  testDescriptionString,
  context,
  forwardedFlags
) {
  const flags = extend({}, forwardedFlags, assertionRule.flags);
  const parentExpect = this;

  function wrappedExpect(subject, testDescriptionString) {
    if (arguments.length === 0) {
      throw new Error('The expect function requires at least one parameter.');
    } else if (arguments.length === 1) {
      return addAdditionalPromiseMethods(
        makePromise.resolve(subject),
        wrappedExpect,
        subject
      );
    } else if (typeof testDescriptionString === 'function') {
      wrappedExpect.errorMode = 'nested';
      return wrappedExpect.withError(
        () => testDescriptionString(subject),
        err => {
          wrappedExpect.fail(err);
        }
      );
    }
    testDescriptionString = utils.forwardFlags(testDescriptionString, flags);

    const args = new Array(arguments.length - 2);
    for (let i = 2; i < arguments.length; i += 1) {
      args[i - 2] = arguments[i];
    }
    return wrappedExpect._callInNestedContext(() =>
      parentExpect._executeExpect(
        context.child(),
        subject,
        testDescriptionString,
        args,
        wrappedExpect.flags
      )
    );
  }

  utils.setPrototypeOfOrExtend(wrappedExpect, this);

  wrappedExpect.context = context;
  wrappedExpect.execute = wrappedExpect;
  wrappedExpect.alternations = assertionRule.alternations;
  wrappedExpect.flags = flags;
  wrappedExpect.subject = subject;
  wrappedExpect.testDescription = testDescriptionString;
  wrappedExpect.args = args;
  wrappedExpect.assertionRule = assertionRule;

  wrappedExpect.subjectOutput = output => {
    output.appendInspected(subject);
  };
  wrappedExpect.argsOutput = args.map((arg, i) => {
    const argRule = wrappedExpect.assertionRule.args[i];
    if (
      typeof arg === 'string' &&
      ((argRule && argRule.type.is('assertion')) ||
        wrappedExpect._getAssertionIndices().indexOf(i) >= 0)
    ) {
      return new AssertionString(utils.forwardFlags(arg, flags));
    }

    return output => {
      output.appendInspected(arg);
    };
  });

  return wrappedExpect;
};

expectPrototype._executeExpect = function(
  context,
  subject,
  testDescriptionString,
  args,
  forwardedFlags
) {
  if (forwardedFlags) {
    testDescriptionString = utils.forwardFlags(
      testDescriptionString,
      forwardedFlags
    );
  }
  let assertionRule = this.lookupAssertionRule(
    subject,
    testDescriptionString,
    args
  );

  if (!assertionRule) {
    const tokens = testDescriptionString.split(' ');
    // eslint-disable-next-line no-labels
    OUTER: for (let n = tokens.length - 1; n > 0; n -= 1) {
      const prefix = tokens.slice(0, n).join(' ');
      const remainingTokens = tokens.slice(n);
      const argsWithAssertionPrepended = [remainingTokens.join(' ')].concat(
        args
      );
      assertionRule = this.lookupAssertionRule(
        subject,
        prefix,
        argsWithAssertionPrepended,
        true
      );
      if (assertionRule) {
        // Found the longest prefix of the string that yielded a suitable assertion for the given subject and args
        // To avoid bogus error messages when shifting later (#394) we require some prefix of the remaining tokens
        // to be a valid assertion name:
        for (let i = 1; i < remainingTokens.length; i += 1) {
          if (
            Object.prototype.hasOwnProperty.call(
              this.assertions,
              remainingTokens.slice(0, i + 1).join(' ')
            )
          ) {
            testDescriptionString = prefix;
            args = argsWithAssertionPrepended;
            // eslint-disable-next-line no-labels
            break OUTER;
          }
        }
      }
    }
    if (!assertionRule) {
      this.throwAssertionNotFoundError(subject, testDescriptionString, args);
    }
  }

  if (assertionRule.expect && assertionRule.expect !== this._topLevelExpect) {
    return assertionRule.expect._expect(context, [
      subject,
      testDescriptionString,
      ...args
    ]);
  }

  const wrappedExpect = this._createWrappedExpect(
    assertionRule,
    subject,
    args,
    testDescriptionString,
    context,
    forwardedFlags
  );

  return oathbreaker(assertionRule.handler(wrappedExpect, subject, ...args));
};

expectPrototype._expect = function(context, args, forwardedFlags) {
  const subject = args[0];
  const testDescriptionString = args[1];

  if (args.length < 2) {
    throw new Error('The expect function requires at least two parameters.');
  } else if (typeof testDescriptionString === 'function') {
    return this.withError(
      () => testDescriptionString(subject),
      err => {
        this.fail(err);
      }
    );
  }

  try {
    let result = this._executeExpect(
      context,
      subject,
      testDescriptionString,
      Array.prototype.slice.call(args, 2),
      forwardedFlags
    );
    if (utils.isPromise(result)) {
      result = wrapPromiseIfNecessary(result);
      if (result.isPending()) {
        result = result.then(undefined, e => {
          if (e && e._isUnexpected && context.level === 0) {
            this.setErrorMessage(e);
          }
          throw e;
        });
        this.notifyPendingPromise(result);
      }
    } else {
      result = makePromise.resolve(result);
    }
    return addAdditionalPromiseMethods(result, this, subject);
  } catch (e) {
    if (e && e._isUnexpected) {
      let newError = e;
      if (typeof mochaPhantomJS !== 'undefined') {
        newError = e.clone();
      }
      if (context.level === 0) {
        this.setErrorMessage(newError);
      }
      throw newError;
    }
    throw e;
  }
};

expectPrototype.diff = function(
  a,
  b,
  output = this.createOutput(),
  recursions,
  seen
) {
  const maxRecursions = 100;
  recursions = typeof recursions === 'number' ? recursions : maxRecursions;
  if (recursions <= 0) {
    // detect recursive loops in the structure
    seen = seen || [];
    if (seen.indexOf(a) !== -1) {
      throw new Error('Cannot compare circular structures');
    }
    seen.push(a);
  }

  return this.findCommonType(a, b).diff(
    a,
    b,
    output,
    (actual, expected) =>
      this.diff(actual, expected, output.clone(), recursions - 1, seen),
    (v, depth) => output.clone().appendInspected(v, depth),
    (actual, expected) => this.equal(actual, expected)
  );
};

expectPrototype.toString = function() {
  const assertions = this.assertions;

  const seen = {};
  const declarations = [];
  const pen = magicpen();
  Object.keys(assertions)
    .sort()
    .forEach(key => {
      assertions[key].forEach(({ declaration }) => {
        if (!seen[declaration]) {
          declarations.push(declaration);
          seen[declaration] = true;
        }
      });
    });

  declarations.forEach(declaration => {
    pen.text(declaration).nl();
  });
  return pen.toString();
};

expectPrototype.clone = function() {
  this._assertTopLevelExpect();
  const clonedAssertions = {};
  Object.keys(this.assertions).forEach(function(assertion) {
    clonedAssertions[assertion] = [].concat(this.assertions[assertion]);
  }, this);
  const expect = createTopLevelExpect({
    assertions: clonedAssertions,
    types: [].concat(this.types),
    typeByName: extend({}, this.typeByName),
    output: this.output.clone(),
    format: this.outputFormat(),
    installedPlugins: [].concat(this.installedPlugins)
  });
  // Install the hooks:
  expect._expect = this._expect;
  // Make sure that changes to the parent's preferredWidth doesn't propagate:
  expect.output.preferredWidth = this.output.preferredWidth;
  return expect;
};

expectPrototype.child = function() {
  this._assertTopLevelExpect();
  const childExpect = createTopLevelExpect({
    assertions: {},
    types: [],
    typeByName: {},
    output: this.output.clone(),
    format: this.outputFormat(),
    installedPlugins: []
  });
  const parent = (childExpect.parent = this);

  childExpect.exportAssertion = function(testDescription, handler) {
    parent.addAssertion(testDescription, handler, childExpect);
    return this;
  };
  childExpect.exportType = function(type) {
    if (childExpect.getType(type.name) !== type) {
      childExpect.addType(type);
    }

    parent.addType(type, childExpect);
    return this;
  };
  childExpect.exportStyle = function(name, handler, allowRedefinition) {
    parent.addStyle(
      name,
      function(...args) {
        const childOutput = childExpect.createOutput(this.format);
        this.append(handler.call(childOutput, ...args) || childOutput);
      },
      allowRedefinition
    );
    return this;
  };
  return childExpect;
};

expectPrototype.freeze = function() {
  this._assertTopLevelExpect();
  this._frozen = true;
  return this;
};

expectPrototype.outputFormat = function(format) {
  this._assertTopLevelExpect();
  if (typeof format === 'undefined') {
    return this._outputFormat;
  } else {
    this._outputFormat = format;
    return this;
  }
};

expectPrototype.createOutput = function(format) {
  const that = this;
  const output = this.output.clone(format || 'text');
  output.addStyle('appendInspected', function(value, depth) {
    this.append(that.inspect(value, depth, this.clone()));
  });
  return output;
};

expectPrototype.hook = function(fn) {
  this._assertTopLevelExpect();
  if (this._frozen) {
    throw new Error(
      'Cannot install a hook into a frozen instance, please run .clone() first'
    );
  }
  this._expect = fn(this._expect.bind(this));
};

// This is not super elegant, but wrappedExpect.fail was different:
expectPrototype.fail = function(...args) {
  // Cannot use this !== this._topLevelExpect due to https://github.com/unexpectedjs/unexpected/issues/631
  if (this.flags) {
    this._callInNestedContext(() => {
      this._topLevelExpect._fail(...args);
    });
  } else {
    try {
      this._fail(...args);
    } catch (e) {
      if (e && e._isUnexpected) {
        this.setErrorMessage(e);
      }
      throw e;
    }
  }
};

function lookupAssertionsInParentChain(assertionString, expect) {
  const assertions = [];
  for (let instance = expect; instance; instance = instance.parent) {
    if (instance.assertions[assertionString]) {
      assertions.push(...instance.assertions[assertionString]);
    }
  }
  return assertions;
}

function findSuffixAssertions(assertionString, expect) {
  if (typeof assertionString !== 'string') {
    return null;
  }
  const straightforwardAssertions = lookupAssertionsInParentChain(
    assertionString,
    expect
  );
  if (straightforwardAssertions.length > 0) {
    return straightforwardAssertions;
  }
  const tokens = assertionString.split(' ');
  for (let n = tokens.length - 1; n > 0; n -= 1) {
    const suffix = tokens.slice(n).join(' ');
    const suffixAssertions = lookupAssertionsInParentChain(suffix, expect);
    if (
      findSuffixAssertions(tokens.slice(0, n).join(' '), expect) &&
      suffixAssertions.length > 0
    ) {
      return suffixAssertions;
    }
  }
  return null;
}

expectPrototype.standardErrorMessage = function(output, options) {
  this._assertWrappedExpect();
  options = typeof options === 'object' ? options : {};

  if ('omitSubject' in output) {
    options.subject = this.subject;
  }

  if (options && options.compact) {
    options.compactSubject = output => {
      output.jsFunctionName(this.subjectType.name);
    };
  }
  return createStandardErrorMessage(
    output,
    this.subjectOutput,
    this.testDescription,
    this.argsOutput,
    options
  );
};

expectPrototype._callInNestedContext = function(callback) {
  this._assertWrappedExpect();
  try {
    let result = oathbreaker(callback());
    if (utils.isPromise(result)) {
      result = wrapPromiseIfNecessary(result);
      if (result.isPending()) {
        result = result.then(undefined, e => {
          if (e && e._isUnexpected) {
            const wrappedError = new UnexpectedError(this, e);
            wrappedError.originalError = e.originalError;
            throw wrappedError;
          }
          throw e;
        });
      }
    } else {
      result = makePromise.resolve(result);
    }
    return addAdditionalPromiseMethods(result, this.execute, this.subject);
  } catch (e) {
    if (e && e._isUnexpected) {
      const wrappedError = new UnexpectedError(this, e);
      wrappedError.originalError = e.originalError;
      throw wrappedError;
    }
    throw e;
  }
};

expectPrototype.shift = function(subject, assertionIndex) {
  this._assertWrappedExpect();
  if (arguments.length <= 1) {
    if (arguments.length === 0) {
      subject = this.subject;
    }
    assertionIndex = -1;
    for (let i = 0; i < this.assertionRule.args.length; i += 1) {
      const type = this.assertionRule.args[i].type;
      if (type.is('assertion') || type.is('expect.it')) {
        assertionIndex = i;
        break;
      }
    }
  } else if (arguments.length === 3) {
    // The 3-argument syntax for wrappedExpect.shift is deprecated, please omit the first (expect) arg
    subject = arguments[1];
    assertionIndex = arguments[2];
  }

  if (assertionIndex !== -1) {
    const args = this.args.slice(0, assertionIndex);
    const rest = this.args.slice(assertionIndex);
    const nextArgumentType = this.findTypeOf(rest[0]);
    if (arguments.length > 1) {
      // Legacy
      this.argsOutput = output => {
        args.forEach((arg, index) => {
          if (index > 0) {
            output.text(', ');
          }
          output.appendInspected(arg);
        });

        if (args.length > 0) {
          output.sp();
        }
        if (nextArgumentType.is('string')) {
          output.error(rest[0]);
        } else if (rest.length > 0) {
          output.appendInspected(rest[0]);
        }
        if (rest.length > 1) {
          output.sp();
        }
        rest.slice(1).forEach((arg, index) => {
          if (index > 0) {
            output.text(', ');
          }
          output.appendInspected(arg);
        });
      };
    }
    if (nextArgumentType.is('expect.it')) {
      return this.withError(
        () => rest[0](subject),
        err => {
          this.fail(err);
        }
      );
    } else if (nextArgumentType.is('string')) {
      return this.execute(subject, ...rest);
    } else {
      return subject;
    }
  } else {
    // No assertion to delegate to. Provide the new subject as the fulfillment value:
    return subject;
  }
};

expectPrototype._getSubjectType = function() {
  this._assertWrappedExpect();
  return this.findTypeOfWithParentType(
    this.subject,
    this.assertionRule.subject.type
  );
};

expectPrototype._getArgTypes = function(index) {
  this._assertWrappedExpect();
  const lastIndex = this.assertionRule.args.length - 1;
  return this.args.map((arg, index) => {
    return this.findTypeOfWithParentType(
      arg,
      this.assertionRule.args[Math.min(index, lastIndex)].type
    );
  });
};

expectPrototype._getAssertionIndices = function() {
  this._assertWrappedExpect();
  if (!this._assertionIndices) {
    const assertionIndices = [];
    const args = this.args;
    let currentAssertionRule = this.assertionRule;
    let offset = 0;
    // eslint-disable-next-line no-labels
    OUTER: while (true) {
      if (
        currentAssertionRule.args.length > 1 &&
        isAssertionArg(
          currentAssertionRule.args[currentAssertionRule.args.length - 2]
        )
      ) {
        assertionIndices.push(offset + currentAssertionRule.args.length - 2);
        const suffixAssertions = findSuffixAssertions(
          args[offset + currentAssertionRule.args.length - 2],
          this
        );
        if (suffixAssertions) {
          for (let i = 0; i < suffixAssertions.length; i += 1) {
            if (suffixAssertions[i].args.some(isAssertionArg)) {
              offset += currentAssertionRule.args.length - 1;
              currentAssertionRule = suffixAssertions[i];
              // eslint-disable-next-line no-labels
              continue OUTER;
            }
          }
        }
      }
      // No further assertions found,
      break;
    }
    this._assertionIndices = assertionIndices;
  }
  return this._assertionIndices;
};

Object.defineProperty(expectPrototype, 'subjectType', {
  enumerable: true,
  get() {
    this._assertWrappedExpect();
    return this._getSubjectType();
  }
});

Object.defineProperty(expectPrototype, 'argTypes', {
  enumerable: true,
  get() {
    this._assertWrappedExpect();
    return this._getArgTypes();
  }
});

function createTopLevelExpect({
  assertions = {},
  typeByName = { any: anyType },
  types = [anyType],
  output,
  format = magicpen.defaultFormat,
  installedPlugins = []
} = {}) {
  const expect = function(...args) {
    return expect._expect(new Context(), args);
  };
  utils.setPrototypeOfOrExtend(expect, expectPrototype);

  if (!output) {
    output = magicpen();
    output.inline = false;
    output.diff = false;
  }
  return extend(expect, {
    _topLevelExpect: expect,
    _outputFormat: format,
    assertions,
    typeByName,
    installedPlugins,
    types,
    output
  });
}

module.exports = createTopLevelExpect;
