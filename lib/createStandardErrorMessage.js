var AssertionString = require('./AssertionString');

module.exports = function createStandardErrorMessage(output, subject, testDescription, args, options) {
    options = options || {};
    var preamble = 'expected';

    var subjectOutput = output.clone();
    if (subject) {
        subject.call(subjectOutput, subjectOutput);
    }

    var argsOutput = output.clone();
    if (typeof args === 'function') {
        args.call(argsOutput, argsOutput);
    } else {
        if (args.length > 0) {
            var previousWasAssertion = false;
            args.forEach(function (arg, index) {
                var isAssertion = arg && typeof arg === 'object' && arg instanceof AssertionString;
                if (0 < index) {
                    if (!isAssertion && !previousWasAssertion) {
                        argsOutput.text(',');
                    }
                    argsOutput.sp();
                }
                if (isAssertion) {
                    argsOutput.error(arg.text);
                } else {
                    arg.call(argsOutput, argsOutput);
                }
                previousWasAssertion = isAssertion;
            });
        }
    }

    var subjectSize = subjectOutput.size();
    var argsSize = argsOutput.size();
    var width = preamble.length + subjectSize.width + argsSize.width + testDescription.length;
    var height = Math.max(subjectSize.height, argsSize.height);

    if ('omitSubject' in output && output.omitSubject === options.subject) {
        var matchTestDescription = /^(not )?to (.*)/.exec(testDescription);
        if (matchTestDescription) {
            output.error('should ');
            if (matchTestDescription[1]) {
                output.error('not ');
            }
            testDescription = matchTestDescription[2];
        } else {
            testDescription = 'expected: ' + testDescription;
        }
    } else if (options.compact && options.compactSubject && (subjectSize.height > 1 || subjectSize.width > (options.compactWidth || 35))) {
        output.error('expected').sp();
        options.compactSubject.call(output, output);
        output.sp();
    } else {
        output.error(preamble);
        if (subjectSize.height > 1) {
            output.nl();
        } else {
            output.sp();
        }
        output.append(subjectOutput);
        if (subjectSize.height > 1 || (height === 1 && width > output.preferredWidth)) {
            output.nl();
        } else {
            output.sp();
        }
    }

    output.error(testDescription);

    if (argsSize.height > 1) {
        output.nl();
    } else if (argsSize.width > 0) {
        output.sp();
    }

    output.append(argsOutput);

    return output;
};
