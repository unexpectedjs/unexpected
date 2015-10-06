var AssertionString = require('./AssertionString');

module.exports = {
    name: 'assertion-string',
    identify: function (obj) {
        return obj instanceof AssertionString;
    }
};
