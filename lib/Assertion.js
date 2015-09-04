var createStandardErrorMessage = require('./createStandardErrorMessage');

function Assertion(expect, subject, testDescription, flags, alternations, args) {
    this.expect = expect;
    this.subject = subject;
    this.testDescription = testDescription;
    this.flags = flags;
    this.alternations = alternations;
    this.args = args;
    this.subjectOutput = function (output) {
        output.appendInspected(subject);
    };
    this.argsOutput = this.args.map(function (arg) {
        return function (output) {
            output.appendInspected(arg);
        };
    });
    this.errorMode = 'default';
}

Assertion.prototype.standardErrorMessage = function (output, options) {
    options = typeof options === 'object' ? options : {};

    if ('omitSubject' in options) {
        options.subject = this.subject;
    }

    if (options && options.compact) {
        var expect = this.expect;
        var subject = this.subject;
        options.compactSubject = function (output) {
            var subjectType = expect.findTypeOf(subject);
            output.jsFunctionName(subjectType.name);
        };
    }

    return createStandardErrorMessage(output, this.expect, this.subjectOutput, this.testDescription, this.argsOutput, options);
};

Assertion.prototype.shift = function (subject, assertionIndex) {
    var expect = this.expect;
    if (arguments.length === 3) {
        // The 3-argument syntax for Assertion.prototype.shift is deprecated, please omit the first (expect) arg
        subject = arguments[1];
        assertionIndex = arguments[2];
    }

    var args = this.args.slice(0, assertionIndex);
    var rest = this.args.slice(assertionIndex);
    var nextArgumentType = expect.findTypeOf(rest[0]);
    this.argsOutput = function (output) {
        args.forEach(function (arg, index) {
            if (0 < index) {
                output.text(', ');
            }
            output.appendInspected(arg);
        });

        if (args.length > 0) {
            output.sp();
        }
        if (nextArgumentType.is('string')) {
            output.error(rest[0]);
        } else {
            output.appendInspected(rest[0]);
        }
        if (rest.length > 1) {
            output.sp();
        }
        rest.slice(1).forEach(function (arg, index) {
            if (0 < index) {
                output.text(', ');
            }
            output.appendInspected(arg);
        });
    };
    if (nextArgumentType.is('expect.it')) {
        return rest[0](subject);
    } else if (nextArgumentType.is('string')) {
        return expect.apply(expect, [subject].concat(rest));
    } else {
        throw new Error('The "' + this.testDescription + '" assertion requires parameter #' + (assertionIndex + 2) + ' to be an expect.it function or a string specifying an assertion to delegate to');
    }
};

module.exports = Assertion;
