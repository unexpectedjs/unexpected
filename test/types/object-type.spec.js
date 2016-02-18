/*global expect*/
describe('object type', function () {
    describe('#diff', function () {
        it('should show identical multiline values correctly in diffs', function () {
            var clonedExpect = expect.clone().addType({
                name: 'numberNine',
                identify: function (obj) {
                    return obj === 9;
                },
                inspect: function (value, depth, output) {
                    output.block(function () {
                        this.text('NUMBER').nl().text(' NINE ');
                    });
                }
            });
            expect(function () {
                clonedExpect({a: 123, b: 9}, 'to equal', {a: 456, b: 9});
            }, 'to throw',
                   'expected\n' +
                   '{\n' +
                   '  a: 123,\n' +
                   '  b: NUMBER\n' +
                   '      NINE \n' +
                   '}\n' +
                   'to equal\n' +
                   '{\n' +
                   '  a: 456,\n' +
                   '  b: NUMBER\n' +
                   '      NINE \n' +
                   '}\n' +
                   '\n' +
                   '{\n' +
                   '  a: 123, // should equal 456\n' +
                   '  b: NUMBER\n' +
                   '      NINE \n' +
                   '}'
                  );
        });
    });

    describe('with a subtype that disables indentation', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'object',
            name: 'bogusobject',
            identify: function (obj) {
                return obj && typeof obj === 'object' && !Array.isArray(obj);
            },
            indent: false
        });

        it('should not render the indentation when an instance is inspected in a multi-line context', function () {
            expect(
                clonedExpect.inspect({
                    a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
                }).toString(),
                'to equal',
                "{\n" +
                "a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
                "b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'\n" +
                "}"
            );
        });

        it('should not render the indentation when an instance is diffed', function () {
            expect(
                clonedExpect.diff({a: 'a', b: 'b'}, {a: 'aa', b: 'bb'}).diff.toString(),
                'to equal',
                "{\n" +
                "a: 'a', // should equal 'aa'\n" +
                "        // -a\n" +
                "        // +aa\n" +
                "b: 'b' // should equal 'bb'\n" +
                "       // -b\n" +
                "       // +bb\n" +
                "}"
            );
        });

        it('should not render the indentation when an instance participates in a "to satisfy" diff', function () {
            expect(function () {
                clonedExpect({a: 'aaa', b: 'bbb'}, 'to satisfy', {a: 'foo'});
            }, 'to throw',
                "expected { a: 'aaa', b: 'bbb' } to satisfy { a: 'foo' }\n" +
                "\n" +
                "{\n" +
                "a: 'aaa', // should equal 'foo'\n" +
                "          // -aaa\n" +
                "          // +foo\n" +
                "b: 'bbb'\n" +
                "}"
            );
        });
    });

    describe('with a subtype that renders an empty prefix and an empty suffix', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'object',
            name: 'bogusobject',
            identify: function (obj) {
                return obj && typeof obj === 'object' && !Array.isArray(obj);
            },
            prefix: function (output) {
                return output;
            },
            suffix: function (output) {
                return output;
            }
        });

        it('should not render the prefix, suffix, and the newlines when an instance is inspected in a multi-line context', function () {
            expect(
                clonedExpect.inspect({
                    a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
                }).toString(),
                'to equal',
                "  a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
                "  b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'"
            );
        });

        it('should not render the prefix, suffix, and the newlines when an instance is diffed', function () {
            expect(
                clonedExpect.diff({a: 'a', b: 'b'}, {a: 'aa', b: 'bb'}).diff.toString(),
                'to equal',
                "  a: 'a', // should equal 'aa'\n" +
                "          // -a\n" +
                "          // +aa\n" +
                "  b: 'b' // should equal 'bb'\n" +
                "         // -b\n" +
                "         // +bb"
            );
        });

        it('should not render the prefix, suffix, and the newlines when an instance participates in a "to satisfy" diff', function () {
            expect(function () {
                clonedExpect({a: 'aaa', b: 'bbb'}, 'to satisfy', {a: 'foo'});
            }, 'to throw',
                "expected a: 'aaa', b: 'bbb' to satisfy a: 'foo'\n" +
                "\n" +
                "  a: 'aaa', // should equal 'foo'\n" +
                "            // -aaa\n" +
                "            // +foo\n" +
                "  b: 'bbb'"
            );
        });
    });

    describe('with a subtype that forces forceMultipleLines mode', function () {
        var clonedExpect = expect.clone();

        clonedExpect.addType({
            base: 'object',
            name: 'bogusobject',
            identify: function (obj) {
                return obj && typeof obj === 'object' && !Array.isArray(obj);
            },
            forceMultipleLines: true
        });

        it('should inspect in forceMultipleLines mode despite being able to render on one line', function () {
            expect(
                clonedExpect.inspect({a: 'a', b: 'b'}).toString(),
                'to equal',
                "{\n" +
                "  a: 'a', b: 'b'\n" + // This is the 'compact' feature kicking in
                "}"
            );
        });
    });
});
