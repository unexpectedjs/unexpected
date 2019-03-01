const utils = require('./utils');
const defaultDepth = require('./defaultDepth');
const useFullStackTrace = require('./useFullStackTrace');

const errorMethodBlacklist = [
  'message',
  'line',
  'sourceId',
  'sourceURL',
  'stack',
  'stackArray'
].reduce((result, prop) => {
  result[prop] = true;
  return result;
}, {});

function UnexpectedError(expect, parent) {
  this.errorMode = (expect && expect.errorMode) || 'default';
  const base = Error.call(this, '');

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, UnexpectedError);
  } else {
    // Throw the error to make sure it has its stack serialized:
    try {
      throw base;
    } catch (err) {}
    this.stack = base.stack;
  }

  // Prevent flooding the screen in node-tap
  // https://github.com/unexpectedjs/unexpected/issues/582
  Object.defineProperties(this, {
    expect: {
      enumerable: false,
      value: expect
    }
  });
  this.parent = parent || null;
  this.name = 'UnexpectedError';
}

UnexpectedError.prototype = Object.create(Error.prototype);

UnexpectedError.prototype.useFullStackTrace = useFullStackTrace;

const missingOutputMessage =
  'You must either provide a format or a magicpen instance';
UnexpectedError.prototype.outputFromOptions = function(options) {
  if (!options) {
    throw new Error(missingOutputMessage);
  }

  if (typeof options === 'string') {
    return this.expect.createOutput(options);
  }

  if (options.isMagicPen) {
    return options.clone();
  }

  if (options.output) {
    return options.output.clone();
  }

  if (options.format) {
    return this.expect.createOutput(options.format);
  }

  throw new Error(missingOutputMessage);
};

UnexpectedError.prototype._isUnexpected = true;
UnexpectedError.prototype.isUnexpected = true;
UnexpectedError.prototype.buildDiff = function(options) {
  const output = this.outputFromOptions(options);
  const expect = this.expect;
  return (
    this.createDiff &&
    this.createDiff(
      output,
      (actual, expected) => expect.diff(actual, expected, output.clone()),
      (v, depth) =>
        output.clone().appendInspected(v, (depth || defaultDepth) - 1),
      (actual, expected) => expect.equal(actual, expected)
    )
  );
};

UnexpectedError.prototype.getDefaultErrorMessage = function(options) {
  const output = this.outputFromOptions(options);
  if (this.expect.testDescription) {
    output.append(this.expect.standardErrorMessage(output.clone(), options));
  } else if (typeof this.output === 'function') {
    this.output.call(output, output);
  }

  let errorWithDiff = this;
  while (!errorWithDiff.createDiff && errorWithDiff.parent) {
    errorWithDiff = errorWithDiff.parent;
  }

  if (errorWithDiff && errorWithDiff.createDiff) {
    const comparison = errorWithDiff.buildDiff(options);
    if (comparison) {
      output.nl(2).append(comparison);
    }
  }

  return output;
};

UnexpectedError.prototype.getNestedErrorMessage = function(options) {
  const output = this.outputFromOptions(options);
  if (this.expect.testDescription) {
    output.append(this.expect.standardErrorMessage(output.clone(), options));
  } else if (typeof this.output === 'function') {
    this.output.call(output, output);
  }

  let parent = this.parent;
  while (parent.getErrorMode() === 'bubble') {
    parent = parent.parent;
  }

  if (typeof options === 'string') {
    options = { format: options };
  } else if (options && options.isMagicPen) {
    options = { output: options };
  }

  output
    .nl()
    .indentLines()
    .i()
    .block(
      parent.getErrorMessage(
        utils.extend({}, options || {}, {
          compact: this.expect.subject === parent.expect.subject
        })
      )
    );
  return output;
};

UnexpectedError.prototype.getDefaultOrNestedMessage = function(options) {
  if (this.hasDiff()) {
    return this.getDefaultErrorMessage(options);
  } else {
    return this.getNestedErrorMessage(options);
  }
};

UnexpectedError.prototype.hasDiff = function() {
  return !!this.getDiffMethod();
};

UnexpectedError.prototype.getDiffMethod = function() {
  let errorWithDiff = this;
  while (!errorWithDiff.createDiff && errorWithDiff.parent) {
    errorWithDiff = errorWithDiff.parent;
  }

  return (errorWithDiff && errorWithDiff.createDiff) || null;
};

UnexpectedError.prototype.getDiff = function(options) {
  let errorWithDiff = this;
  while (!errorWithDiff.createDiff && errorWithDiff.parent) {
    errorWithDiff = errorWithDiff.parent;
  }

  return errorWithDiff && errorWithDiff.buildDiff(options);
};

UnexpectedError.prototype.getDiffMessage = function(options) {
  const output = this.outputFromOptions(options);
  const comparison = this.getDiff(options);
  if (comparison) {
    output.append(comparison);
  } else if (this.expect.testDescription) {
    output.append(this.expect.standardErrorMessage(output.clone(), options));
  } else if (typeof this.output === 'function') {
    this.output.call(output, output);
  }
  return output;
};

