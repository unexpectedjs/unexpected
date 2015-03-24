var createStandardErrorMessage = require('./createStandardErrorMessage');

function Assertion(expect, subject, testDescription, flags, alternations, args) {
    this.expect = expect;
    this.subject = subject;
    this.testDescription = testDescription;
    this.flags = flags;
    this.alternations = alternations;
    this.args = args;
    this.errorMode = 'default';
}

Assertion.prototype.standardErrorMessage = function () {
    return createStandardErrorMessage(this.expect, this.subject, this.testDescription, this.args);
};

Assertion.prototype.shift = function (subject, assertionIndex) {
    if (arguments.length === 3) {
        // The 3-argument syntax for Assertion.prototype.shift is deprecated, please omit the first (expect) arg
        subject = arguments[1];
        assertionIndex = arguments[2];
    }
    var rest = this.args.slice(assertionIndex);
    this.args[assertionIndex] = this.expect.output.clone().error(this.args[assertionIndex]);
    if (typeof rest[0] === 'function') {
        rest[0](subject);
    } else {
        this.expect.apply(this.expect, [subject].concat(rest));
    }
};

Assertion.prototype.throwStandardError = function () {
    var err = new Error();
    err.output = this.standardErrorMessage();
    err._isUnexpected = true;
    throw err;
};

module.exports = Assertion;
