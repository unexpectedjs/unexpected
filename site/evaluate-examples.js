var lightExpect = require('../lib/').clone();
lightExpect.installPlugin(require('magicpen-prism'));
lightExpect.installPlugin(require('./magicpen-github-syntax-theme'));

var darkExpect = require('../lib/').clone();
darkExpect.installPlugin(require('magicpen-prism'));
darkExpect.installPlugin(require('./magicpen-dark-syntax-theme'));

module.exports = function evaluateExamples(files, metalsmith, next) {
    function evaluateExample(file) {
        var contents = files[file].contents.toString().replace(/<!-- ?evaluate ?-->[\s\S]*?<!-- ?\/evaluate ?-->/gm, function (evaluationBlock) {
            return evaluationBlock.replace(/([\s\S]*)```javascript\n([\s\S]*?)\n```([\s\S]*)(?:```[\s\S]*?```)([\s\S]*)/gm, function ($0, before, example, middle, after) {
                var exampleExpect = (files[file].theme === 'dark' ? darkExpect : lightExpect).clone();
                try {
                    var scopedExample =
                        '(function () {\n' +
                        'var expect = exampleExpect;\n' +
                        example + '\n'+
                        ' }())';

                    eval(scopedExample);
                    return $0;
                } catch (e) {
                    var errorMessage = e._isUnexpected ?
                         e.output :
                         exampleExpect.output.clone().error(e.message);

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
    }

    // Find assertions files and file names.
    Object.keys(files).filter(function (file) {
        return /index.md/.test(file) ||
            /^assertions\//.test(file);
    }).forEach(function (file) {
        evaluateExample(file);
    });

    next();
};
