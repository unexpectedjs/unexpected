var expect = require('../lib/');

module.exports = function buildDocumentationTests(files, metalsmith, next) {
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
