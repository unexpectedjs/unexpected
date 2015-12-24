/*global expect*/
describe('to begin with assertion', function () {
    it('should throw an error when the expected prefix is the empty string', function () {
        expect(function () {
            expect('foo', 'to begin with', '');
        }, 'to throw', "The 'to begin with' assertion does not support a prefix of the empty string");
    });

    describe('without the "not" flag', function () {
        it('asserts equality with a string', function () {
            expect('hello', 'to begin with', 'hello');
            expect('hello world', 'to begin with', 'hello');
        });

        describe('when the assertion fails', function () {
            it('does not include a diff when there is no common prefix', function () {
                expect(function () {
                    expect('hello world', 'to begin with', 'foo');
                }, 'to throw exception', "expected 'hello world' to begin with 'foo'");
            });

            it('includes a diff when there is a common prefix', function () {
                expect(function () {
                    expect('hello world', 'to begin with', 'hell yeah');
                }, 'to throw exception',
                       expect.it('to have message',
                                 "expected 'hello world' to begin with 'hell yeah'\n" +
                                 "\n" +
                                 "hello world\n" +
                                 "^^^^"
                                ).and('to have ansi diff', function () {
                                    this.text('hell', ['bgYellow', 'black']).text('o world');
                                })
                      );
            });

            it('builds the diff correctly when the partial match spans more than one line', function () {
                expect(function () {
                    expect('f\no\nobar', 'to begin with', 'f\no\nop');
                }, 'to throw exception',
                       "expected 'f\\no\\nobar' to begin with 'f\\no\\nop'\n" +
                       "\n" +
                       "f\n" +
                       "^\n" +
                       "o\n" +
                       "^\n" +
                       "obar\n" +
                       "^"
                      );
            });

            it('builds the diff correctly when the substring is longer than the subject', function () {
                expect(function () {
                    expect('foo', 'to begin with', 'foobar');
                }, 'to throw exception',
                       "expected 'foo' to begin with 'foobar'\n" +
                       "\n" +
                       "foo\n" +
                       "^^^"
                      );
            });
        });
    });

    describe('with the "not" flag', function () {
        it('asserts inequality', function () {
            expect('hello', 'not to begin with', 'world');
            expect('hello world', 'not to begin with', 'world');
        });

        describe('when the assertion fails', function () {
            it('produces a diff', function () {
                expect(function () {
                    expect('foobarquuxfoo', 'not to begin with', 'foo');
                }, 'to throw',
                       expect.it('to have message',
                                 "expected 'foobarquuxfoo' not to begin with 'foo'\n" +
                                 "\n" +
                                 "foobarquuxfoo\n" +
                                 "^^^"
                                ).and('to have ansi diff', function () {
                                    this.text('foo', ['bgRed', 'black']).text('barquuxfoo');
                                })
                      );
            });

            it('builds the diff correctly when the prefix contains newlines', function () {
                expect(function () {
                    expect('f\no\nobarquuxfoo', 'not to begin with', 'f\no\no');
                }, 'to throw',
                       "expected 'f\\no\\nobarquuxfoo' not to begin with 'f\\no\\no'\n" +
                       "\n" +
                       "f\n" +
                       "^\n" +
                       "o\n" +
                       "^\n" +
                       "obarquuxfoo\n" +
                       "^"
                      );
            });
        });
    });
});
