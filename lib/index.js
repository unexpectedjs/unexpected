var Unexpected = require('./Unexpected');

module.exports = Unexpected.create()
    .installPlugin(require('./styles'))
    .installPlugin(require('./types'))
    .installPlugin(require('./assertions'));
