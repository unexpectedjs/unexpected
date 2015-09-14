var utils = require('./utils');
var defaultDepth = require('./defaultDepth');

var errorMethodBlacklist = ['message', 'line', 'sourceId', 'sourceURL', 'stack', 'stackArray'].reduce(function (result, prop) {
    result[prop] = true;
    return result;
}, {});

function UnexpectedError(expect, parent) {
    this.errorMode = (expect && expect.errorMode) || 'default';
    var base = Error.call(this, '');

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, UnexpectedError);
    } else {
        // Throw the error to make sure it has its stack serialized:
        try { throw base; } catch (err) {}
        this.stack = base.stack;
    }

    this.expect = expect;
    this.parent = parent || null;
    this.name = 'UnexpectedError';
}

UnexpectedError.prototype = Object.create(Error.prototype);

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
    return this.createDiff && this.createDiff(output, function (actual, expected) {
        return expect.diff(actual, expected, output.clone());
    }, function (v, depth) {
        return output.clone().appendInspected(v, (depth || defaultDepth) - 1);
    }, function (actual, expected) {
        return expect.equal(actual, expected);
    });
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
            output.nl(2).append(comparison.diff);
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

    output.nl()
        .indentLines()
        .i().block(parent.getErrorMessage(utils.extend({}, options || {}, {
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

    if (errorWithDiff) {
        var diffResult = errorWithDiff.buildDiff(options);
        if (diffResult && diffResult.diff) {
            return diffResult;
        } else {
            return null;
        }
    } else {
        return null;
    }
};

UnexpectedError.prototype.getDiffMessage = function (options) {
    var output = this.outputFromOptions(options);
    var comparison = this.getDiff(options);
    if (comparison) {
        output.append(comparison.diff);
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
    case 'nested': return this.getNestedErrorMessage(options);
    case 'default': return this.getDefaultErrorMessage(options);
    case 'bubbleThrough': return this.getDefaultErrorMessage(options);
    case 'bubble': return this.parent.getErrorMessage(options);
    case 'diff': return this.getDiffMessage(options);
    case 'defaultOrNested': return this.getDefaultOrNestedMessage(options);
    default: throw new Error("Unknown error mode: '" + errorMode + "'");
    }
};

UnexpectedError.prototype.serializeMessage = function (outputFormat) {
    if (!this._hasSerializedErrorMessage) {
        if (outputFormat === 'html') {
            outputFormat = 'text';
            if (!('htmlMessage' in this)) {
                this.htmlMessage = this.getErrorMessage({format: 'html'}).toString();
            }
        }
        this.message = '\n' + this.getErrorMessage({format: outputFormat}).toString();

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
    return (currentError && currentError.label) || null;
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
        get: function () {
            return this.getErrorMessage({ format: 'html' }).toString();
        }
    });
}

module.exports = UnexpectedError;
