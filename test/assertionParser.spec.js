/*global unexpected*/
describe('parseAssertion', function () {
    var expect = unexpected.clone();

    it('converts an assertion string to an object representation', function () {
        var assertion = expect.parseAssertion('<string|function> [not] to be <string> <...string|object>');
        expect(assertion, 'to satisfy', {
            subject: [ { name: 'string' }, { name: 'function' } ],
            assertion: '[not] to be',
            args: [ [ { name: 'string' } ], [ { varargs: { name: 'string' } }, { name: 'object' } ] ]
        });
    });
});
