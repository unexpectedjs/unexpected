/*global expect*/
describe('array-like type', function () {
    describe('with a subtype that disables indentation', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'array-like',
            name: 'bogusarray',
            identify: Array.isArray,
            indent: false
        });

        it('should not render the indentation when an instance is inspected in a multi-line context', function () {
            expect(
                clonedExpect.inspect([
                    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
                ]).toString(),
                'to equal',
                "[\n" +
                "'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
                "'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'\n" +
                "]"
            );
        });

        it('should not render the indentation when an instance is diffed', function () {
            expect(
                clonedExpect.diff(['a', 'b'], ['aa', 'bb']).diff.toString(),
                'to equal',
                "[\n" +
                "'a', // should equal 'aa'\n" +
                "     // -a\n" +
                "     // +aa\n" +
                "'b' // should equal 'bb'\n" +
                "    // -b\n" +
                "    // +bb\n" +
                "]"
            );
        });

        it('should not render the indentation when an instance participates in a "to satisfy" diff', function () {
            expect(function () {
                clonedExpect(['aaa', 'bbb'], 'to satisfy', {0: 'foo'});
            }, 'to throw',
                "expected [ 'aaa', 'bbb' ] to satisfy { 0: 'foo' }\n" +
                "\n" +
                "[\n" +
                "'aaa', // should equal 'foo'\n" +
                "       // -aaa\n" +
                "       // +foo\n" +
                "'bbb'\n" +
                "]"
            );
        });
    });

    describe('with a subtype that disables prefix, suffix, leading and trailing newline', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'array-like',
            name: 'bogusarray',
            identify: Array.isArray,
            prefix: function (output) {
                return output;
            },
            suffix: function (output) {
                return output;
            }
        });

        it('should not render the prefix, suffix, and the newlines when an instance is inspected in a multi-line context', function () {
            expect(
                clonedExpect.inspect([
                    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
                ]).toString(),
                'to equal',
                "  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
                "  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'"
            );
        });

        it('should not render the prefix, suffix, and the newlines when an instance is diffed', function () {
            expect(
                clonedExpect.diff(['a', 'b'], ['aa', 'bb']).diff.toString(),
                'to equal',
                "  'a', // should equal 'aa'\n" +
                "       // -a\n" +
                "       // +aa\n" +
                "  'b' // should equal 'bb'\n" +
                "      // -b\n" +
                "      // +bb"
            );
        });

        it('should not render the prefix, suffix, and the newlines when an instance participates in a "to satisfy" diff', function () {
            expect(function () {
                clonedExpect(['aaa', 'bbb'], 'to satisfy', {0: 'foo'});
            }, 'to throw',
                "expected 'aaa', 'bbb' to satisfy { 0: 'foo' }\n" +
                "\n" +
                "  'aaa', // should equal 'foo'\n" +
                "         // -aaa\n" +
                "         // +foo\n" +
                "  'bbb'"
            );
        });
    });

    describe('with a subtype that forces forceMultipleLines mode', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'array-like',
            name: 'bogusarray',
            identify: Array.isArray,
            forceMultipleLines: true
        });

        it('should inspect in forceMultipleLines mode despite being able to render on one line', function () {
            expect(
                clonedExpect.inspect(['a', 'b']).toString(),
                'to equal',
                "[\n" +
                "  'a',\n" +
                "  'b'\n" +
                "]"
            );
        });
    });
});