UnexpectedError.prototype.getErrorMode = function() {
  if (!this.parent) {
    switch (this.errorMode) {
      case 'default':
      case 'bubbleThrough':
        return this.errorMode;
      default:
        return 'default';
    }
  } else {
    return this.errorMode;
  }
};

UnexpectedError.prototype.getErrorMessage = function(options) {
  // Search for any parent error that has an error mode of 'bubbleThrough' through on the
  // error these should be bubbled to the top
  let errorWithBubbleThrough = this.parent;
  while (
    errorWithBubbleThrough &&
    errorWithBubbleThrough.getErrorMode() !== 'bubbleThrough'
  ) {
    errorWithBubbleThrough = errorWithBubbleThrough.parent;
  }
  if (errorWithBubbleThrough) {
    return errorWithBubbleThrough.getErrorMessage(options);
  }

  const errorMode = this.getErrorMode();
  switch (errorMode) {
    case 'nested':
      return this.getNestedErrorMessage(options);
    case 'default':
      return this.getDefaultErrorMessage(options);
    case 'bubbleThrough':
      return this.getDefaultErrorMessage(options);
    case 'bubble':
      return this.parent.getErrorMessage(options);
    case 'diff':
      return this.getDiffMessage(options);
    case 'defaultOrNested':
      return this.getDefaultOrNestedMessage(options);
    default:
      throw new Error(`Unknown error mode: '${errorMode}'`);
  }
};

function findStackStart(lines) {
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i] === '') {
      return i + 1;
    }
  }

  return -1;
}

UnexpectedError.prototype.serializeMessage = function(outputFormat) {
  if (!this._hasSerializedErrorMessage) {
    const htmlFormat = outputFormat === 'html';
    if (htmlFormat) {
      if (!('htmlMessage' in this)) {
        this.htmlMessage = this.getErrorMessage({ format: 'html' }).toString();
      }
    }

    this.message = `\n${this.getErrorMessage({
      format: htmlFormat ? 'text' : outputFormat
    }).toString()}\n`;

    if (
      this.originalError &&
      this.originalError instanceof Error &&
      typeof this.originalError.stack === 'string'
    ) {
      // The stack of the original error looks like this:
      //   <constructor name>: <error message>\n<actual stack trace>
      // Try to get hold of <actual stack trace> and append it
      // to the error message of this error:
      const index = this.originalError.stack.indexOf(
        this.originalError.message
      );
      if (index === -1) {
        // Phantom.js doesn't include the error message in the stack property
        this.stack = `${this.message}\n${this.originalError.stack}`;
      } else {
        this.stack =
          this.message +
          this.originalError.stack.substr(
            index + this.originalError.message.length
          );
      }
    } else if (/^(Unexpected)?Error:?\n/.test(this.stack)) {
      // Fix for Jest that does not seem to capture the error message
      const matchErrorName = /^(?:Unexpected)?Error:?\n/.exec(this.stack);
      if (matchErrorName) {
        this.stack = this.message + this.stack.substr(matchErrorName[0].length);
      }
    }

    if (this.stack && !this.useFullStackTrace) {
      const lines = this.stack.split(/\n/);
      const stackStart = findStackStart(lines);

      const newStack = lines.filter(
        (line, i) =>
          i < stackStart ||
          (!/node_modules[/\\]unexpected(?:-[^/\\]+)?[/\\]/.test(line) &&
            !/executeExpect.*node_modules[/\\]unexpected[/\\]/.test(
              lines[i + 1]
            ))
      );

      if (newStack.length !== lines.length) {
        const indentation = /^(\s*)/.exec(lines[lines.length - 1])[1];

        if (outputFormat === 'html') {
          newStack.push(
            `${indentation}set the query parameter full-trace=true to see the full stack trace`
          );
        } else {
          newStack.push(
            `${indentation}set UNEXPECTED_FULL_TRACE=true to see the full stack trace`
          );
        }
      }

      this.stack = newStack.join('\n');
    }

    this._hasSerializedErrorMessage = true;
  }
};

UnexpectedError.prototype.clone = function() {
  const that = this;
  const newError = new UnexpectedError(this.expect);
  Object.keys(that).forEach(key => {
    if (!errorMethodBlacklist[key]) {
      newError[key] = that[key];
    }
  });
  return newError;
};

UnexpectedError.prototype.getLabel = function() {
  let currentError = this;
  while (currentError && !currentError.label) {
    currentError = currentError.parent;
  }
  return (currentError && currentError.label) || null;
};

UnexpectedError.prototype.getParents = function() {
  const result = [];
  let parent = this.parent;
  while (parent) {
    result.push(parent);
    parent = parent.parent;
  }
  return result;
};

UnexpectedError.prototype.getAllErrors = function() {
  const result = this.getParents();
  result.unshift(this);
  return result;
};

if (Object.__defineGetter__) {
  Object.defineProperty(UnexpectedError.prototype, 'htmlMessage', {
    enumerable: true,
    get() {
      return this.getErrorMessage({ format: 'html' }).toString();
    }
  });
}

module.exports = UnexpectedError;
