var Unexpected = require('./Unexpected');

var unexpected = Unexpected.create();
var styles = require('./styles');
var types = require('./types');
var assertions = require('./assertions');

styles(unexpected);
types(unexpected);
assertions(unexpected);

// Add an inspect method to all the promises we return that will make the REPL, console.log, and util.inspect render it nicely in node.js:
require('bluebird').prototype.inspect = function () {
    return unexpected.inspect(this).toString(require('magicpen').defaultFormat);
};

module.exports = unexpected;
