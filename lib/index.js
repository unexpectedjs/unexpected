var testFrameworkPatch = require('./testFrameworkPatch');

function applyTestFrameworkPatchWhenLoaded(mod) {
    Object.defineProperty(require.cache, mod.id, {
        get: function () {
            testFrameworkPatch.applyPatch();
            return mod;
        }
    });
}

if (testFrameworkPatch.applyPatch() && typeof require === 'function' && require.cache) {
    // Make sure that the 'it' global gets patched in every context where Unexpected is required,
    // but prevent rereading index.js and the chain of parent modules from disc each time:

    for (var mod = module ; mod ; mod = mod.parent) {
        applyTestFrameworkPatchWhenLoaded(mod);
    }
}

module.exports = require('./Unexpected').create()
    .use(require('./styles'))
    .use(require('./types'))
    .use(require('./assertions'));

// Add an inspect method to all the promises we return that will make the REPL, console.log, and util.inspect render it nicely in node.js:
require('bluebird').prototype.inspect = function () {
    return module.exports.createOutput(require('magicpen').defaultFormat).appendInspected(this).toString();
};
