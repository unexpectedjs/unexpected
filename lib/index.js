var Unexpected = require('./Unexpected');

var unexpected = Unexpected.create();
var styles = require('./styles');
var types = require('./types');
var assertions = require('./assertions');

styles(unexpected);
types(unexpected);
assertions(unexpected);

module.exports = unexpected;
