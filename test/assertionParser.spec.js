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

    it('throw a type cannot be detected', function () {
        expect(function () {
            expect.parseAssertion('<string|function> [not] to be <string> <...foo|object>');
        }, 'to throw', 'Unknown type: foo in <string|function> [not] to be <string> <...foo|object>');
    });

    it('throw if the subject type is not specified', function () {
        expect(function () {
            expect.parseAssertion('[not] to be <string> <...string|object>');
        }, 'to throw', 'Missing subject type in [not] to be <string> <...string|object>');
    });

    it('throw if the assertion cannot be detected', function () {
        expect(function () {
            expect.parseAssertion('<string> <...string|object>');
        }, 'to throw', 'Missing assertion in <string> <...string|object>');
    });

    it('throw if varargs is used for the subject', function () {
        expect(function () {
            expect.parseAssertion('<...any> [not] to be <...any>');
        }, 'to throw', 'The subject type cannot have varargs: <...any> [not] to be <...any>');
    });

    it('throw if varargs is used before the last argument', function () {
        expect(function () {
            expect.parseAssertion('<any> [not] to be <...any> <string>');
        }, 'to throw', 'Only the last argument type can have varargs: <any> [not] to be <...any> <string>');
    });
});
