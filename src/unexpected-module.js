(function () {
    var global = this;
    var expect = global.unexpected.expect;

    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS/Node.js
        module.exports = expect;
    } else if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(function () {
            return expect;
        });
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        global.weknowhow = global.weknowhow || {};
        global.weknowhow.expect = expect;
    }
}());
