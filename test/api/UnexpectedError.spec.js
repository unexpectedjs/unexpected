/*global expect*/
describe('UnexpectedError', function () {
    describe('with a single line message', function () {
        it('should be inspected correctly', function () {
            expect(function () {
                expect(2, 'to equal', 4);
            }, 'to throw', function (err) {
                expect(err, 'to inspect as', 'UnexpectedError(expected 2 to equal 4)');
            });
        });
    });

    describe('with a multiline message', function () {
        it('should be inspected correctly', function () {
            expect(function () {
                expect('foo', 'to equal', 'bar');
            }, 'to throw', function (err) {
                expect(
                    err,
                    'to inspect as',
                    "UnexpectedError(\n" +
                        "  expected 'foo' to equal 'bar'\n" +
                        "\n" +
                        "  -foo\n" +
                        "  +bar\n" +
                        ")"
                );
            });
        });
    });

    it('#getKeys should return a trimmed-down list', function () {
        expect(function () {
            expect('foo', 'to equal', 'bar');
        }, 'to throw', function (err) {
            expect(expect.findTypeOf(err).getKeys(err), 'to equal', [ 'message', 'errorMode', 'parent' ]);
        });
    });
});
