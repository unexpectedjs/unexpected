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

    it('accepts legacy assertions', function () {
        var assertion = expect.parseAssertion('[not] to be');
        expect(assertion, 'to satisfy', {
            subject: [ { name: 'any' } ],
            assertion: '[not] to be',
            args: [ [ { varargs: { name: 'any' } } ] ]
        });
    });

    it('accepts assertions with no arguments', function () {
        var assertion = expect.parseAssertion('<any> [not] to be truthy');
        expect(assertion, 'to satisfy', {
            subject: [ { name: 'any' } ],
            assertion: '[not] to be truthy',
            args: []
        });
    });
});
