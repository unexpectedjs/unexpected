/*global expectWithUnexpectedMagicPen*/
describe('to have message/diff assertion', function () {
    var expect = expectWithUnexpectedMagicPen;

    describe('with an Unexpected error', function () {
        var err;
        beforeEach(function () {
            try {
                expect(1, 'to equal', 2);
            } catch (e) {
                err = e;
            }
        });

        it('should succeed', function () {
            expect(err, 'to have message', 'expected 1 to equal 2');
        });

        it('should fail with a diff', function () {
            expect(function () {
                expect(err, 'to have message', 'expected 3 to equal 2');
            }, 'to throw', function (err) {
                var message = err.getErrorMessage({ format: 'text' }).toString('text');
                expect(
                    message,
                    'to contain',
                    "to have message 'expected 3 to equal 2'\n" +
                        "  expected 'expected 1 to equal 2' to equal 'expected 3 to equal 2'\n" +
                        "\n" +
                        "  -expected 1 to equal 2\n" +
                        "  +expected 3 to equal 2"
                );
                expect(message, 'to match', /^expected\sUnexpectedError\([\s\S]*\)/);
            });
        });

        it('should support the ansi flag', function () {
            expect(function () {
                expect(err, 'to have message', 'expected 3 to equal 2');
            }, 'to throw', function (err) {
                expect(err, 'to have ansi message', expect.it('to contain', "\x1B[36m'expected 1 to equal 2'\x1B[39m"));
            });
        });

        it('should support the html flag', function () {
            expect(function () {
                expect(err, 'to have message', 'expected 3 to equal 2');
            }, 'to throw', function (err) {
                expect(err, 'to have html message', expect.it('to contain', 'to&nbsp;have&nbsp;message'));
            });
        });

        it('should support matching the diff instead of the message', function () {
            expect(function () {
                expect('abc', 'to equal', 'def');
            }, 'to throw', expect.it('to have ansi diff',
                                     '\x1B[41m\x1B[30mabc\x1B[39m\x1B[49m\n' +
                                     '\x1B[42m\x1B[30mdef\x1B[39m\x1B[49m'
                                    ));
        });

        it('should fail to get the diff from an Unexpected error that does not have one', function () {
            expect(function () {
                expect(function () {
                    expect(123, 'to equal', 456);
                }, 'to throw', expect.it('to have ansi diff', function () {}));
            }, 'to throw',
                   "expected function () { expect(123, 'to equal', 456); }\n" +
                   "to throw expect.it('to have ansi diff', function () {})\n" +
                   "  expected UnexpectedError(expected 123 to equal 456)\n" +
                   "  to have ansi diff function () {}\n" +
                   "    The UnexpectedError instance does not have a diff"
                  );
        });

        it('should fail to get the diff from a non-Unexpected error', function () {
            expect(function () {
                expect(function () {
                    throw new Error('foo');
                }, 'to throw', expect.it('to have ansi diff', function () {}));
            }, 'to throw',
                   "expected function () { throw new Error('foo'); }\n" +
                   "to throw expect.it('to have ansi diff', function () {})\n" +
                   "  expected Error('foo') to have ansi diff function () {}\n" +
                   "    Cannot get the diff from a non-Unexpected error"
                  );
        });

        describe('when comparing against a magicpen instance', function () {
            it('should succeed', function () {
                var expectedDiff = expect.createOutput('ansi')
                    .text('abc', ['bgRed', 'black']).nl()
                    .text('def', ['bgGreen', 'black']);

                expect(function () {
                    expect('abc', 'to equal', 'def');
                }, 'to throw', expect.it('to have ansi diff', expectedDiff));
            });

            it('should fail with a diff', function () {
                var expectedDiff = expect.createOutput('ansi')
                    .red('-').text('abc').nl()
                    .green('+').text('def', ['bgGreen', 'black']);

                expect(function () {
                    expect(function () {
                        expect('abc', 'to equal', 'def');
                    }, 'to throw', expect.it('to have ansi diff', expectedDiff));
                }, 'to throw',
                       "expected\n" +
                       "function () {\n" +
                       "  expect('abc', 'to equal', 'def');\n" +
                       "}\n" +
                       "to throw\n" +
                       "expect.it('to have ansi diff', magicpen('ansi')\n" +
                       "                                 .red('-')\n" +
                       "                                 .text('abc').nl()\n" +
                       "                                 .green('+')\n" +
                       "                                 .text('def', [ 'bgGreen', 'black' ]))\n" +
                       "  expected\n" +
                       "  UnexpectedError(\n" +
                       "    expected 'abc' to equal 'def'\n" +
                       "\n" +
                       "    -abc\n" +
                       "    +def\n" +
                       "  )\n" +
                       "  to have ansi diff\n" +
                       "  magicpen('ansi')\n" +
                       "    .red('-')\n" +
                       "    .text('abc').nl()\n" +
                       "    .green('+')\n" +
                       "    .text('def', [ 'bgGreen', 'black' ])\n" +
                       "    expected\n" +
                       "    magicpen('ansi')\n" +
                       "      .diffRemovedHighlight('abc').nl()\n" +
                       "      .diffAddedHighlight('def')\n" +
                       "    to equal\n" +
                       "    magicpen('ansi')\n" +
                       "      .red('-')\n" +
                       "      .text('abc').nl()\n" +
                       "      .green('+')\n" +
                       "      .text('def', [ 'bgGreen', 'black' ])"
                      );
            });
        });

        describe('when building the expected output via a function', function () {
            it('should succeed', function () {
                expect(function () {
                    expect('abc', 'to equal', 'def');
                }, 'to throw', expect.it('to have ansi diff', function () {
                    this.text('abc', ['bgRed', 'black']).nl()
                        .text('def', ['bgGreen', 'black']);
                }));
            });

            it('should fail with a diff', function () {
                expect(function () {
                    expect(function () {
                        expect('abc', 'to equal', 'def');
                    }, 'to throw', expect.it('to have ansi diff', function () {
                        this.red('-').text('abc').nl().green('+').text('def', ['bgGreen', 'black']);
                    }));
                }, 'to throw',
                       "expected\n" +
                       "function () {\n" +
                       "  expect('abc', 'to equal', 'def');\n" +
                       "}\n" +
                       "to throw\n" +
                       "expect.it('to have ansi diff', function () {\n" +
                       "  this.red('-').text('abc').nl().green('+').text('def', ['bgGreen', 'black']);\n" +
                       "})\n" +
                       "  expected\n" +
                       "  UnexpectedError(\n" +
                       "    expected 'abc' to equal 'def'\n" +
                       "\n" +
                       "    -abc\n" +
                       "    +def\n" +
                       "  )\n" +
                       "  to have ansi diff\n" +
                       "  function () {\n" +
                       "    this.red('-').text('abc').nl().green('+').text('def', ['bgGreen', 'black']);\n" +
                       "  }\n" +
                       "    expected\n" +
                       "    magicpen('ansi')\n" +
                       "      .diffRemovedHighlight('abc').nl()\n" +
                       "      .diffAddedHighlight('def')\n" +
                       "    to equal\n" +
                       "    magicpen('ansi')\n" +
                       "      .red('-')\n" +
                       "      .text('abc').nl()\n" +
                       "      .green('+')\n" +
                       "      .text('def', [ 'bgGreen', 'black' ])"
                      );
            });
        });

        it('should assume that a function that does not produce any output has run assertions on the stringified diff/message, and thus should not fail', function () {
            expect(function () {
                expect('abc', 'to equal', 'def');
            }, 'to throw', expect.it('to have ansi diff', function (ansiStr) {
                expect(ansiStr, 'to contain', 'abc');
            }));
        });

        it('should handle the case where the function returns a promise', function () {
            return expect(
                expect(function () {
                    expect('abc', 'to equal', 'def');
                }, 'to throw', expect.it('to have ansi diff', function (ansiStr) {
                    return expect(123, 'when delayed a little bit', 'to equal', 456);
                })),
                'to be rejected with',
                "expected\n" +
                    "function () {\n" +
                    "  expect('abc', 'to equal', 'def');\n" +
                    "}\n" +
                    "to throw\n" +
                    "expect.it('to have ansi diff', function (ansiStr) {\n" +
                    "  return expect(123, 'when delayed a little bit', 'to equal', 456);\n" +
                    "})\n" +
                    "  expected 123 when delayed a little bit to equal 456"
            );
        });

        it('should throw an error when asked for a non-text representation of a non-Unexpected error', function () {
            try {
                throw new Error('foo');
            } catch (err) {
                expect(function () {
                    expect(err, 'to have html message', 'foo');
                }, 'to throw',
                       "expected Error('foo') to have html message 'foo'\n" +
                       "  Cannot get the html representation of non-Unexpected error");
            }
        });
    });

    describe('with a non-Unexpected error', function () {
        var err = new Error('Bummer!');
        it('should succeed', function () {
            expect(err, 'to have message', 'Bummer!');
        });

        it('should fail with a diff', function () {
            expect(function () {
                expect(err, 'to have message', 'Dammit!');
            }, 'to throw',
                   "expected Error('Bummer!') to have message 'Dammit!'\n" +
                   "  expected 'Bummer!' to equal 'Dammit!'\n" +
                   "\n" +
                   "  -Bummer!\n" +
                   "  +Dammit!"
                  );
        });
    });
});
