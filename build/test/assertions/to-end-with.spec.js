/*global expectWithUnexpectedMagicPen*/
describe('to end with assertion', function () {
    var expect = expectWithUnexpectedMagicPen;

    it('should throw an error when the expected suffix is the empty string', function () {
        expect(function () {
            expect('foo', 'to end with', '');
        }, 'to throw', "The 'to end with' assertion does not support a suffix of the empty string");
    });

    describe('without the "not" flag', function () {
        it('asserts equality with a string', function () {
            expect('hello', 'to end with', 'hello');
            expect('hello world', 'to end with', 'world');
        });

        describe('when the assertion fails', function () {
            it('does not include a diff when there is no common suffix', function () {
                expect(function () {
                    expect('hello world', 'to end with', 'foo');
                }, 'to throw exception', "expected 'hello world' to end with 'foo'");
            });

            it('includes a diff when there is a common suffix', function () {
                expect(function () {
                    expect('hello world', 'to end with', 'wonderful world');
                }, 'to throw exception', expect.it('to have message', "expected 'hello world' to end with 'wonderful world'\n" + "\n" + "hello world\n" + "     ^^^^^^").and('to have ansi diff', function () {
                    this.text('hello').text(' world', ['bgYellow', 'black']);
                }));
            });

            it('builds the diff correctly when the partial match spans more than one line', function () {
                expect(function () {
                    expect('foob\na\nr', 'to end with', 'quuxb\na\nr');
                }, 'to throw exception', "expected 'foob\\na\\nr' to end with 'quuxb\\na\\nr'\n" + "\n" + "foob\n" + "   ^\n" + "a\n" + "^\n" + "r\n" + "^");
            });

            it('builds the diff correctly when the substring is longer than the subject', function () {
                expect(function () {
                    expect('foo', 'to end with', 'doublefoo');
                }, 'to throw exception', "expected 'foo' to end with 'doublefoo'\n" + "\n" + "foo\n" + "^^^");
            });
        });
    });

    describe('with the "not" flag', function () {
        it('asserts inequality', function () {
            expect('hello', 'not to end with', 'world');
            expect('hello worldly', 'not to end with', 'world');
        });

        it('produces a diff when the string case fails', function () {
            expect(function () {
                expect('foobarquuxfoo', 'not to end with', 'foo');
            }, 'to throw', expect.it('to have message', "expected 'foobarquuxfoo' not to end with 'foo'\n" + "\n" + "foobarquuxfoo\n" + "          ^^^").and('to have ansi diff', function () {
                this.text('foobarquux').text('foo', ['bgRed', 'black']);
            }));
        });

        it('builds the diff correctly when the suffix contains newlines', function () {
            expect(function () {
                expect('foobarquuxf\no\no', 'not to end with', 'f\no\no');
            }, 'to throw', "expected 'foobarquuxf\\no\\no' not to end with 'f\\no\\no'\n" + "\n" + "foobarquuxf\n" + "          ^\n" + "o\n" + "^\n" + "o\n" + "^");
        });
    });
});