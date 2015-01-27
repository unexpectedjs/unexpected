var expect = require('../lib/').clone();

expect.installTheme('html', {
    strings: '#df5000',
    key: 'black',
    number: '#0086b3',
    comment: '#969896',
    regexp: '#df5000',
    keyword: '#0086b3'
});

expect.installPlugin(require('magicpen-prism'))
    .installPlugin(require('./magicpen-github-syntax-theme'));

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
                    var errorMessage = e._isUnexpected ?
                         e.output :
                         expect.output.clone().error(e.message);

                    return before +
                        '```javascript\n' +
                        example +
                        '\n```' +
                        middle +
                        errorMessage.toString('html').replace(/style=".*?"/, 'class="output"') +
                        after;
                }
            });
        });
        files[file].contents = new Buffer(contents);
    });

    next();
};
