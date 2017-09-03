var expect = require('../lib').clone().use(require('./node_modules/unexpected-bogus/index.js'));

it('should fail with a full trace', function () {
    expect('abc', 'to be bogus');
});