var expect = require('../lib/').clone();

expect.output.addStyle('strings', function (content) {
    this.text(content, '#df5000');
}, true);
expect.output.addStyle('key', function (content) {
    this.text(content, 'black');
}, true);
expect.output.addStyle('number', function (content) {
    this.text(content, '#0086b3');
}, true);
expect.output.addStyle('comment', function (content) {
    this.gray(content, '#969896');
}, true);
expect.output.addStyle('regexp', function (content) {
    this.text(content, '#df5000');
}, true);

module.exports = function evaluateExamples(files, metalsmith, next) {
    // Find assertions files and file names.
    Object.keys(files).filter(function (file) {
        return /^assertions\//.test(file) ? file : false;
    }).forEach(function (file) {
        var contents = files[file].contents.toString().replace(/<!-- ?evaluate ?-->[\s\S]*?<!-- ?\/evaluate ?-->/gm, function (evaluationBlock) {
            return evaluationBlock.replace(/([\s\S]*)```javascript\n([\s\S]*?)\n```([\s\S]*)(?:```[\s\S]*?```)([\s\S]*)/gm, function ($0, before, example, middle, after) {
                try {
                    eval(example);
                    return $0;
                } catch (e) {
                    return before +
                        '```javascript\n' +
                        example +
                        '\n```' +
                        middle +
                        e.output.toString('html').replace(/style=".*?"/, 'class="output"') +
                        after;
                }
            });
        });
        files[file].contents = new Buffer(contents);
    });

    next();
};
