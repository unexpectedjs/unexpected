var Unexpected = require('./Unexpected');

module.exports = Unexpected.create()
    .installPlugin(require('./styles'))
    .installPlugin(require('./types'))
    .installPlugin(function (expect) {
        expect.output.installPlugin(require('magicpen-prism'));
    })
    .installPlugin(require('./assertions'));
