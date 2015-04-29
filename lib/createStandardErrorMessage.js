module.exports = function createStandardErrorMessage(expect, subject, testDescription, args) {
    var output = expect.output.clone();

    var preamble = 'expected';

    var subjectOutput = subject && subject.isMagicPen ? subject : expect.inspect(subject);

    var argsOutput = output.clone();
    if (args.length > 0) {
        var previousArgWasMagicPen = false;
        args.forEach(function (arg, index) {
            var isMagicPen = arg && arg.isMagicPen;
            if (0 < index) {
                if (!isMagicPen && !previousArgWasMagicPen) {
                    argsOutput.text(',');
                }
                argsOutput.text(' ');
            }
            if (isMagicPen) {
                argsOutput.append(arg);
            } else {
                argsOutput.append(expect.inspect(arg));
            }
            previousArgWasMagicPen = isMagicPen;
        });
    }

    var subjectSize = subjectOutput.size();
    var argsSize = argsOutput.size();
    var width = preamble.length + subjectSize.width + argsSize.width + testDescription.length;
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

    output.error(testDescription);

    if (argsSize.height > 1) {
        output.nl();
    } else if (argsSize.width > 0) {
        output.sp();
    }

    output.append(argsOutput);

    return output;
};
