const createStandardErrorMessage = require('./createStandardErrorMessage');
const utils = require('./utils');
const magicpen = require('magicpen');
const extend = utils.extend;
const leven = require('leven');
const makePromise = require('./makePromise');
const addAdditionalPromiseMethods = require('./addAdditionalPromiseMethods');
const wrapPromiseIfNecessary = require('./wrapPromiseIfNecessary');
const oathbreaker = require('./oathbreaker');
const UnexpectedError = require('./UnexpectedError');
const notifyPendingPromise = require('./notifyPendingPromise');
const defaultDepth = require('./defaultDepth');
const createWrappedExpectProto = require('./createWrappedExpectProto');
const AssertionString = require('./AssertionString');
const throwIfNonUnexpectedError = require('./throwIfNonUnexpectedError');
const makeDiffResultBackwardsCompatible = require('./makeDiffResultBackwardsCompatible');

function isAssertionArg({ type }) {
  return type.is('assertion');
}

function Context(unexpected) {
  this.expect = unexpected;
  this.level = 0;
}

Context.prototype.child = function() {
  const child = Object.create(this);
  child.level++;
  return child;
};

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

function Unexpected(options = {}) {
  this.assertions = options.assertions || {};
  this.typeByName = options.typeByName || { any: anyType };
  this.types = options.types || [anyType];
  if (options.output) {
    this.output = options.output;
  } else {
    this.output = magicpen();
    this.output.inline = false;
    this.output.diff = false;
  }
  this._outputFormat = options.format || magicpen.defaultFormat;
  this.installedPlugins = options.installedPlugins || [];

  // Make bound versions of these two helpers up front to save a bit when creating wrapped expects:
  const that = this;
  this.getType = typeName =>
    that.typeByName[typeName] || (that.parent && that.parent.getType(typeName));
  this.findTypeOf = obj =>
    utils.findFirst(
      that.types || [],
      type => type.identify && type.identify(obj)
    ) ||
    (that.parent && that.parent.findTypeOf(obj));
  this.findTypeOfWithParentType = (obj, requiredParentType) =>
    utils.findFirst(
      that.types || [],
      type =>
        type.identify &&
        type.identify(obj) &&
        (!requiredParentType || type.is(requiredParentType))
    ) ||
    (that.parent &&
      that.parent.findTypeOfWithParentType(obj, requiredParentType));
  this.findCommonType = function(a, b) {
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
  this._wrappedExpectProto = createWrappedExpectProto(this);
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

function evaluateGroup(unexpected, context, subject, orGroup) {
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
          return unexpected._expect(context.child(), args);
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

function createExpectIt(unexpected, expectations) {
  const orGroups = getOrGroups(expectations);

  function expectIt(subject, context) {
    context =
      context && typeof context === 'object' && context instanceof Context
        ? context
        : new Context(unexpected);

    const groupEvaluations = [];
    const promises = [];
    orGroups.forEach(orGroup => {
      const evaluations = evaluateGroup(unexpected, context, subject, orGroup);
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
          unexpected.fail(output => {
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
    return createExpectIt(unexpected, copiedExpectations);
  };
  expectIt.or = function(...args) {
    const copiedExpectations = expectations.slice();
    copiedExpectations.push(OR, args);
    return createExpectIt(unexpected, copiedExpectations);
  };
  return expectIt;
}

Unexpected.prototype.it = function(...args) {
  // ...
  return createExpectIt(this, [args]);
};

Unexpected.prototype.equal = function(actual, expected, depth, seen) {
  const that = this;

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
    that.equal(a, b, depth - 1, seen)
  );
};

Unexpected.prototype.inspect = function(obj, depth, outputOrFormat) {
  let seen = [];
  const that = this;
  function printOutput(obj, currentDepth, output) {
    const objType = that.findTypeOf(obj);
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
  }

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

Unexpected.prototype.expandTypeAlternations = function(assertion) {
  const that = this;
  function createPermutations(args, i) {
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
          { type: that.getType('any'), minimum: 0, maximum: Infinity }
        ]);
        result.push([
          { type: that.getType('expect.it'), minimum: 1, maximum: 1 }
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
  }
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

Unexpected.prototype.parseAssertion = function(assertionString) {
  const that = this;
  const tokens = [];
  let nextIndex = 0;

  function parseTypeToken(typeToken) {
    return typeToken.split('|').map(typeDeclaration => {
      const matchNameAndOperator = typeDeclaration.match(
        /^([a-z_](?:|[a-z0-9_.-]*[_a-z0-9]))([+*?]|)$/i
      );
      if (!matchNameAndOperator) {
        throw new SyntaxError(
          `Cannot parse type declaration:${typeDeclaration}`
        );
      }
      const type = that.getType(matchNameAndOperator[1]);
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
  }

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
Unexpected.prototype.fail = function(arg) {
  if (arg instanceof UnexpectedError) {
    arg._hasSerializedErrorMessage = false;
    throw arg;
  }

  if (utils.isError(arg)) {
    throw arg;
  }

  const error = new UnexpectedError(this.expect);
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
    const expect = this.expect;
    Object.keys(arg).forEach(function(key) {
      const value = arg[key];
      if (key === 'diff') {
        if (typeof value === 'function' && this.parent) {
          error.createDiff = (output, diff, inspect, equal) => {
            const childOutput = expect.createOutput(output.format);
            childOutput.inline = output.inline;
            childOutput.output = output.output;
            return value(
              childOutput,
              function diff(actual, expected) {
                return expect.diff(actual, expected, childOutput.clone());
              },
              function inspect(v, depth) {
                return childOutput
                  .clone()
                  .appendInspected(v, (depth || defaultDepth) - 1);
              },
              (actual, expected) => expect.equal(actual, expected)
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

Unexpected.prototype.addAssertion = function(
  patternOrPatterns,
  handler,
  childUnexpected
) {
  if (this._frozen) {
    throw new Error(
      'Cannot add an assertion to a frozen instance, please run .clone() first'
    );
  }
  let maxArguments;
  if (typeof childUnexpected === 'object') {
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

  const that = this;
  const assertions = this.assertions;

  const defaultValueByFlag = {};
  const assertionHandlers = [];
  let maxNumberOfArgs = 0;
  patterns.forEach(pattern => {
    const assertionDeclarations = that.parseAssertion(pattern);
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
        assertionHandlers.push({
          handler,
          alternations: alternations,
          flags: flags,
          subject: subject,
          args: args,
          testDescriptionString: text,
          declaration: pattern,
          unexpected: childUnexpected
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

  return this.expect; // for chaining
};

Unexpected.prototype.addType = function(type, childUnexpected) {
  if (this._frozen) {
    throw new Error(
      'Cannot add a type to a frozen instance, please run .clone() first'
    );
  }
  const that = this;
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
      `Type ${
        type.name
      } must specify an identify function or be declared abstract by setting identify to false`
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

  extendedBaseType.diff = (actual, expected, output) => {
    if (!output || !output.isMagicPen) {
      throw new Error(
        'You need to pass the output to baseType.diff() as the third parameter'
      );
    }

    return makeDiffResultBackwardsCompatible(
      baseType.diff(
        actual,
        expected,
        output.clone(),
        (actual, expected) => that.diff(actual, expected, output.clone()),
        (value, depth) => output.clone().appendInspected(value, depth),
        that.equal.bind(that)
      )
    );
  };

  extendedBaseType.equal = (actual, expected) =>
    baseType.equal(actual, expected, that.equal.bind(that));

  const extendedType = extend({}, baseType, type, {
    baseType: extendedBaseType
  });
  const originalInspect = extendedType.inspect;

  extendedType.inspect = function(obj, depth, output, inspect) {
    if (arguments.length < 2 || (!output || !output.isMagicPen)) {
      return `type: ${type.name}`;
    } else if (childUnexpected) {
      const childOutput = childUnexpected.createOutput(output.format);
      return (
        originalInspect.call(this, obj, depth, childOutput, inspect) ||
        childOutput
      );
    } else {
      return originalInspect.call(this, obj, depth, output, inspect) || output;
    }
  };

  if (childUnexpected) {
    extendedType.childUnexpected = childUnexpected;
    const originalDiff = extendedType.diff;
    extendedType.diff = function(
      actual,
      expected,
      output,
      inspect,
      diff,
      equal
    ) {
      const childOutput = childUnexpected.createOutput(output.format);
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

  return this.expect;
};

Unexpected.prototype.addStyle = function(...args) {
  if (this._frozen) {
    throw new Error(
      'Cannot add a style to a frozen instance, please run .clone() first'
    );
  }
  this.output.addStyle(...args);
  return this.expect;
};

Unexpected.prototype.installTheme = function(...args) {
  if (this._frozen) {
    throw new Error(
      'Cannot install a theme into a frozen instance, please run .clone() first'
    );
  }
  this.output.installTheme(...args);
  return this.expect;
};

function getPluginName(plugin) {
  if (typeof plugin === 'function') {
    return utils.getFunctionName(plugin);
  } else {
    return plugin.name;
  }
}

Unexpected.prototype.use = function(plugin) {
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
      return this.expect;
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
    plugin(this.expect);
  } else {
    plugin.installInto(this.expect);
  }

  return this.expect; // for chaining
};

Unexpected.prototype.withError = (body, handler) =>
  oathbreaker(
    makePromise(body).caught(e => {
      throwIfNonUnexpectedError(e);
      return handler(e);
    })
  );

Unexpected.prototype.installPlugin = Unexpected.prototype.use; // Legacy alias

function installExpectMethods(unexpected) {
  const expect = function(...args) {
    /// ...
    return unexpected._expect(new Context(unexpected), args);
  };
  expect.it = unexpected.it.bind(unexpected);
  expect.equal = unexpected.equal.bind(unexpected);
  expect.inspect = unexpected.inspect.bind(unexpected);
  expect.findTypeOf = unexpected.findTypeOf; // Already bound
  expect.fail = (...args) => {
    try {
      unexpected.fail(...args);
    } catch (e) {
      if (e && e._isUnexpected) {
        unexpected.setErrorMessage(e);
      }
      throw e;
    }
  };

  expect.createOutput = unexpected.createOutput.bind(unexpected);
  expect.diff = unexpected.diff.bind(unexpected);
  expect.async = unexpected.async.bind(unexpected);
  expect.promise = makePromise;
  expect.withError = unexpected.withError;
  expect.addAssertion = unexpected.addAssertion.bind(unexpected);
  expect.addStyle = unexpected.addStyle.bind(unexpected);
  expect.installTheme = unexpected.installTheme.bind(unexpected);
  expect.addType = unexpected.addType.bind(unexpected);
  expect.getType = unexpected.getType;
  expect.clone = unexpected.clone.bind(unexpected);
  expect.child = unexpected.child.bind(unexpected);
  expect.freeze = unexpected.freeze.bind(unexpected);
  expect.toString = unexpected.toString.bind(unexpected);
  expect.assertions = unexpected.assertions;
  expect.use = expect.installPlugin = unexpected.use.bind(unexpected);
  expect.output = unexpected.output;
  expect.outputFormat = unexpected.outputFormat.bind(unexpected);
  expect.notifyPendingPromise = notifyPendingPromise;
  expect.hook = fn => {
    unexpected._expect = fn(unexpected._expect.bind(unexpected));
  };
  // TODO For testing purpose while we don't have all the pieces yet
  expect.parseAssertion = unexpected.parseAssertion.bind(unexpected);

  return expect;
}

function calculateLimits(items) {
  return items.reduce(
    (result, { minimum, maximum }) => {
      result.minimum += minimum;
      result.maximum += maximum;
      return result;
    },
    { minimum: 0, maximum: 0 }
  );
}

Unexpected.prototype.throwAssertionNotFoundError = function(
  subject,
  testDescriptionString,
  args
) {
  let candidateHandlers = this.assertions[testDescriptionString];
  const that = this;

  let instance = this;
  while (instance && !candidateHandlers) {
    candidateHandlers = instance.assertions[testDescriptionString];
    instance = instance.parent;
  }

  if (candidateHandlers) {
    this.fail({
      message(output) {
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
          .text(that.findTypeOf(subject).name)
          .text('>')
          .sp()
          .text(testDescriptionString);

        args.forEach((arg, i) => {
          output
            .sp()
            .text('<')
            .text(that.findTypeOf(arg).name)
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

  function compareAssertions(a, b) {
    const aAssertion = that.lookupAssertionRule(subject, a, args);
    const bAssertion = that.lookupAssertionRule(subject, b, args);
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
  }

  assertionStrings.forEach(assertionString => {
    const score = leven(testDescriptionString, assertionString);

    assertionsWithScore.push({
      assertion: assertionString,
      score
    });
  }, this);

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

Unexpected.prototype.lookupAssertionRule = function(
  subject,
  testDescriptionString,
  args,
  requireAssertionSuffix
) {
  const that = this;
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

  function findTypeOf(value, key) {
    let type = cachedTypes[key];
    if (!type) {
      type = that.findTypeOf(value);
      cachedTypes[key] = type;
    }
    return type;
  }

  function matches(value, assertionType, key, relaxed) {
    if (assertionType.is('assertion') && typeof value === 'string') {
      return true;
    }

    if (relaxed) {
      if (assertionType.identify === false) {
        return that.types.some(
          type =>
            type.identify && type.is(assertionType) && type.identify(value)
        );
      }
      return assertionType.identify(value);
    } else {
      return findTypeOf(value, key).is(assertionType);
    }
  }

  function matchesHandler(handler, relaxed) {
    if (!matches(subject, handler.subject.type, 'subject', relaxed)) {
      return false;
    }
    if (requireAssertionSuffix && !handler.args.some(isAssertionArg)) {
      return false;
    }

    const requireArgumentsLength = calculateLimits(handler.args);

    if (
      args.length < requireArgumentsLength.minimum ||
      requireArgumentsLength.maximum < args.length
    ) {
      return false;
    } else if (args.length === 0 && requireArgumentsLength.maximum === 0) {
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

function makeExpectFunction(unexpected) {
  const expect = installExpectMethods(unexpected);
  unexpected.expect = expect;
  return expect;
}

Unexpected.prototype.setErrorMessage = function(err) {
  err.serializeMessage(this.outputFormat());
};

Unexpected.prototype._expect = function expect(context, args) {
  const that = this;
  const subject = args[0];
  const testDescriptionString = args[1];

  if (args.length < 2) {
    throw new Error('The expect function requires at least two parameters.');
  } else if (testDescriptionString && testDescriptionString._expectIt) {
    return that.expect.withError(
      () => testDescriptionString(subject),
      err => {
        that.fail(err);
      }
    );
  }

  function executeExpect(context, subject, testDescriptionString, args) {
    let assertionRule = that.lookupAssertionRule(
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
        assertionRule = that.lookupAssertionRule(
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
              that.assertions.hasOwnProperty(
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
        that.throwAssertionNotFoundError(subject, testDescriptionString, args);
      }
    }
    if (
      assertionRule &&
      assertionRule.unexpected &&
      assertionRule.unexpected !== that
    ) {
      return assertionRule.unexpected.expect(
        subject,
        testDescriptionString,
        ...args
      );
    }

    const flags = extend({}, assertionRule.flags);
    const wrappedExpect = function(subject, testDescriptionString) {
      if (arguments.length === 0) {
        throw new Error('The expect function requires at least one parameter.');
      } else if (arguments.length === 1) {
        return addAdditionalPromiseMethods(
          makePromise.resolve(subject),
          wrappedExpect,
          subject
        );
      } else if (testDescriptionString && testDescriptionString._expectIt) {
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
      return wrappedExpect.callInNestedContext(() =>
        executeExpect(context.child(), subject, testDescriptionString, args)
      );
    };

    utils.setPrototypeOfOrExtend(wrappedExpect, that._wrappedExpectProto);

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
        return new AssertionString(arg);
      }

      return output => {
        output.appendInspected(arg);
      };
    });

    // Eager-compute these properties in browsers that don't support getters
    // (Object.defineProperty might be polyfilled by es5-sham):
    if (!Object.__defineGetter__) {
      wrappedExpect.subjectType = wrappedExpect._getSubjectType();
      wrappedExpect.argTypes = wrappedExpect._getArgTypes();
    }

    return oathbreaker(
      assertionRule.handler.call(wrappedExpect, wrappedExpect, subject, ...args)
    );
  }

  try {
    let result = executeExpect(
      context,
      subject,
      testDescriptionString,
      Array.prototype.slice.call(args, 2)
    );
    if (utils.isPromise(result)) {
      result = wrapPromiseIfNecessary(result);
      if (result.isPending()) {
        that.expect.notifyPendingPromise(result);
        result = result.then(undefined, e => {
          if (e && e._isUnexpected && context.level === 0) {
            that.setErrorMessage(e);
          }
          throw e;
        });
      }
    } else {
      result = makePromise.resolve(result);
    }
    return addAdditionalPromiseMethods(result, that.expect, subject);
  } catch (e) {
    if (e && e._isUnexpected) {
      let newError = e;
      if (typeof mochaPhantomJS !== 'undefined') {
        newError = e.clone();
      }
      if (context.level === 0) {
        that.setErrorMessage(newError);
      }
      throw newError;
    }
    throw e;
  }
};

Unexpected.prototype.async = function(cb) {
  const that = this;

  function asyncMisusage(message) {
    that._isAsync = false;
    that.expect.fail(output => {
      output
        .error(message)
        .nl()
        .text('Usage: ')
        .nl()
        .text("it('test description', expect.async(function () {")
        .nl()
        .indentLines()
        .i()
        .text(
          "return expect('test.txt', 'to have content', 'Content read asynchroniously');"
        )
        .nl()
        .outdentLines()
        .text('});');
    });
  }

  if (typeof cb !== 'function' || cb.length !== 0) {
    asyncMisusage('expect.async requires a callback without arguments.');
  }

  return done => {
    if (that._isAsync) {
      asyncMisusage("expect.async can't be within a expect.async context.");
    }
    that._isAsync = true;

    if (typeof done !== 'function') {
      asyncMisusage(
        'expect.async should be called in the context of an it-block\n' +
          'and the it-block should supply a done callback.'
      );
    }
    let result;
    try {
      result = cb();
    } finally {
      that._isAsync = false;
    }
    if (!result || typeof result.then !== 'function') {
      asyncMisusage(
        'expect.async requires the block to return a promise or throw an exception.'
      );
    }
    result.then(
      () => {
        that._isAsync = false;
        done();
      },
      err => {
        that._isAsync = false;
        done(err);
      }
    );
  };
};

Unexpected.prototype.diff = function(
  a,
  b,
  output = this.createOutput(),
  recursions,
  seen
) {
  const that = this;

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

  return makeDiffResultBackwardsCompatible(
    this.findCommonType(a, b).diff(
      a,
      b,
      output,
      (actual, expected) =>
        that.diff(actual, expected, output.clone(), recursions - 1, seen),
      (v, depth) => output.clone().appendInspected(v, depth),
      (actual, expected) => that.equal(actual, expected)
    )
  );
};

Unexpected.prototype.toString = function() {
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

Unexpected.prototype.clone = function() {
  const clonedAssertions = {};
  Object.keys(this.assertions).forEach(function(assertion) {
    clonedAssertions[assertion] = [].concat(this.assertions[assertion]);
  }, this);
  const unexpected = new Unexpected({
    assertions: clonedAssertions,
    types: [].concat(this.types),
    typeByName: extend({}, this.typeByName),
    output: this.output.clone(),
    format: this.outputFormat(),
    installedPlugins: [].concat(this.installedPlugins)
  });
  // Install the hooks:
  unexpected._expect = this._expect;
  return makeExpectFunction(unexpected);
};

Unexpected.prototype.child = function() {
  const childUnexpected = new Unexpected({
    assertions: {},
    types: [],
    typeByName: {},
    output: this.output.clone(),
    format: this.outputFormat(),
    installedPlugins: []
  });
  const parent = (childUnexpected.parent = this);
  const childExpect = makeExpectFunction(childUnexpected);

  childExpect.exportAssertion = function(testDescription, handler) {
    parent.addAssertion(testDescription, handler, childUnexpected);
    return this;
  };
  childExpect.exportType = function(type) {
    if (childExpect.getType(type.name) !== type) {
      childExpect.addType(type);
    }

    parent.addType(type, childUnexpected);
    return this;
  };
  childExpect.exportStyle = function(name, handler) {
    parent.addStyle(name, function(...args) {
      const childOutput = childExpect.createOutput(this.format);
      this.append(handler.call(childOutput, ...args) || childOutput);
    });
    return this;
  };
  return childExpect;
};

Unexpected.prototype.freeze = function() {
  this._frozen = true;
  return this.expect;
};

Unexpected.prototype.outputFormat = function(format) {
  if (typeof format === 'undefined') {
    return this._outputFormat;
  } else {
    this._outputFormat = format;
    return this.expect;
  }
};

Unexpected.prototype.createOutput = function(format) {
  const that = this;
  const output = this.output.clone(format || 'text');
  output.addStyle('appendInspected', function(value, depth) {
    this.append(that.inspect(value, depth, this.clone()));
  });
  return output;
};

Unexpected.create = () => {
  const unexpected = new Unexpected();
  return makeExpectFunction(unexpected);
};

var expandAssertion = (() => {
  function isFlag(token) {
    return token.slice(0, 1) === '[' && token.slice(-1) === ']';
  }
  function isAlternation(token) {
    return token.slice(0, 1) === '(' && token.slice(-1) === ')';
  }
  function removeEmptyStrings(texts) {
    return texts.filter(text => text !== '');
  }
  function createPermutations(tokens, index) {
    if (index === tokens.length) {
      return [{ text: '', flags: {}, alternations: [] }];
    }

    const token = tokens[index];
    const tail = createPermutations(tokens, index + 1);
    if (isFlag(token)) {
      const flag = token.slice(1, -1);
      return tail
        .map(pattern => {
          const flags = {};
          flags[flag] = true;
          return {
            text: `${flag} ${pattern.text}`,
            flags: extend(flags, pattern.flags),
            alternations: pattern.alternations
          };
        })
        .concat(
          tail.map(pattern => {
            const flags = {};
            flags[flag] = false;
            return {
              text: pattern.text,
              flags: extend(flags, pattern.flags),
              alternations: pattern.alternations
            };
          })
        );
    } else if (isAlternation(token)) {
      return token
        .substr(1, token.length - 2) // Remove parentheses
        .split(/\|/)
        .reduce(
          (result, alternation) =>
            result.concat(
              tail.map(({ text, flags, alternations }) => ({
                // Make sure that an empty alternation doesn't produce two spaces:
                text: alternation ? alternation + text : text.replace(/^ /, ''),

                flags: flags,
                alternations: [alternation].concat(alternations)
              }))
            ),
          []
        );
    } else {
      return tail.map(({ text, flags, alternations }) => ({
        text: token + text,
        flags: flags,
        alternations: alternations
      }));
    }
  }
  return pattern => {
    pattern = pattern.replace(/(\[[^\]]+\]) ?/g, '$1');
    const splitRegex = /\[[^\]]+\]|\([^)]+\)/g;
    let tokens = [];
    let m;
    let lastIndex = 0;
    while ((m = splitRegex.exec(pattern))) {
      tokens.push(pattern.slice(lastIndex, m.index));
      tokens.push(pattern.slice(m.index, splitRegex.lastIndex));
      lastIndex = splitRegex.lastIndex;
    }
    tokens.push(pattern.slice(lastIndex));
    tokens = removeEmptyStrings(tokens);
    const permutations = createPermutations(tokens, 0);
    permutations.forEach(permutation => {
      permutation.text = permutation.text.trim();
      if (permutation.text === '') {
        // This can only happen if the pattern only contains flags
        throw new Error('Assertion patterns must not only contain flags');
      }
    });
    return permutations;
  };
})();

function ensureValidUseOfParenthesesOrBrackets(pattern) {
  const counts = {
    '[': 0,
    ']': 0,
    '(': 0,
    ')': 0
  };
  for (let i = 0; i < pattern.length; i += 1) {
    const c = pattern.charAt(i);
    if (c in counts) {
      counts[c] += 1;
    }
    if (c === ']' && counts['['] >= counts[']']) {
      if (counts['['] === counts[']'] + 1) {
        throw new Error(
          `Assertion patterns must not contain flags with brackets: '${pattern}'`
        );
      }

      if (counts['('] !== counts[')']) {
        throw new Error(
          `Assertion patterns must not contain flags with parentheses: '${pattern}'`
        );
      }

      if (pattern.charAt(i - 1) === '[') {
        throw new Error(
          `Assertion patterns must not contain empty flags: '${pattern}'`
        );
      }
    } else if (c === ')' && counts['('] >= counts[')']) {
      if (counts['('] === counts[')'] + 1) {
        throw new Error(
          `Assertion patterns must not contain alternations with parentheses: '${pattern}'`
        );
      }

      if (counts['['] !== counts[']']) {
        throw new Error(
          `Assertion patterns must not contain alternations with brackets: '${pattern}'`
        );
      }
    }
  }

  if (counts['['] !== counts[']']) {
    throw new Error(
      `Assertion patterns must not contain unbalanced brackets: '${pattern}'`
    );
  }

  if (counts['('] !== counts[')']) {
    throw new Error(
      `Assertion patterns must not contain unbalanced parentheses: '${pattern}'`
    );
  }
}

module.exports = Unexpected;
