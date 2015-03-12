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

Assertion.prototype.shift = function (expect, subject, assertionIndex) {
    var rest = this.args.slice(assertionIndex);
    this.args[assertionIndex] = expect.output.clone().error(this.args[assertionIndex]);
    if (typeof rest[0] === 'function') {
        rest[0](subject);
    } else {
        expect.apply(expect, [subject].concat(rest));
    }
};

Assertion.prototype.throwStandardError = function () {
    var err = new Error();
    err.output = this.standardErrorMessage();
    err._isUnexpected = true;
    throw err;
};

module.exports = Assertion;
