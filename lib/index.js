var Unexpected = require('./Unexpected');

module.exports = Unexpected.create()
    .installPlugin(require('./types'))
    .installPlugin(require('./assertions'));
