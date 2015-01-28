var vm = require('vm');

var lightExpect = require('../lib/').clone();
lightExpect.installPlugin(require('magicpen-prism'));
lightExpect.installPlugin(require('./magicpen-github-syntax-theme'));

var darkExpect = require('../lib/').clone();
darkExpect.installPlugin(require('magicpen-prism'));
darkExpect.installPlugin(require('./magicpen-dark-syntax-theme'));

module.exports = function evaluateExamples(files, metalsmith, next) {
    function evaluateExample(file) {
        var exampleExpect = (files[file].theme === 'dark' ? darkExpect : lightExpect).clone();
        var context = vm.createContext({
            expect: exampleExpect
        });

        var contents = files[file].contents.toString().replace(/<!-- ?evaluate ?-->[\s\S]*?<!-- ?\/evaluate ?-->/gm, function (evaluationBlock) {
            return evaluationBlock.replace(/([\s\S]*)```javascript\n([\s\S]*?)\n```([^`]*)(?:```[\s\S]*?```)?([\s\S]*)/gm, function ($0, before, example, middle, after) {
                try {
                    vm.runInContext(example, context);
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
        return /^\w+.md/.test(file) ||
            /^assertions\//.test(file);
    }).forEach(function (file) {
        evaluateExample(file);
    });

    next();
};
