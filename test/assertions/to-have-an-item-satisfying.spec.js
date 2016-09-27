/*global expect*/
describe('to have an item satisfying assertion', function () {
    it('requires a third argument', function () {
        expect(
            function () {
                expect([1, 2, 3], 'to have an item satisfying');
            },
            'to throw',
            "expected [ 1, 2, 3 ] to have an item satisfying\n" +
            "  No matching assertion, did you mean:\n" +
            "  <array-like> to have an item [exhaustively] satisfying <any>\n" +
            "  <array-like> to have an item [exhaustively] satisfying <assertion>");
    });

    it('only accepts arrays as the subject', function () {
        expect(
            function () {
                expect(42, 'to have an item satisfying', 'to be a number');
            },
            'to throw',
            "expected 42 to have an item satisfying 'to be a number'\n" +
            "  No matching assertion, did you mean:\n" +
            "  <array-like> to have an item [exhaustively] satisfying <any>\n" +
            "  <array-like> to have an item [exhaustively] satisfying <assertion>");
    });

    it('fails if the given array is empty', function () {
        expect(
            function () {
                expect([], 'to have an item satisfying', 'to be a number');
            },
            'to throw',
            "expected [] to have an item satisfying 'to be a number'\n" +
            "  expected [] to be non-empty");
    });

    it('asserts that at least one item in the array satisfies the RHS expectation', function () {
        expect(['foo', 1], 'to have an item satisfying', 'to be a number');

        expect(['foo', 1], 'to have an item satisfying', function (item) {
            expect(item, 'to be a number');
        });

        expect([0, 1, 'foo', 2], 'to have an item satisfying', 'not to be a number');

        expect([[1], [2]], 'to have an item satisfying', 'to have an item satisfying', 'to be a number');
    });

    it('throws the correct error if none of the subject\'s values match the RHS expectation', function () {
        expect(
            function () {
                expect(['foo', 'bar'], 'to have an item satisfying', expect.it('to be a number'));
            },
            'to throw',
            "expected [ 'foo', 'bar' ] to have an item satisfying expect.it('to be a number')"
        );
    });

    it('formats non-Unexpected errors correctly', function () {
        expect(
            function () {
                expect(
                    [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]],
                    'to have an item satisfying',
                    function (item) {
                        expect.fail(function (output) {
                            output.text('foo').nl().text('bar');
                        });
                    });
            },
            'to throw',
            "expected array to have an item satisfying\n" +
            "function (item) {\n" +
            "  expect.fail(function (output) {\n" +
            "    output.text('foo').nl().text('bar');\n" +
            "  });\n" +
            "}"
        );
    });

    it('provides the item index to the callback function', function () {
        var arr = ['0', '1', '2', '3'];
        expect(arr, 'to have an item satisfying', function (item, index) {
            expect(index, 'to be a number');
            expect(index, 'to be', parseInt(item, 10));
        });
    });

    describe('delegating to an async assertion', function () {
        var clonedExpect = expect.clone()
            .addAssertion('to be a number after a short delay', function (expect, subject, delay) {
                expect.errorMode = 'nested';

                return expect.promise(function (run) {
                    setTimeout(run(function () {
                        expect(subject, 'to be a number');
                    }), 1);
                });
            });

        it('should succeed', function () {
            return clonedExpect([1, 2, 3], 'to have an item satisfying', 'to be a number after a short delay');
        });
    });

    describe('with the exhaustively flag', function () {
        it('should succeed', function () {
            expect([{foo: 'bar', quux: 'baz'}], 'to have an item exhaustively satisfying', {foo: 'bar', quux: 'baz'});
        });

        it('should fail when the spec is not met only because of the "exhaustively" semantics', function () {
            expect(
                function () {
                    expect([{foo: 'bar', quux: 'baz'}], 'to have an item exhaustively satisfying', {foo: 'bar'});
                },
                'to throw',
                "expected [ { foo: 'bar', quux: 'baz' } ]\n" +
                "to have an item exhaustively satisfying { foo: 'bar' }"
            );
        });
    });
});
