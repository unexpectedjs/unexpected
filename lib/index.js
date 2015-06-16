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
    var output = unexpected.output.clone()
        .jsFunctionName('Promise')
        .sp();
    if (this.isPending()) {
        output.yellow('(pending)');
    } else if (this.isFulfilled()) {
        output.green('(fulfilled)');
        var value = this.value();
        if (typeof value !== 'undefined') {
            output.sp().text('=>').sp().append(unexpected.inspect(value));
        }
    } else if (this.isRejected()) {
        output.red('(rejected)').sp().text('=>').sp().append(unexpected.inspect(this.reason()));
    }
    return output.toString(require('magicpen').defaultFormat);
};

module.exports = unexpected;
