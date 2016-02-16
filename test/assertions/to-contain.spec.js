/*global expect*/
describe('to contain assertion', function () {
    it('should throw an error when one of the arguments is the empty string', function () {
        expect(function () {
            expect('foo', 'to contain', 'bar', '');
        }, 'to throw', "The 'to contain' assertion does not support the empty string");
    });

    it('asserts indexOf for a string', function () {
        expect('hello world', 'to contain', 'world');
    });

    it('asserts item equality for an array', function () {
        expect([1, 2], 'to contain', 1);
        expect([1, 2], 'to contain', 2, 1);
        expect([{foo: 123}], 'to contain', {foo: 123});
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect(null, 'not to contain', 'world');
        }, 'to throw',
               "expected null not to contain 'world'\n" +
               "  No matching assertion, did you mean:\n" +
               "  <array-like> [not] to contain <any+>\n" +
               "  <string> [not] to contain <string+>");

        expect(function () {
            expect('hello world', 'to contain', 'foo');
        }, 'to throw exception', "expected 'hello world' to contain 'foo'\n\nhello world");

        expect(function () {
            expect('hello world', 'to contain', 'hello', 'foo');
        }, 'to throw exception',
               "expected 'hello world' to contain 'hello', 'foo'\n" +
               "\n" +
               "hello world\n" +
               "^^^^^"
              );

        expect(function () {
            expect([1, 2], 'to contain', 2, 3);
        }, 'to throw exception', "expected [ 1, 2 ] to contain 2, 3");

        expect(function () {
            expect([{foo: 123}], 'to contain', {foo: 123}, {bar: 456});
        }, 'to throw exception', "expected [ { foo: 123 } ] to contain { foo: 123 }, { bar: 456 }");

        expect(function () {
            expect(1, 'to contain', 1);
        }, 'to throw exception',
               "expected 1 to contain 1\n" +
               "  No matching assertion, did you mean:\n" +
               "  <array-like> [not] to contain <any+>\n" +
               "  <string> [not] to contain <string+>");
    });

    it('produces a diff showing full and partial matches for each needle when the assertion fails', function () {
        expect(function () {
            expect('foo\nbarquux', 'to contain', 'foo\nb', 'quuux');
        }, 'to throw',
               expect.it('to have text message',
                         "expected 'foo\\nbarquux' to contain 'foo\\nb', 'quuux'\n" +
                         "\n" +
                         "foo\n" +
                         "^^^\n" +
                         "barquux\n" +
                         "^  ^^^"
                        ).and('to have ansi diff', function () {
                            this.text('foo', ['bgGreen', 'black']).nl()
                                .text('b', ['bgGreen', 'black'])
                                .text('ar')
                                .text('quu', ['bgYellow', 'black'])
                                .text('x');
                        })
              );
    });

    describe('with the not flag', function () {
        it('produces a useful diff in text mode when a match spans multiple lines', function () {
            expect(function () {
                expect('blahfoo\nbar\nquux', 'not to contain', 'foo\nbar\nq');
            }, 'to throw', function (err) {
                expect(err, 'to have text message',
                       "expected 'blahfoo\\nbar\\nquux' not to contain 'foo\\nbar\\nq'\n" +
                       "\n" +
                       "blahfoo\n" +
                       "    ^^^\n" +
                       "bar\n" +
                       "^^^\n" +
                       "quux\n" +
                       "^"
                      );
            });
        });

        it('produces a diff when the array case fails', function () {
            expect(function () {
                expect([1, 2, 3], 'not to contain', 2);
            }, 'to throw',
                   'expected [ 1, 2, 3 ] not to contain 2\n' +
                   '\n' +
                   '[\n' +
                   '  1,\n' +
                   '  2, // should be removed\n' +
                   '  3\n' +
                   ']');
        });

        it('produces a diff when the string case fails', function () {
            expect(function () {
                expect('foobarquuxfoo', 'not to contain', 'foo');
            }, 'to throw',
                   "expected 'foobarquuxfoo' not to contain 'foo'\n" +
                   '\n' +
                   'foobarquuxfoo\n' +
                   '^^^       ^^^');
        });
    });

    it('should not highlight overlapping partial matches', function () {
        expect(function () {
            expect('foobarquux', 'not to contain', 'foob', 'barq');
        }, 'to throw',
            "expected 'foobarquux' not to contain 'foob', 'barq'\n" +
            "\n" +
            "foobarquux\n" +
            "^^^^"
        );
    });

    it('should highlight all occurrences of the longest partial match', function () {
        expect(function () {
            expect('foobarquuxfoob', 'to contain', 'ooaaq', 'foobr');
        }, 'to throw',
            "expected 'foobarquuxfoob' to contain 'ooaaq', 'foobr'\n" +
            "\n" +
            "foobarquuxfoob\n" +
            "^^^^      ^^^^"
        );
    });
});
