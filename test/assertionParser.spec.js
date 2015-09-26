/*global unexpected*/
var assertionParser = require('../lib/assertionParser');

describe('assertionParser', function () {
    var expect = unexpected.clone();
    describe('when given a valid assertion string', function () {
        it('extracts the information into an object tree', function () {
            var assertion = assertionParser('<string|function> [not] to be <string> <...string|object>');
            expect(assertion, 'to equal', {
                subject: [ 'string', 'function' ],
                assertion: '[not] to be',
                args: [ [ 'string' ], [ { varargs: 'string' }, 'object' ] ]
            });
        });
    });
});
