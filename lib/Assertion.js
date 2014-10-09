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
    var expect = this.expect;
    var output = expect.output.clone();

    var preamble = 'expected';

    var subjectOutput = expect.inspect(this.subject);

    var argsOutput = output.clone();
    if (this.args.length > 0) {
        this.args.forEach(function (arg, index) {
            if (0 < index) {
                argsOutput.text(', ');
            }
            argsOutput.append(expect.inspect(arg));
        }, this);
    }

    var subjectSize = subjectOutput.size();
    var argsSize = argsOutput.size();
    var width = preamble.length + subjectSize.width + argsSize.width + this.testDescription.length;
    var height = Math.max(subjectSize.height, argsSize.height);

    output.error(preamble);

    if (subjectSize.height > 1) {
        output.nl();
    } else {
        output.sp();
    }

    output.append(subjectOutput);

    if (subjectSize.height > 1 || (height === 1 && width > 120)) {
        output.nl();
    } else {
        output.sp();
    }

    output.error(this.testDescription);

    if (argsSize.height > 1) {
        output.nl();
    } else if (argsSize.width > 0) {
        output.sp();
    }

    output.append(argsOutput);

    return output;
};

Assertion.prototype.throwStandardError = function () {
    var err = new Error();
    err.output = this.standardErrorMessage();
    err._isUnexpected = true;
    throw err;
};

module.exports = Assertion;
