/*global console, __dirname, weknowhow*/
var Path = require('path'),
    fs = require('fs'),
    vm = require('vm'),
    isCoverage = !!process.env.COVERAGE,
    context = !isCoverage && vm.createContext({
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
    'unexpected-inspect.js',
    'unexpected-core.js',
    'unexpected-types.js',
    'unexpected-assertions.js',
    'unexpected-module.js'
].forEach(function (fileName) {
    try {
        var src = fs.readFileSync(Path.resolve(__dirname, fileName), 'utf-8');
        if (isCoverage) {
            vm.runInThisContext(src, fileName);
        } else {
            vm.runInContext(src, context, fileName);
        }
    } catch (err) {
        console.error('Error loading ' + fileName + ': ' + err.stack);
    }
});

module.exports = isCoverage ? weknowhow.expect : context.weknowhow.expect;
