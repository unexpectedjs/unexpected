const createStandardErrorMessage = require('./createStandardErrorMessage');
const makePromise = require('./makePromise');
const addAdditionalPromiseMethods = require('./addAdditionalPromiseMethods');
const wrapPromiseIfNecessary = require('./wrapPromiseIfNecessary');
const oathbreaker = require('./oathbreaker');
const UnexpectedError = require('./UnexpectedError');
const utils = require('./utils');

function isAssertionArg({ type }) {
  return type.is('assertion');
}

function lookupAssertionsInParentChain(assertionString, unexpected) {
  const assertions = [];
  for (let instance = unexpected; instance; instance = instance.parent) {
    if (instance.assertions[assertionString]) {
      assertions.push(...instance.assertions[assertionString]);
    }
  }
  return assertions;
}

function findSuffixAssertions(assertionString, unexpected) {
  if (typeof assertionString !== 'string') {
    return null;
  }
  const straightforwardAssertions = lookupAssertionsInParentChain(
    assertionString,
    unexpected
  );
  if (straightforwardAssertions.length > 0) {
    return straightforwardAssertions;
  }
  const tokens = assertionString.split(' ');
  for (let n = tokens.length - 1; n > 0; n -= 1) {
    const suffix = tokens.slice(n).join(' ');
    const suffixAssertions = lookupAssertionsInParentChain(suffix, unexpected);
    if (
      findSuffixAssertions(tokens.slice(0, n).join(' '), unexpected) &&
      suffixAssertions.length > 0
    ) {
      return suffixAssertions;
    }
  }
  return null;
}

module.exports = function createWrappedExpectProto(unexpected) {
  const wrappedExpectProto = {
    promise: makePromise,
    errorMode: 'default',

    equal: unexpected.equal,
    inspect: unexpected.inspect,
    createOutput: unexpected.createOutput.bind(unexpected),
    findTypeOf: unexpected.findTypeOf.bind(unexpected),
    findTypeOfWithParentType: unexpected.findTypeOfWithParentType.bind(
      unexpected
    ),
    findCommonType: unexpected.findCommonType.bind(unexpected),
    it(...args) {
      if (typeof args[0] === 'string') {
        args[0] = utils.forwardFlags(args[0], this.flags);
      }
      return unexpected.it(...args);
    },
    diff: unexpected.diff,
    getType: unexpected.getType,
    output: unexpected.output,
    outputFormat: unexpected.outputFormat.bind(unexpected),
    format: unexpected.format,
    withError: unexpected.withError,

    fail(...args) {
      const expect = this.context.expect;
      this.callInNestedContext(() => {
        expect.fail(...args);
      });
    },
    standardErrorMessage(output, options) {
      const that = this;
      options = typeof options === 'object' ? options : {};

      if ('omitSubject' in output) {
        options.subject = this.subject;
      }

      if (options && options.compact) {
        options.compactSubject = output => {
          output.jsFunctionName(that.subjectType.name);
        };
      }
      return createStandardErrorMessage(
        output,
        that.subjectOutput,
        that.testDescription,
        that.argsOutput,
        options
      );
    },
    callInNestedContext(callback) {
      const that = this;

      try {
        let result = oathbreaker(callback());
        if (utils.isPromise(result)) {
          result = wrapPromiseIfNecessary(result);
          if (result.isPending()) {
            result = result.then(undefined, e => {
              if (e && e._isUnexpected) {
                const wrappedError = new UnexpectedError(that, e);
                wrappedError.originalError = e.originalError;
                throw wrappedError;
              }
              throw e;
            });
          }
        } else {
          result = makePromise.resolve(result);
        }
        return addAdditionalPromiseMethods(result, that.execute, that.subject);
      } catch (e) {
        if (e && e._isUnexpected) {
          const wrappedError = new UnexpectedError(that, e);
          wrappedError.originalError = e.originalError;
          throw wrappedError;
        }
        throw e;
      }
    },
    shift(subject, assertionIndex) {
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
          const that = this;
          return this.withError(
            () => rest[0](subject),
            err => {
              that.fail(err);
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
    },
    _getSubjectType() {
      return this.findTypeOfWithParentType(
        this.subject,
        this.assertionRule.subject.type
      );
    },
    _getArgTypes(index) {
      const lastIndex = this.assertionRule.args.length - 1;
      return this.args.map(function(arg, index) {
        return this.findTypeOfWithParentType(
          arg,
          this.assertionRule.args[Math.min(index, lastIndex)].type
        );
      }, this);
    },
    _getAssertionIndices() {
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
            assertionIndices.push(
              offset + currentAssertionRule.args.length - 2
            );
            const suffixAssertions = findSuffixAssertions(
              args[offset + currentAssertionRule.args.length - 2],
              unexpected
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
    }
  };

  if (Object.__defineGetter__) {
    Object.defineProperty(wrappedExpectProto, 'subjectType', {
      enumerable: true,
      get() {
        return this.assertionRule && this._getSubjectType();
      }
    });

    Object.defineProperty(wrappedExpectProto, 'argTypes', {
      enumerable: true,
      get() {
        return this.assertionRule && this._getArgTypes();
      }
    });
  }

  utils.setPrototypeOfOrExtend(wrappedExpectProto, Function.prototype);
  return wrappedExpectProto;
};
