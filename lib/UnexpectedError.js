var utils = require('./utils');

var errorMethodBlacklist = ['message', 'line', 'sourceId', 'sourceURL', 'stack', 'stackArray'].reduce(function (result, prop) {
    result[prop] = true;
    return result;
}, {});

function UnexpectedError(expect, assertion, parent) {
    var base = Error.call(this, '');

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, UnexpectedError);
    } else {
        // Throw the error to make sure it has its stack serialized:
        try { throw base; } catch (err) {}
        this.stack = base.stack;
    }

    this.expect = expect;
    this.assertion = assertion || null;
    this.parent = parent || null;
    this.name = 'UnexpectedError';
}

UnexpectedError.prototype = Object.create(Error.prototype);

UnexpectedError.prototype._isUnexpected = true;
UnexpectedError.prototype.isUnexpected = true;
UnexpectedError.prototype.buildDiff = function () {
    var expect = this.expect;
    return this.createDiff && this.createDiff(expect.output.clone(), function (actual, expected) {
        return expect.diff(actual, expected);
    }, function (v, depth) {
        return expect.inspect(v, depth || Infinity);
    }, function (actual, expected) {
        return expect.equal(actual, expected);
    });
};

UnexpectedError.prototype.getDefaultErrorMessage = function (options) {
    var message = this.expect.output.clone();
    if (this.assertion) {
        message.append(this.assertion.standardErrorMessage(options));
    } else {
        message.append(this.output);
    }
    var errorWithDiff = this;
    while (!errorWithDiff.createDiff && errorWithDiff.parent) {
        errorWithDiff = errorWithDiff.parent;
    }

    if (errorWithDiff && errorWithDiff.createDiff) {
        var comparison = errorWithDiff.buildDiff();
        if (comparison) {
            message.nl(2).append(comparison.diff);
        }
    }

    return message;
};

UnexpectedError.prototype.getNestedErrorMessage = function (options) {
    var message = this.expect.output.clone();
    if (this.assertion) {
        message.append(this.assertion.standardErrorMessage(options));
    } else {
        message.append(this.output);
    }

    var parent = this.parent;
    while (parent.errorMode === 'bubble') {
        parent = parent.parent;
    }

    message.nl()
        .indentLines()
        .i().block(parent.getErrorMessage(utils.extend({}, options || {}, {
            compact: this.assertion && parent.assertion &&
                this.assertion.subject === parent.assertion.subject
        })));
    return message;
};

UnexpectedError.prototype.getDiffMethod = function () {
    var errorWithDiff = this;
    while (!errorWithDiff.createDiff && errorWithDiff.parent) {
        errorWithDiff = errorWithDiff.parent;
    }

    return errorWithDiff && errorWithDiff.createDiff || null;
};

UnexpectedError.prototype.getDiff = function () {
    var errorWithDiff = this;
    while (!errorWithDiff.createDiff && errorWithDiff.parent) {
        errorWithDiff = errorWithDiff.parent;
    }

    if (errorWithDiff) {
        var diffResult = errorWithDiff.buildDiff();
        if (diffResult && diffResult.diff) {
            return diffResult;
        } else {
            return null;
        }
    } else {
        return null;
    }
};

UnexpectedError.prototype.getDiffMessage = function () {
    var message = this.expect.output.clone();
    var comparison = this.getDiff();
    if (comparison) {
        message.append(comparison.diff);
    } else if (this.assertion) {
        message.append(this.assertion.standardErrorMessage());
    } else {
        message.append(this.output);
    }
    return message;
};

UnexpectedError.prototype.getErrorMode = function () {
    var errorMode = this.errorMode ||
        (this.assertion && this.assertion.errorMode) ||
        'default';

    if (!this.parent && errorMode !== 'default') {
        return 'default';
    } else {
        return errorMode;
    }
};


UnexpectedError.prototype.getErrorMessage = function (options) {
    // Search for any parent error that has mode bubble on the error
    // these should be bubbled to the top
    var errorWithBubble = this.parent;
    while (errorWithBubble && errorWithBubble.errorMode !== 'bubble') {
        errorWithBubble = errorWithBubble.parent;
    }
    if (errorWithBubble) {
        return errorWithBubble.getErrorMessage();
    }

    var errorMode = this.getErrorMode();
    switch (errorMode) {
    case 'nested': return this.getNestedErrorMessage(options);
    case 'default': return this.getDefaultErrorMessage(options);
    case 'bubble': return this.parent.getErrorMessage(options);
    case 'diff': return this.getDiffMessage();
    default: throw new Error("Unknown error mode: '" + errorMode + "'");
    }
};

UnexpectedError.prototype.serializeMessage = function (outputFormat) {
    if (!this._hasSerializedErrorMessage) {
        var message = this.getErrorMessage();
        if (outputFormat === 'html') {
            outputFormat = 'text';
            this.htmlMessage = message.toString('html');
        }
        this.message = '\n' + message.toString(outputFormat);
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


module.exports = UnexpectedError;
