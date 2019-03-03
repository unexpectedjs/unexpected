const expect = require('./createTopLevelExpect')()
  .use(require('./styles'))
  .use(require('./types'))
  .use(require('./assertions'))
  .freeze();

// Add an inspect method to all the promises we return that will make the REPL, console.log, and util.inspect render it nicely in node.js:
require('unexpected-bluebird').prototype[
  require('./nodeJsCustomInspect')
] = function() {
  return expect
    .createOutput(require('magicpen').defaultFormat)
    .appendInspected(this)
    .toString();
};

module.exports = expect;
