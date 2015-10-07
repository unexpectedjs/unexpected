/*global unexpected*/
describe('parseAssertion', function () {
    var expect = unexpected.clone();

    it('converts an assertion string to an object representation', function () {
        var assertion = expect.parseAssertion('<string|function> [not] to be <string> <string*|object>');
        expect(assertion, 'to satisfy', [
            {
                subject: {minimum: 1, maximum: 1, type: {name: 'string'}},
                assertion: '[not] to be',
                args: [
                    { minimum: 1, maximum: 1, type: { name: 'string' } },
                    { minimum: 0, maximum: Infinity, type: { name: 'string' } }
                ]
            },
            {
                subject: {minimum: 1, maximum: 1, type: {name: 'string'}},
                assertion: '[not] to be',
                args: [
                    { minimum: 1, maximum: 1, type: { name: 'string' } },
                    { minimum: 1, maximum: 1, type: { name: 'object' } }
                ]
            },
            {
                subject: {minimum: 1, maximum: 1, type: {name: 'function'}},
                assertion: '[not] to be',
                args: [
                    { minimum: 1, maximum: 1, type: { name: 'string' } },
                    { minimum: 0, maximum: Infinity, type: { name: 'string' } }
                ]
            },
            {
                subject: {minimum: 1, maximum: 1, type: {name: 'function'}},
                assertion: '[not] to be',
                args: [
                    { minimum: 1, maximum: 1, type: { name: 'string' } },
                    { minimum: 1, maximum: 1, type: { name: 'object' } }
                ]
            }
        ]);
    });

    it('accepts assertions without alternations', function () {
        var assertion = expect.parseAssertion('<any> [not] to [exhaustively] satisfy [assertion] <any*>');
        expect(assertion, 'to satisfy', [{
            subject: { minimum: 1, maximum: 1, type: { name: 'any' } },
            assertion: '[not] to [exhaustively] satisfy [assertion]',
            args: [ { minimum: 0, maximum: Infinity, type: { name: 'any' } } ]
        }]);
    });

    it('accepts assertions with alternations on the subject', function () {
        var assertion = expect.parseAssertion("<string|array-like> [not] to be empty <any*>");
        expect(assertion, 'to satisfy', [
            {
                subject: { minimum: 1, maximum: 1, type: { name: 'string' } },
                assertion: '[not] to be empty',
                args: [ { minimum: 0, maximum: Infinity, type: { name: 'any' } } ]
            },
            {
                subject: { minimum: 1, maximum: 1, type: { name: 'array-like' } },
                assertion: '[not] to be empty',
                args: [ { minimum: 0, maximum: Infinity, type: { name: 'any' } } ]
            }
        ]);
    });

    it('accepts legacy assertions', function () {
        var assertion = expect.parseAssertion('[not] to be');
        expect(assertion, 'to satisfy', [{
            subject: { type: { name: 'any' }, minimum: 1, maximum: 1 },
            assertion: '[not] to be',
            args: [ { type: { name: 'any' }, minimum: 0, maximum: Infinity } ]
        }]);
    });

    it('accepts assertions with no arguments', function () {
        var assertion = expect.parseAssertion('<any> [not] to be truthy');
        expect(assertion, 'to satisfy', [{
            subject: { type: { name: 'any' }, minimum: 1, maximum: 1 },
            assertion: '[not] to be truthy',
            args: []
        }]);
    });

    it('throw a type cannot be detected', function () {
        expect(function () {
            expect.parseAssertion('<string|function> [not] to be <string> <foo*|object>');
        }, 'to throw', 'Unknown type: foo in <string|function> [not] to be <string> <foo*|object>');
    });

    it('throw if the subject type is not specified', function () {
        expect(function () {
            expect.parseAssertion('[not] to be <string> <string*|object>');
        }, 'to throw', 'Missing subject type in [not] to be <string> <string*|object>');
    });

    it('throw if the assertion cannot be detected', function () {
        expect(function () {
            expect.parseAssertion('<string> <string*|object>');
        }, 'to throw', 'Missing assertion in <string> <string*|object>');
    });

    it('throw if varargs is used for the subject', function () {
        expect(function () {
            expect.parseAssertion('<any*> [not] to be <any*>');
        }, 'to throw', 'The subject type cannot have varargs: <any*> [not] to be <any*>');
    });

    it('throw if varargs is used before the last argument', function () {
        expect(function () {
            expect.parseAssertion('<any> [not] to be <any*> <string>');
        }, 'to throw', 'Only the last argument type can have varargs: <any> [not] to be <any*> <string>');
    });

    it('handles types with upper case characters', function () {
        var assertion = expect.parseAssertion('<number|NaN> [not] to be NaN');
        expect(assertion, 'to satisfy', [
            {
                subject: { type: { name: 'number' }, minimum: 1, maximum: 1 },
                assertion: '[not] to be NaN',
                args: []
            },
            {
                subject: { type: { name: 'NaN' }, minimum: 1, maximum: 1 },
                assertion: '[not] to be NaN',
                args: []
            }
        ]);
    });

    describe('with an assertion that has <assertion>', function () {
        it('should accept it as the last argument', function () {
            var assertion = expect.parseAssertion('<Buffer> when decoded as <string> <assertion>');
            expect(assertion, 'to satisfy', [
                {
                    subject: { type: { name: 'Buffer' }, minimum: 1, maximum: 1 },
                    assertion: 'when decoded as',
                    args: [
                        { type: { name: 'string' }, minimum: 1, maximum: 1 },
                        { type: { name: 'assertion-string' }, minimum: 1, maximum: 1 },
                        { type: { name: 'any' }, minimum: 0, maximum: Infinity }
                    ]
                },
                {
                    subject: { type: { name: 'Buffer' }, minimum: 1, maximum: 1 },
                    assertion: 'when decoded as',
                    args: [
                        { type: { name: 'string' }, minimum: 1, maximum: 1 },
                        { type: { name: 'expect.it' }, minimum: 1, maximum: 1 }
                    ]
                }
            ]);
        });

        it('should not accept it as the subject type', function () {
            expect(function () {
                expect.parseAssertion('<assertion> to foo');
            }, 'to throw', 'Only the last argument type can be <assertion>: <assertion> to foo');
        });

        it('should not accept it as the non-last argument', function () {
            expect(function () {
                expect.parseAssertion('<Buffer> when decoded as <assertion> <string>');
            }, 'to throw', 'Only the last argument type can be <assertion>: <Buffer> when decoded as <assertion> <string>');
        });

        it('should not accept it with a varargs operator', function () {
            expect(function () {
                expect.parseAssertion('<Buffer> when decoded as <string> <assertion+>');
            }, 'to throw', '<assertion+> and <assertion*> are not allowed: <Buffer> when decoded as <string> <assertion+>');
        });

        it('should not accept it alternated with other types', function () {
            expect(function () {
                expect.parseAssertion('<Buffer> when decoded as <string> <assertion|any+>');
            }, 'to throw', '<assertion> cannot be alternated with other types: <Buffer> when decoded as <string> <assertion|any+>');
        });
    });
});
