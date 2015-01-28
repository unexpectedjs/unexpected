var magicpen = require('magicpen');

var ligthPen = magicpen()
    .installPlugin(require('magicpen-prism'))
    .installPlugin(require('./magicpen-github-syntax-theme'));

var darkPen = magicpen()
    .installPlugin(require('magicpen-prism'))
    .installPlugin(require('./magicpen-dark-syntax-theme'));

module.exports = function syntaxHighlight(files, metalsmith, next) {
    function syntaxHighlightFile(file) {
        var pen = files[file].theme === 'dark' ? darkPen : ligthPen;
        var contents = files[file].contents.toString().replace(/```([a-z]+)\n([\s\S]*?)\n```/gm, function ($0, lang, code) {
            return pen.clone().code(code, lang).toString('html').replace(/style=".*?"/, 'class="code"');
        });
        files[file].contents = new Buffer(contents);
    }

    // Find assertions files and file names.
    Object.keys(files).filter(function (file) {
        return /^\w+.md/.test(file) ||
            /^assertions\//.test(file);
    }).forEach(syntaxHighlightFile);

    next();
};
