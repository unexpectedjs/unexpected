var magicpen = require('magicpen');
var pen = magicpen().clone()
    .installPlugin(require('magicpen-prism'));

module.exports = function syntaxHighlight(files, metalsmith, next) {
    // Find assertions files and file names.
    Object.keys(files).filter(function (file) {
        return /^assertions\//.test(file) ? file : false;
    }).forEach(function (file) {
        var contents = files[file].contents.toString().replace(/```([a-z]+)\n([\s\S]*?)\n```/gm, function ($0, lang, code) {
            return pen.clone().code(code, lang).toString('html').replace(/style=".*?"/, 'class="code"');
        });
        files[file].contents = new Buffer(contents);
    });
    next();
};
