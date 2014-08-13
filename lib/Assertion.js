var shim = require('./shim');
var bind = shim.bind;
var forEach = shim.forEach;

function Assertion(expect, subject, testDescription, flags, args) {
    this.expect = expect;
    this.obj = subject; // deprecated
    this.equal = bind(expect.equal, expect); // deprecated
    this.eql = this.equal; // deprecated
    this.inspect = bind(expect.inspect, expect); // deprecated
    this.subject = subject;
    this.testDescription = testDescription;
    this.flags = flags;
    this.args = args;
    this.errorMode = 'default';
}

Assertion.prototype.standardErrorMessage = function () {
    var expect = this.expect;
    var output = expect.output.clone();

    output.error('expected ')
        .append(expect.inspect(this.subject))
        .sp().error(this.testDescription);

    if (this.args.length > 0) {
        output.sp();
        forEach(this.args, function (arg, index) {
            output.append(expect.inspect(arg));
            if (index < this.args.length - 1) {
                output.text(', ');
            }
        }, this);
    }

    return output;
};

Assertion.prototype.throwStandardError = function () {
    var err = new Error();
    err.output = this.standardErrorMessage();
    err._isUnexpected = true;
    throw err;
};

Assertion.prototype.assert = function (condition) {
    var not = !!this.flags.not;
    condition = !!condition;
    if (condition === not) {
        this.throwStandardError();
    }
};

module.exports = Assertion;
