var magicpen = require('magicpen');
var pen = magicpen().clone()
    .installPlugin(require('magicpen-prism'));

var colorByTokenType = {
    // Mimic github theme
    comment: '#969896',
    prolog: '#969896',
    doctype: '#969896',
    cdata: '#708090',

    punctuation: '#000000',

    property: '#0086b3',
    tag: '#63a35c',
    'boolean': '#0086b3',
    number: '#0086b3',
    constant: '#0086b3',
    symbol: '#0086b3',
    deleted: '#0086b3',

    selector: '#df5000',
    'attr-name': '#795da3',
    string: '#df5000',
    'char': '#df5000',
    builtin: '#df5000',
    inserted: '#df5000',

    operator: '#a71d5d',
    entity: '#df5000',
    url: '#df5000',
    'css:string': '#df5000',
    variable: '#a67f59',

    atrule: '#df5000',
    'attr-value': '#df5000',
    keyword: '#0086b3',

    'function': '#000000',

    regex: '#df5000',
    important: '#0086b3 bold'
};

Object.keys(colorByTokenType).forEach(function (tokenType) {
    pen.addStyle('prism:' + tokenType, function (content) {
        this.text(content, colorByTokenType[tokenType]);
    }, true);
});

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
