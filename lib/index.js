/*global __filename*/
var testFrameworkPatch = require('./testFrameworkPatch');
if (testFrameworkPatch.applyPatch() && typeof require === 'function' && require.cache) {
    // Make sure that the 'it' global gets patched in every context where Unexpected is required,
    // but prevent rereading index.js from disc each time:
    Object.defineProperty(require.cache, __filename, {
        get: function () {
            testFrameworkPatch.applyPatch();
            return module;
        }
    });
}

module.exports = require('./Unexpected').create()
    .use(require('./styles'))
    .use(require('./types'))
    .use(require('./assertions'));

// Add an inspect method to all the promises we return that will make the REPL, console.log, and util.inspect render it nicely in node.js:
require('bluebird').prototype.inspect = function () {
    return module.exports.createOutput(require('magicpen').defaultFormat).appendInspected(this).toString();
};
