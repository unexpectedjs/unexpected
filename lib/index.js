module.exports = require('./Unexpected').create()
    .use(require('./styles'))
    .use(require('./types'))
    .use(require('./assertions'));

// Add an inspect method to all the promises we return that will make the REPL, console.log, and util.inspect render it nicely in node.js:
require('unexpected-bluebird').prototype.inspect = function () {
    return module.exports.createOutput(require('magicpen').defaultFormat).appendInspected(this).toString();
};
