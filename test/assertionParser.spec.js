/*global unexpected*/
var Unexpected = require('../lib/Unexpected');
describe('parseAssertion', function () {
    var expect = unexpected.clone();
    describe('when given a valid assertion string', function () {
        it('extracts the information into an object tree', function () {
            var assertion = Unexpected.prototype.parseAssertion('<string|function> [not] to be <string> <...string|object>');
            expect(assertion, 'to equal', {
                subject: [ 'string', 'function' ],
                assertion: '[not] to be',
                args: [ [ 'string' ], [ { varargs: 'string' }, 'object' ] ]
            });
        });
    });
});
