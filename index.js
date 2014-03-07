var Path = require('path'),
    fs = require('fs'),
    vm = require('vm'),
    context = vm.createContext({
        console: console,
        Buffer: Buffer,
        // Reuse the existing context's globals so instanceof checks work:
        Object: Object,
        Array: Array,
        Error: Error,
        RegExp: RegExp,
        Date: Date,
        String: String,
        Number: Number,
        Math: Math,
        Boolean: Boolean,
        Function: Function
    });

[
    'unexpected-namespace.js',
    'unexpected-es5-compatible.js',
    'unexpected-utils.js',
    'unexpected-equal.js',
    'unexpected-inspect.js',
    'unexpected-core.js',
    'unexpected-assertions.js',
    'unexpected-module.js'
].forEach(function (fileName) {
    try {
        vm.runInContext(fs.readFileSync(Path.resolve(__dirname, 'src', fileName), 'utf-8'), context, fileName);
    } catch (err) {
        console.error('Error loading ' + fileName + ': ' + err.stack);
    }
});

module.exports = context.weknowhow.expect;
