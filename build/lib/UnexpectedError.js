var utils = require('./utils');
var defaultDepth = require('./defaultDepth');
var useFullStackTrace = require('./useFullStackTrace');
var makeDiffResultBackwardsCompatible = require('./makeDiffResultBackwardsCompatible');

var errorMethodBlacklist = ['message', 'line', 'sourceId', 'sourceURL', 'stack', 'stackArray'].reduce(function (result, prop) {
    result[prop] = true;
    return result;
}, {});

function UnexpectedError(expect, parent) {
    this.errorMode = expect && expect.errorMode || 'default';
    var base = Error.call(this, '');

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, UnexpectedError);
    } else {
        // Throw the error to make sure it has its stack serialized:
        try {
            throw base;
        } catch (err) {}
        this.stack = base.stack;
    }

    this.expect = expect;
    this.parent = parent || null;
    this.name = 'UnexpectedError';
}

UnexpectedError.prototype = Object.create(Error.prototype);

UnexpectedError.prototype.useFullStackTrace = useFullStackTrace;

var missingOutputMessage = 'You must either provide a format or a magicpen instance';
UnexpectedError.prototype.outputFromOptions = function (options) {
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
UnexpectedError.prototype.buildDiff = function (options) {
    var output = this.outputFromOptions(options);
    var expect = this.expect;
    return this.createDiff && makeDiffResultBackwardsCompatible(this.createDiff(output, function (actual, expected) {
        return expect.diff(actual, expected, output.clone());
    }, function (v, depth) {
        return output.clone().appendInspected(v, (depth || defaultDepth) - 1);
    }, function (actual, expected) {
        return expect.equal(actual, expected);
    }));
};

UnexpectedError.prototype.getDefaultErrorMessage = function (options) {
    var output = this.outputFromOptions(options);
    if (this.expect.testDescription) {
        output.append(this.expect.standardErrorMessage(output.clone(), options));
    } else if (typeof this.output === 'function') {
        this.output.call(output, output);
    }

    var errorWithDiff = this;
    while (!errorWithDiff.createDiff && errorWithDiff.parent) {
        errorWithDiff = errorWithDiff.parent;
    }

    if (errorWithDiff && errorWithDiff.createDiff) {
        var comparison = errorWithDiff.buildDiff(options);
        if (comparison) {
            output.nl(2).append(comparison);
        }
    }

    return output;
};

UnexpectedError.prototype.getNestedErrorMessage = function (options) {
    var output = this.outputFromOptions(options);
    if (this.expect.testDescription) {
        output.append(this.expect.standardErrorMessage(output.clone(), options));
    } else if (typeof this.output === 'function') {
        this.output.call(output, output);
    }

    var parent = this.parent;
    while (parent.getErrorMode() === 'bubble') {
        parent = parent.parent;
    }

    if (typeof options === 'string') {
        options = { format: options };
    } else if (options && options.isMagicPen) {
        options = { output: options };
    }

    output.nl().indentLines().i().block(parent.getErrorMessage(utils.extend({}, options || {}, {
        compact: this.expect.subject === parent.expect.subject
    })));
    return output;
};

UnexpectedError.prototype.getDefaultOrNestedMessage = function (options) {
    if (this.hasDiff()) {
        return this.getDefaultErrorMessage(options);
    } else {
        return this.getNestedErrorMessage(options);
    }
};

UnexpectedError.prototype.hasDiff = function () {
    return !!this.getDiffMethod();
};

UnexpectedError.prototype.getDiffMethod = function () {
    var errorWithDiff = this;
    while (!errorWithDiff.createDiff && errorWithDiff.parent) {
        errorWithDiff = errorWithDiff.parent;
    }

    return errorWithDiff && errorWithDiff.createDiff || null;
};

UnexpectedError.prototype.getDiff = function (options) {
    var errorWithDiff = this;
    while (!errorWithDiff.createDiff && errorWithDiff.parent) {
        errorWithDiff = errorWithDiff.parent;
    }

    return errorWithDiff && errorWithDiff.buildDiff(options);
};

UnexpectedError.prototype.getDiffMessage = function (options) {
    var output = this.outputFromOptions(options);
    var comparison = this.getDiff(options);
    if (comparison) {
        output.append(comparison);
    } else if (this.expect.testDescription) {
        output.append(this.expect.standardErrorMessage(output.clone(), options));
    } else if (typeof this.output === 'function') {
        this.output.call(output, output);
    }
    return output;
};

UnexpectedError.prototype.getErrorMode = function () {
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

UnexpectedError.prototype.getErrorMessage = function (options) {
    // Search for any parent error that has an error mode of 'bubbleThrough' through on the
    // error these should be bubbled to the top
    var errorWithBubbleThrough = this.parent;
    while (errorWithBubbleThrough && errorWithBubbleThrough.getErrorMode() !== 'bubbleThrough') {
        errorWithBubbleThrough = errorWithBubbleThrough.parent;
    }
    if (errorWithBubbleThrough) {
        return errorWithBubbleThrough.getErrorMessage(options);
    }

    var errorMode = this.getErrorMode();
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
            throw new Error("Unknown error mode: '" + errorMode + "'");
    }
};

function findStackStart(lines) {
    for (var i = lines.length - 1; 0 <= i; i -= 1) {
        if (lines[i] === '') {
            return i + 1;
        }
    }

    return -1;
}

UnexpectedError.prototype.serializeMessage = function (outputFormat) {
    if (!this._hasSerializedErrorMessage) {
        var htmlFormat = outputFormat === 'html';
        if (htmlFormat) {
            if (!('htmlMessage' in this)) {
                this.htmlMessage = this.getErrorMessage({ format: 'html' }).toString();
            }
        }

        this.message = '\n' + this.getErrorMessage({
            format: htmlFormat ? 'text' : outputFormat
        }).toString() + '\n';

        if (this.originalError && this.originalError instanceof Error && typeof this.originalError.stack === 'string') {
            // The stack of the original error looks like this:
            //   <constructor name>: <error message>\n<actual stack trace>
            // Try to get hold of <actual stack trace> and append it
            // to the error message of this error:
            var index = this.originalError.stack.indexOf(this.originalError.message);
            if (index === -1) {
                // Phantom.js doesn't include the error message in the stack property
                this.stack = this.message + '\n' + this.originalError.stack;
            } else {
                this.stack = this.message + this.originalError.stack.substr(index + this.originalError.message.length);
            }
        } else if (/^(Unexpected)?Error:?\n/.test(this.stack)) {
            // Fix for Jest that does not seem to capture the error message
            this.stack = this.stack.replace(/^(Unexpected)?Error:?\n/, this.message);
        }

        if (this.stack && !this.useFullStackTrace) {
            var newStack = [];
            var removedFrames = false;
            var lines = this.stack.split(/\n/);

            var stackStart = findStackStart(lines);

            lines.forEach(function (line, i) {
                if (stackStart <= i && /node_modules\/unexpected(?:-[^\/]+)?\//.test(line)) {
                    removedFrames = true;
                } else {
                    newStack.push(line);
                }
            });

            if (removedFrames) {
                var indentation = /^(\s*)/.exec(lines[lines.length - 1])[1];

                if (outputFormat === 'html') {
                    newStack.push(indentation + 'set the query parameter full-trace=true to see the full stack trace');
                } else {
                    newStack.push(indentation + 'set UNEXPECTED_FULL_TRACE=true to see the full stack trace');
                }
            }

            this.stack = newStack.join('\n');
        }

        this._hasSerializedErrorMessage = true;
    }
};

UnexpectedError.prototype.clone = function () {
    var that = this;
    var newError = new UnexpectedError(this.expect);
    Object.keys(that).forEach(function (key) {
        if (!errorMethodBlacklist[key]) {
            newError[key] = that[key];
        }
    });
    return newError;
};

UnexpectedError.prototype.getLabel = function () {
    var currentError = this;
    while (currentError && !currentError.label) {
        currentError = currentError.parent;
    }
    return currentError && currentError.label || null;
};

UnexpectedError.prototype.getParents = function () {
    var result = [];
    var parent = this.parent;
    while (parent) {
        result.push(parent);
        parent = parent.parent;
    }
    return result;
};

UnexpectedError.prototype.getAllErrors = function () {
    var result = this.getParents();
    result.unshift(this);
    return result;
};

if (Object.__defineGetter__) {
    Object.defineProperty(UnexpectedError.prototype, 'htmlMessage', {
        enumerable: true,
        get: function get() {
            return this.getErrorMessage({ format: 'html' }).toString();
        }
    });
}

module.exports = UnexpectedError;