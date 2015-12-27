/*global unexpected*/

it.skipIf = function (condition) {
    (condition ? it.skip : it).apply(it, Array.prototype.slice.call(arguments, 1));
};

describe('unexpected', function () {
    var workQueue = typeof weknowhow === 'undefined' ? require('../lib/workQueue') : null;
    var expect = unexpected.clone();

    expect.addAssertion('<any> when delayed a little bit <assertion>', function (expect, subject) {
        return expect.promise(function (run) {
            setTimeout(run(function () {
                return expect.shift();
            }), 1);
        });
    }).addAssertion('<any> when delayed <number> <assertion>', function (expect, subject, value) {
        return expect.promise(function (run) {
            setTimeout(run(function () {
                return expect.shift();
            }), value);
        });
    });

    describe('argument validation', function () {
        it('fails when given no parameters', function () {
            expect(function () {
                expect();
            }, 'to throw', 'The expect function requires at least two parameters.');
        });

        it('fails when given only one parameter', function () {
            expect(function () {
                expect({});
            }, 'to throw', 'The expect function requires at least two parameters.');
        });

        it('fails when the second parameter is not a string', function () {
            expect(function () {
                expect({}, {});
            }, 'to throw', 'The expect function requires the second parameter to be a string.');
        });
    });

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

    it('throws if the assertion does not exist', function () {
        expect(function () {
            expect({}, "to bee", 2);
        }, 'to throw exception', "Unknown assertion 'to bee', did you mean: 'to be'");
    });

    describe('expect', function () {
        it('should catch non-Unexpected error caught from a nested assertion', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject) {
                return expect(subject, 'to bar');
            }).addAssertion('to bar', function (expect, subject) {
                return expect.promise(function (run) {
                    setTimeout(run(function () {
                        throw new Error('foo');
                    }), 1);
                });
            });

            return expect(function () {
                return clonedExpect('bar', 'to foo');
            }, 'to error', new Error('foo'));
        });

        it('should make the wrapped expect available as the context (legacy)', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject) {
                this.errorMode = 'nested';
                expect(this, 'to be', expect);
            });

            return expect(function () {
                return clonedExpect(undefined, 'to foo');
            }, 'not to error');
        });
    });

    describe('expect.it', function () {
        it('returns an expectation function that when applyed runs the assertion on the given subject', function () {
            var expectation = expect.it('to be greater than', 14);
            expectation(20);
            expect(function () {
                expectation(10);
            }, 'to throw', 'expected 10 to be greater than 14');
        });

        it('is inspected as it is written', function () {
            var expectation = expect.it('to be a number')
                                        .and('to be less than', 14)
                                        .and('to be negative')
                                    .or('to be a string')
                                        .and('to have length', 6);
            expect(expect.inspect(expectation).toString(), 'to equal',
                   "expect.it('to be a number')\n" +
                   "        .and('to be less than', 14)\n" +
                   "        .and('to be negative')\n" +
                   "      .or('to be a string')\n" +
                   "        .and('to have length', 6)");

        });

        it('does not catch errors that are not thrown by unexpected', function () {
            var clonedExpect = expect.clone().addAssertion('explode', function (expect, subject) {
                throw new Error('Explosion');
            });

            expect(clonedExpect.it('explode'), 'to throw', 'Explosion');
        });

        describe('with chained and', function () {
            it('all assertions has to be satisfied', function () {
                var expectation = expect.it('to be a number')
                    .and('to be less than', 14)
                    .and('to be negative');
                expect(function () {
                    expectation(20);
                }, 'to throw',
                       "✓ expected 20 to be a number and\n" +
                       "⨯ expected 20 to be less than 14 and\n" +
                       "⨯ expected 20 to be negative");
            });

            it('returns a new function', function () {
                var expectation = expect.it('to be a number');
                var compositeExpectation = expectation.and('to be less than', 14);
                expect(compositeExpectation, 'not to be', expectation);

                expectation(20);
                expect(function () {
                    compositeExpectation(20);
                }, 'to throw',
                       '✓ expected 20 to be a number and\n' +
                       '⨯ expected 20 to be less than 14');
            });

            it('outputs one failing assertion correctly', function () {
                var expectation = expect.it('to be a number')
                    .and('to be less than', 14)
                    .and('to be negative');
                expect(function () {
                    expectation(8);
                }, 'to throw',
                       '✓ expected 8 to be a number and\n' +
                       '✓ expected 8 to be less than 14 and\n' +
                       '⨯ expected 8 to be negative');
            });
        });

        describe('with chained or', function () {
            it('succeeds if any expectations succeeds', function () {
                var expectation = expect.it('to be a number')
                    .or('to be a string')
                    .or('to be an array');
                expect(function () {
                    expectation('success');
                }, 'not to throw');
            });

            it('fails if all the expectations fails', function () {
                var expectation = expect.it('to be a number')
                      .and('to be greater than', 6)
                    .or('to be a string')
                      .and('to have length', 6)
                    .or('to be an array');
                expect(function () {
                    expectation('foobarbaz');
                }, 'to throw',
                       "⨯ expected 'foobarbaz' to be a number and\n" +
                       "⨯ expected 'foobarbaz' to be greater than 6\n" +
                       "or\n" +
                       "✓ expected 'foobarbaz' to be a string and\n" +
                       "⨯ expected 'foobarbaz' to have length 6\n" +
                       "    expected 9 to be 6\n" +
                       "or\n" +
                       "⨯ expected 'foobarbaz' to be an array");
            });

            it('if there are no and-clauses it writes the failure output more compactly', function () {
                var expectation = expect.it('to be a number')
                    .or('to be a string')
                    .or('to be an array');
                expect(function () {
                    expectation(true);
                }, 'to throw',
                       "⨯ expected true to be a number or\n" +
                       "⨯ expected true to be a string or\n" +
                       "⨯ expected true to be an array");
            });

            it('returns a new function', function () {
                var expectation = expect.it('to be a number');
                var compositeExpectation = expectation.or('to be a string');
                expect(compositeExpectation, 'not to be', expectation);

                expectation(20);
                expect(function () {
                    compositeExpectation(20);
                    compositeExpectation(true);
                }, 'to throw',
                       '⨯ expected true to be a number or\n' +
                       '⨯ expected true to be a string');
            });
        });

        describe('with async assertions', function () {
            var clonedExpect = expect.clone()
                .addAssertion('to be a number after a short delay', function (expect, subject) {
                    expect.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a number');
                        }), 1);
                    });
                })
                .addAssertion('to be finite after a short delay', function (expect, subject) {
                    expect.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be finite');
                        }), 1);
                    });
                })
                .addAssertion('to be a string after a short delay', function (expect, subject) {
                    expect.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be a string');
                        }), 1);
                    });
                });

            it('should succeed', function () {
                return clonedExpect.it('to be a number after a short delay')(123);
            });

            it('should fail with a diff', function () {
                return expect(
                    clonedExpect.it('to be a number after a short delay')(false),
                    'to be rejected with',
                        'expected false to be a number after a short delay\n' +
                        '  expected false to be a number'
                );
            });

            describe('with a chained "and" construct', function () {
                it('should succeed', function () {
                    return clonedExpect
                        .it('to be a number after a short delay')
                        .and('to be finite after a short delay')(123);
                });

                it('should fail with a diff', function () {
                    return expect(
                        clonedExpect
                            .it('to be a number after a short delay')
                            .and('to be finite after a short delay')(false),
                        'to be rejected with',
                            '⨯ expected false to be a number after a short delay and\n' +
                            '    expected false to be a number\n' +
                            '⨯ expected false to be finite after a short delay'
                    );
                });
            });

            describe('with a chained "or" construct', function () {
                it('should succeed', function () {
                    return clonedExpect
                        .it('to be a number after a short delay')
                            .and('to be finite after a short delay')
                        .or('to be a string after a short delay')('abc');
                });

                it('should fail with a diff', function () {
                    return expect(
                        clonedExpect
                            .it('to be a number after a short delay')
                                .and('to be finite after a short delay')
                            .or('to be a string after a short delay')(false),
                        'to be rejected with',
                            '⨯ expected false to be a number after a short delay and\n' +
                            '    expected false to be a number\n' +
                            '⨯ expected false to be finite after a short delay\n' +
                            'or\n' +
                            '⨯ expected false to be a string after a short delay\n' +
                            '    expected false to be a string'
                    );
                });
            });
        });
    });

    describe('diffs', function () {
        describe('on strings', function () {
            it('highlights unexpected extra newlines after the input', function () {
                expect(function () {
                    expect('foo\n', 'to equal', 'foo');
                }, 'to throw',
                       "expected 'foo\\n' to equal 'foo'\n" +
                       "\n" +
                       "-foo\\n\n" +
                       "+foo");
            });

            it('highlights missing newlines after the input', function () {
                expect(function () {
                    expect('foo', 'to equal', 'foo\n');
                }, 'to throw',
                       "expected 'foo' to equal 'foo\\n'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\n");
            });

            it('highlights unexpected carriage returns', function () {
                expect(function () {
                    expect('foo\r\nbar', 'to equal', 'foo\nbar');
                }, 'to throw',
                       "expected 'foo\\r\\nbar' to equal 'foo\\nbar'\n" +
                       "\n" +
                       "-foo\\r\n" +
                       "+foo\n" +
                       " bar");

                expect(function () {
                    expect('foo\r\n', 'to equal', 'foo\n');
                }, 'to throw',
                       "expected 'foo\\r\\n' to equal 'foo\\n'\n" +
                       "\n" +
                       "-foo\\r\n" +
                       "+foo");

                expect(function () {
                    expect('foo\r\n', 'to equal', 'foo');
                }, 'to throw',
                       "expected 'foo\\r\\n' to equal 'foo'\n" +
                       "\n" +
                       "-foo\\r\\n\n" +
                       "+foo");
            });

            it('highlights missing carriage returns', function () {
                expect(function () {
                    expect('foo\nbar', 'to equal', 'foo\r\nbar');
                }, 'to throw',
                       "expected 'foo\\nbar' to equal 'foo\\r\\nbar'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\r\n" +
                       " bar");

                expect(function () {
                    expect('foo\n', 'to equal', 'foo\r\n');
                }, 'to throw',
                       "expected 'foo\\n' to equal 'foo\\r\\n'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\r");

                expect(function () {
                    expect('foo', 'to equal', 'foo\r\n');
                }, 'to throw',
                       "expected 'foo' to equal 'foo\\r\\n'\n" +
                       "\n" +
                       "-foo\n" +
                       "+foo\\r\\n");
            });

            it('matching carriage returns are not highlighted', function () {
                expect(function () {
                    expect('foo\r\nbar', 'to equal', 'foo\r\nbaz');
                }, 'to throw',
                       "expected 'foo\\r\\nbar' to equal 'foo\\r\\nbaz'\n" +
                       "\n" +
                       " foo\r\n" +
                       "-bar\n" +
                       "+baz");
            });

            it('should show a \\r\\n line as removed', function () {
                expect(function () {
                    expect('foo\r\n\r\nbar', 'to equal', 'foo\r\nbar');
                }, 'to throw',
                       "expected 'foo\\r\\n\\r\\nbar' to equal 'foo\\r\\nbar'\n" +
                       "\n" +
                       " foo\r\n" +
                       "-\\r\n" +
                       " bar");
            });

            it('should show an empty removed line', function () {
                expect(function () {
                    expect('foo\n\nbar', 'to equal', 'foo\nbar');
                }, 'to throw',
                       "expected 'foo\\n\\nbar' to equal 'foo\\nbar'\n" +
                       "\n" +
                       " foo\n" +
                       "-\n" +
                       " bar");
            });

            it('should show a missing empty line', function () {
                expect(function () {
                    expect('foo\nbar', 'to equal', 'foo\n\nbar');
                }, 'to throw',
                       "expected 'foo\\nbar' to equal 'foo\\n\\nbar'\n" +
                       "\n" +
                       " foo\n" +
                       "+\n" +
                       " bar");
            });

            it('should show missing content when comparing to the empty string', function () {
                expect(function () {
                    expect('', 'to equal', 'foo\nbar');
                }, 'to throw',
                       "expected '' to equal 'foo\\nbar'\n" +
                       "\n" +
                       "+foo\n" +
                       "+bar");
            });

            it('should show unexpected content when comparing to the empty string', function () {
                expect(function () {
                    expect('foo\nbar', 'to equal', '');
                }, 'to throw',
                       "expected 'foo\\nbar' to equal ''\n" +
                       "\n" +
                       "-foo\n" +
                       "-bar");
            });
        });

        describe('on objects', function () {
            it('should not collapse parts containing conflicts', function () {
                expect(function () {
                    expect({
                        bar: {
                            b: {foo: {bar: 123}}
                        }
                    }, 'to equal', {
                        bar: {}
                    });
                }, 'to throw', 'expected { bar: { b: { foo: ... } } } to equal { bar: {} }\n' +
                       '\n' +
                       '{\n' +
                       '  bar: {\n' +
                       '    b: { foo: { bar: 123 } } // should be removed\n' +
                       '  }\n' +
                       '}');
            });

            it('should quote property names that require it', function () {
                expect(function () {
                    expect({
                        'the-\'thing': 123
                    }, 'to equal', {
                        'the-\'thing': 456
                    });
                }, 'to throw', "expected { 'the-\\'thing': 123 } to equal { 'the-\\'thing': 456 }\n" +
                       '\n' +
                       '{\n' +
                       "  'the-\\'thing': 123 // should equal 456\n" +
                       '}');
            });

            it('can contain nested string diffs', function () {
                expect(function () {
                    expect({
                        value: 'bar'
                    }, 'to equal', {
                        value: 'baz'
                    });
                }, 'to throw', "expected { value: 'bar' } to equal { value: 'baz' }\n" +
                       "\n" +
                       "{\n" +
                       "  value: 'bar' // should equal 'baz'\n" +
                       "               // -bar\n" +
                       "               // +baz\n" +
                       "}");
            });

            it('highlights properties that has been removed', function () {
                expect(function () {
                    expect({
                        foo: 'foo',
                        bar: 'bar',
                        baz: 'baz'
                    }, 'to equal', {
                        bar: 'bar',
                        baz: 'baz'
                    });
                }, 'to throw', "expected { foo: 'foo', bar: 'bar', baz: 'baz' } to equal { bar: 'bar', baz: 'baz' }\n" +
                       "\n" +
                       "{\n" +
                       "  foo: 'foo', // should be removed\n" +
                       "  bar: 'bar',\n" +
                       "  baz: 'baz'\n" +
                       "}");
            });

            it('highlights missing properties', function () {
                expect(function () {
                    expect({
                        one: 1,
                        three: 3
                    }, 'to equal', {
                        one: 1,
                        two: 2,
                        three: 3
                    });
                }, 'to throw', "expected { one: 1, three: 3 } to equal { one: 1, two: 2, three: 3 }\n" +
                       "\n" +
                       "{\n" +
                       "  one: 1,\n" +
                       "  three: 3\n" +
                       "  // missing two: 2\n" +
                       "}");
            });

            it('highlights properties with an unexpected value', function () {
                expect(function () {
                    expect({
                        one: 1,
                        two: 42,
                        three: 3
                    }, 'to equal', {
                        one: 1,
                        two: 2,
                        three: 3
                    });
                }, 'to throw', "expected { one: 1, two: 42, three: 3 } to equal { one: 1, two: 2, three: 3 }\n" +
                       "\n" +
                       "{\n" +
                       "  one: 1,\n" +
                       "  two: 42, // should equal 2\n" +
                       "  three: 3\n" +
                       "}");
            });

            it('can contain nested object diffs for properties', function () {
                expect(function () {
                    expect({
                        one: { two: { three: 4 } }
                    }, 'to equal', {
                        one: { two: { three: 3 } }
                    });
                }, 'to throw', "expected { one: { two: { three: 4 } } } to equal { one: { two: { three: 3 } } }\n" +
                       "\n" +
                       "{\n" +
                       "  one: {\n" +
                       "    two: {\n" +
                       "      three: 4 // should equal 3\n" +
                       "    }\n" +
                       "  }\n" +
                       "}");
            });

            it('collapses subtrees without conflicts', function () {
                expect(function () {
                    expect({
                        pill: {
                            red: "I'll show you how deep the rabbit hole goes",
                            blue: { ignorance: { of:  'illusion' } }
                        }
                    }, 'to equal', {
                        pill: {
                            red: "I'll show you how deep the rabbit hole goes.",
                            blue: { ignorance: { of:  'illusion' } }
                        }
                    });
                }, 'to throw',
                       "expected\n" +
                       "{\n" +
                       "  pill: {\n" +
                       "    red: 'I\\'ll show you how deep the rabbit hole goes',\n" +
                       "    blue: { ignorance: ... }\n" +
                       "  }\n" +
                       "}\n" +
                       "to equal\n" +
                       "{\n" +
                       "  pill: {\n" +
                       "    red: 'I\\'ll show you how deep the rabbit hole goes.',\n" +
                       "    blue: { ignorance: ... }\n" +
                       "  }\n" +
                       "}\n" +
                       "\n" +
                       "{\n" +
                       "  pill: {\n" +
                       "    red: 'I\\'ll show you how deep the rabbit hole goes', // should equal 'I\\'ll show you how deep the rabbit hole goes.'\n" +
                       "                                                         // -I'll show you how deep the rabbit hole goes\n" +
                       "                                                         // +I'll show you how deep the rabbit hole goes.\n" +
                       "    blue: { ignorance: { of: 'illusion' } }\n" +
                       "  }\n" +
                       "}");
            });

            it('highlights mismatching constructors', function () {
                function Foo(text) {
                    this.text = text;
                }

                function Bar(text) {
                    this.text = text;
                }

                expect(function () {
                    expect(new Foo('test'), 'to equal', new Bar('test'));
                }, 'to throw', "expected Foo({ text: 'test' }) to equal Bar({ text: 'test' })\n" +
                       "\n" +
                       "Mismatching constructors Foo should be Bar");
            });
        });

        describe('on arrays', function () {
            it('suppresses array diff for large arrays', function () {
                expect(function () {
                    var a = new Array(513),
                    b = new Array(513);
                    a[0] = 1;
                    b[0] = 2;
                    expect(
                        a,
                        'to equal',
                        b
                    );
                }, 'to throw', /Diff suppressed due to size > 512/);
            });

            it('highlights unexpected entries', function () {
                expect(function () {
                    expect([0, 1, 2], 'to equal', [0, 2]);
                }, 'to throw', 'expected [ 0, 1, 2 ] to equal [ 0, 2 ]\n' +
                       '\n' +
                       '[\n' +
                       '  0,\n' +
                       '  1, // should be removed\n' +
                       '  2\n' +
                       ']'
                      );
            });

            it('highlights missing entries', function () {
                expect(function () {
                    expect([0, 2], 'to equal', [0, 1, 2]);
                }, 'to throw', 'expected [ 0, 2 ] to equal [ 0, 1, 2 ]\n' +
                       '\n' +
                       '[\n' +
                       '  0,\n' +
                       '  // missing 1\n' +
                       '  2\n' +
                       ']'
                      );
            });

            it('omits comma after last actual entry', function () {
                expect(function () {
                    expect([0], 'to equal', [0, 1]);
                }, 'to throw', 'expected [ 0 ] to equal [ 0, 1 ]\n' +
                       '\n' +
                       '[\n' +
                       '  0\n' +
                       '  // missing 1\n' +
                       ']'
                      );
            });

            it('handles complicated similarities', function () {
                expect(function () {
                    expect([4, 3, 1, 2], 'to equal', [1, 2, 3, 4]);
                }, 'to throw', 'expected [ 4, 3, 1, 2 ] to equal [ 1, 2, 3, 4 ]\n' +
                       '\n' +
                       '[\n' +
                       "  4, // should equal 1\n" +
                       "  3, // should equal 2\n" +
                       "  1, // should equal 3\n" +
                       "  2 // should equal 4\n" +
                       ']'
                      );

                expect(function () {
                    expect([4, 1, 2, 3], 'to equal', [1, 2, 3, 4]);
                }, 'to throw', 'expected [ 4, 1, 2, 3 ] to equal [ 1, 2, 3, 4 ]\n' +
                       '\n' +
                       '[\n' +
                       "  4, // should equal 1\n" +
                       "  1, // should equal 2\n" +
                       "  2, // should equal 3\n" +
                       "  3 // should equal 4\n" +
                       ']'
                      );

                expect(function () {
                    expect([1, 2, 3, 0], 'to equal', [0, 1, 2, 3]);
                }, 'to throw',
                       "expected [ 1, 2, 3, 0 ] to equal [ 0, 1, 2, 3 ]\n" +
                       "\n" +
                       "[\n" +
                       "  // missing 0\n" +
                       "  1,\n" +
                       "  2,\n" +
                       "  3,\n" +
                       "  0 // should be removed\n" +
                       "]");

                expect(function () {
                    expect([4, 3, 1, 2], 'to equal', [3, 4]);
                }, 'to throw', 'expected [ 4, 3, 1, 2 ] to equal [ 3, 4 ]\n' +
                       '\n' +
                       '[\n' +
                       '  4, // should equal 3\n' +
                       '  3, // should equal 4\n' +
                       '  1, // should be removed\n' +
                       '  2 // should be removed\n' +
                       ']'
                      );
            });


            it('highlights conflicting entries', function () {
                expect(function () {
                    expect([0, 'once', 2], 'to equal', [0, 'one', 2]);
                }, 'to throw', "expected [ 0, 'once', 2 ] to equal [ 0, 'one', 2 ]\n" +
                       "\n" +
                       "[\n" +
                       "  0,\n" +
                       "  'once', // should equal 'one'\n" +
                       "          // -once\n" +
                       "          // +one\n" +
                       "  2\n" +
                       "]"
                      );
            });

            it('considers object with a similar structure candidates for diffing', function () {
                expect(function () {
                    expect([0, 1, { name: 'John', age: 34 }, 3, 2], 'to equal', [0, { name: 'Jane', age: 24, children: 2 }, 3, 2]);
                }, 'to throw',
                       "expected [ 0, 1, { name: 'John', age: 34 }, 3, 2 ]\n" +
                       "to equal [ 0, { name: 'Jane', age: 24, children: 2 }, 3, 2 ]\n" +
                       "\n" +
                       "[\n" +
                       "  0,\n" +
                       "  1, // should be removed\n" +
                       "  {\n" +
                       "    name: 'John', // should equal 'Jane'\n" +
                       "                  // -John\n" +
                       "                  // +Jane\n" +
                       "    age: 34 // should equal 24\n" +
                       "    // missing children: 2\n" +
                       "  },\n" +
                       "  3,\n" +
                       "  2\n" +
                       "]");
            });

            it('does not considers object with a different structure candidates for diffing', function () {
                expect(function () {
                    expect([0, 1, { name: 'John'}, 3, 2], 'to equal', [0, { firstName: 'John', lastName: 'Doe' }, 3, 2]);
                }, 'to throw',
                       "expected [ 0, 1, { name: 'John' }, 3, 2 ]\n" +
                       "to equal [ 0, { firstName: 'John', lastName: 'Doe' }, 3, 2 ]\n" +
                       "\n" +
                       "[\n" +
                       "  0,\n" +
                       "  // missing { firstName: 'John', lastName: 'Doe' }\n" +
                       "  1, // should be removed\n" +
                       "  { name: 'John' }, // should be removed\n" +
                       "  3,\n" +
                       "  2\n" +
                       "]");
            });

            it('considers similar strings candidates for diffing', function () {
                expect(function () {
                    expect(['twoo', 1, 3, 4, 5], 'to equal', [0, 1, 'two', 3, 4, 5]);
                }, 'to throw',
                       "expected [ 'twoo', 1, 3, 4, 5 ] to equal [ 0, 1, 'two', 3, 4, 5 ]\n" +
                       "\n" +
                       "[\n" +
                       "  // missing 0\n" +
                       "  // missing 1\n" +
                       "  'twoo', // should equal 'two'\n" +
                       "          // -twoo\n" +
                       "          // +two\n" +
                       "  1, // should be removed\n" +
                       "  3,\n" +
                       "  4,\n" +
                       "  5\n" +
                       "]");
            });

            it('does not considers different strings candidates for diffing', function () {
                expect(function () {
                    expect(['tw00', 1, 3, 4, 5], 'to equal', [0, 1, 'two', 3, 4, 5]);
                }, 'to throw',
                       "expected [ 'tw00', 1, 3, 4, 5 ] to equal [ 0, 1, 'two', 3, 4, 5 ]\n" +
                       "\n" +
                       "[\n" +
                       "  // missing 0\n" +
                       "  'tw00', // should be removed\n" +
                       "  1,\n" +
                       "  // missing 'two'\n" +
                       "  3,\n" +
                       "  4,\n" +
                       "  5\n" +
                       "]");
            });

            it('handles similar objects with no diff defined for custom type', function () {
                function Person(firstName, lastName) {
                    this.firstName = firstName;
                    this.lastName = lastName;
                }

                var clonedExpect = expect.clone()
                    .addType({
                        name: 'Person',
                        identify: function (value) {
                            return value instanceof Person;
                        },
                        equal: function (a, b) {
                            return a.firstName === b.firstName &&
                                a.lastName === b.lastName;
                        },
                        inspect: function (person, depth, output) {
                            return output.text("new Person('").text(person.firstName).text("', '").text(person.lastName).text("')");
                        },
                        diff: function () {
                            return null;
                        }
                    });


                expect(function () {
                    clonedExpect([new Person('John', 'Doe')], 'to equal', [new Person('Jane', 'Doe')]);
                }, 'to throw', "expected [ new Person('John', 'Doe') ] to equal [ new Person('Jane', 'Doe') ]\n" +
                       "\n" +
                       "[\n" +
                       "  new Person('John', 'Doe') // should equal new Person('Jane', 'Doe')\n" +
                       "]");
            });

            describe('sparse arrays', function () {
                it('elem was sparse', function () {
                    expect(function () {
                        var sparse = [];
                        sparse[1] = 2;
                        sparse[2] = 3;
                        expect(sparse, 'to equal', [1, 2, 3]);
                    }, 'to throw', 'expected [ , 2, 3 ] to equal [ 1, 2, 3 ]\n' +
                           '\n' +
                           '[\n' +
                           '  undefined, // should equal 1\n' +
                           '  2,\n' +
                           '  3\n' +
                           ']');
                });
                it('elem should be sparse', function () {
                    expect(function () {
                        var sparse = [];
                        sparse[1] = 2;
                        sparse[2] = 3;
                        expect([1, 2, 3], 'to equal', sparse);
                    }, 'to throw', 'expected [ 1, 2, 3 ] to equal [ , 2, 3 ]\n' +
                           '\n' +
                           '[\n' +
                           '  1, // should be undefined\n' +
                           '  2,\n' +
                           '  3\n' +
                           ']');
                });
            });
        });
    });

    it('makes expect.it available inside a custom assertion', function () {
        var clonedExpect = expect.clone();
        clonedExpect.addAssertion('to foo', function (expect, subject) {
            expect.it('to equal', 'foo')(subject);
        });
        clonedExpect('foo', 'to foo');
        expect(function () {
            clonedExpect('bar', 'to foo');
        }, 'to throw',
               "expected 'bar' to equal 'foo'\n" +
               '\n' +
               '-bar\n' +
               '+foo');
    });

    describe('expect.shift', function () {
        describe('when preserving the subject by passing no arguments', function () {
            it('should succeed', function () {
                var clonedExpect = expect.clone().addAssertion('<string> blabla <assertion>', function (expect, subject) {
                    return expect.shift();
                });
                clonedExpect('foo', 'blabla', 'to equal', 'foo');
            });

            it('should fail with a diff', function () {
                var clonedExpect = expect.clone().addAssertion('<string> blabla <assertion>', function (expect, subject) {
                    return expect.shift();
                });
                expect(function () {
                    clonedExpect('foo', 'blabla', 'to equal', 'foobar');
                }, 'to throw',
                  "expected 'foo' blabla to equal 'foobar'\n" +
                  "\n" +
                  "-foo\n" +
                  "+foobar"
                );
            });
        });

        it('should support calling shift multiple times', function () {
            var clonedExpect = expect.clone().addAssertion('<number> up to [and including] <number> <assertion>', function (expect, subject, value) {
                expect.errorMode = 'nested';
                var numbers = [];
                for (var i = subject ; i < (expect.flags['and including'] ? value + 1 : value) ; i += 1) {
                    numbers.push(i);
                }
                return expect.promise.all(numbers.map(function (number) {
                    return expect.promise(function () {
                        return expect.shift(number);
                    });
                }));
            });

            return expect(function () {
                clonedExpect(5, 'up to and including', 100, 'to be within', 1, 90);
            }, 'to error',
                'expected 5 up to and including 100 to be within 1, 90\n' +
                '  expected 91 to be within 1..90'
            );
        });

        describe('when substituting a different subject by passing a single argument', function () {
            it('should succeed', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when appended with bar <assertion>', function (expect, subject) {
                    return expect.shift(subject + 'bar');
                });
                clonedExpect('foo', 'when appended with bar', 'to equal', 'foobar');
            });

            it('should fail with a diff', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when appended with bar <assertion>', function (expect, subject) {
                    return expect.shift(subject + 'bar');
                });
                expect(function () {
                    clonedExpect('crow', 'when appended with bar', 'to equal', 'foobar');
                }, 'to throw',
                  "expected 'crow' when appended with bar to equal 'foobar'\n" +
                  "\n" +
                  "-crowbar\n" +
                  "+foobar"
                );
            });
        });

        it('should identify the assertions even when the next assertion fails before shifting', function () {
            var clonedExpect = expect.clone().addAssertion('<string> when appended with bar <assertion>', function (expect, subject) {
                if (subject === 'crow') {
                    expect.fail();
                }
                return expect.shift(subject + 'bar');
            });
            expect(function () {
                clonedExpect('crow', 'when appended with bar', 'when appended with bar', 'to equal', 'foobarbar');
            }, 'to throw',
              "expected 'crow' when appended with bar when appended with bar to equal 'foobarbar'"
          );
        });

        it('supports the legacy 3 argument version', function () {
            var clonedExpect = expect.clone().addAssertion('<string> when prepended with foo <assertion>', function (expect, subject) {
                return this.shift(expect, 'foo' + subject, 0);
            });
            clonedExpect('foo', 'when prepended with foo', expect.it('to equal', 'foofoo'));
        });

        describe('with the legacy 2 argument version', function () {
            it('inspects multiple arguments correctly', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when surrounded by <string> <string> <assertion>', function (expect, subject) {
                    return expect.shift('foo' + subject, 2);
                });

                return expect(function () {
                    clonedExpect('bar', 'when surrounded by', 'foo', 'quux', 'to be a number');
                }, 'to throw',
                    "expected 'bar' when surrounded by 'foo', 'quux' to be a number"
                );
            });
        });

        describe('with an expect.it function as the next argument', function () {
            it('should succeed', function () {
                var clonedExpect = expect.clone().addAssertion('<string> when prepended with foo <assertion>', function (expect, subject) {
                    return expect.shift('foo' + subject);
                });
                clonedExpect('foo', 'when prepended with foo', expect.it('to equal', 'foofoo'));
            });
        });

        it('should fail when the next argument is a non-expect.it function', function () {
            var clonedExpect = expect.clone().addAssertion('<string> when prepended with foo <assertion>', function (expect, subject) {
                return expect.shift('foo' + subject);
            });
            expect(function () {
                clonedExpect('foo', 'when prepended with foo', function () {});
            }, 'to throw',
                "expected 'foo' when prepended with foo function () {}\n" +
                "  No matching assertion, did you mean:\n" +
                "  <string> when prepended with foo <assertion>"
            );
        });

        describe('with an async assertion', function () {
            it('should succeed', function () {
                return expect(42, 'when delayed a little bit', 'to be a number');
            });

            it('should fail with a diff', function () {
                return expect(
                    expect(false, 'when delayed a little bit', 'to be a number'),
                    'to be rejected with',
                    'expected false when delayed a little bit to be a number'
                );
            });
        });
    });

    describe('async', function () {
        var clonedExpect;
        before(function () {
            clonedExpect = expect.clone()
                .addAssertion('to be sorted after delay', function (expect, subject, delay) {
                    expect.errorMode = 'nested';

                    return expect.promise(function (run) {
                        setTimeout(run(function () {
                            expect(subject, 'to be an array');
                            expect(subject, 'to equal', [].concat(subject).sort());
                        }), delay);
                    });
                })
                .addAssertion('to be ordered after delay', function (expect, subject) {
                    expect.errorMode = 'nested';
                    return expect(subject, 'to be sorted after delay', 20);
                })
                .addAssertion('im sync', function (expect, subject) {
                    return expect.promise(function (run) {
                        run(function () {
                            expect(subject, 'to be', 24);
                        })();
                    });
                });
        });


        it('fails if it is called without a callback', function () {
            expect(function () {
                expect.async();
            }, 'to throw', /expect.async requires a callback without arguments./);

            expect(function () {
                expect.async('adsf');
            }, 'to throw', /expect.async requires a callback without arguments./);
        });

        it('fails if the returned function is not called with a done callback', function () {
            expect(function () {
                expect.async(function () {})();
            }, 'to throw', /expect.async should be called in the context of an it-block/);

            expect(function () {
                expect.async(function () {})('foo');
            }, 'to throw', /expect.async should be called in the context of an it-block/);
        });

        it('fails if is called within a asynchronous context', function () {
            expect(function () {
                function done() {}
                expect.async(function () {
                    expect.async(function () {
                    })(done);
                })(done);
            }, 'to throw', /expect.async can't be within a expect.async context./);
        });

        it('fails if the callback does not return a promise or throws', function () {
            expect(function () {
                function done() {}
                expect.async(function () {
                })(done);
            }, 'to throw', /expect.async requires the block to return a promise or throw an exception./);

            expect(function () {
                function done() {}
                expect.async(function () {
                    return {};
                })(done);
            }, 'to throw', /expect.async requires the block to return a promise or throw an exception./);
        });

        it('supports composition', expect.async(function () {
            return expect(
                clonedExpect([1, 3, 2], 'to be ordered after delay'),
                'to be rejected with',
                    'expected [ 1, 3, 2 ] to be ordered after delay\n' +
                    '  expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
                    '    expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
                    '\n' +
                    '    [\n' +
                    '      1,\n' +
                    '      3, // should equal 2\n' +
                    '      2 // should equal 3\n' +
                    '    ]'
            );
        }));

        it('has a nice syntax', expect.async(function () {
            return expect(
                clonedExpect([1, 3, 2], 'to be sorted after delay', 20),
                'to be rejected with',
                    'expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
                    '  expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
                    '\n' +
                    '  [\n' +
                    '    1,\n' +
                    '    3, // should equal 2\n' +
                    '    2 // should equal 3\n' +
                    '  ]'
            );
        }));

        it('tests that assertions that returns promises are converted to exceptions if they are sync', function () {
            expect(function () {
                clonedExpect(42, 'im sync');
            }, 'to throw', 'expected 42 im sync');
        });

        it.skipIf(!workQueue, 'throw an unhandled rejection if a promise is not caught by the test', function (done) {
            workQueue.onUnhandledRejection = function (err) {
                expect(err.getErrorMessage({ format: 'text' }).toString(), 'to equal',
                    'expected [ 1, 3, 2 ] to be ordered after delay\n' +
                    '  expected [ 1, 3, 2 ] to be sorted after delay 20\n' +
                    '    expected [ 1, 3, 2 ] to equal [ 1, 2, 3 ]\n' +
                    '\n' +
                    '    [\n' +
                    '      1,\n' +
                    '      3, // should equal 2\n' +
                    '      2 // should equal 3\n' +
                    '    ]');

                workQueue.onUnhandledRejection = null;
                done();
            };

            clonedExpect([1, 3, 2], 'to be ordered after delay');
        });
    });

    describe('expect.promise', function () {
        it('should forward non-unexpected errors', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.withError(function () {
                    return expect.promise(function () {
                        return expect.promise.any([
                            expect.promise(function () {
                                expect(subject, 'to be', 24);
                            }),
                            expect.promise(function () {
                                throw new Error('wat');
                            })
                        ]);
                    });
                }, function (e) {
                    // success
                });
            });
            expect(function () {
                clonedExpect(42, 'to foo');
            }, 'to throw', 'wat');
        });

        it('should return the fulfilled promise even if it is oathbreakable', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.promise(function () {
                    expect(subject, 'to equal', 'foo');
                    return 'bar';
                });
            });
            expect(clonedExpect('foo', 'to foo'), 'to be fulfilled with', 'bar');
        });

        it('should preserve the resolved value when an assertion contains a non-oathbreakable promise', function (done) {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                return expect.promise(function (resolve, reject) {
                    expect(subject, 'to equal', 'foo');
                    setTimeout(function () {
                        resolve('bar');
                    }, 1);
                });
            });
            clonedExpect('foo', 'to foo').then(function (value) {
                expect(value, 'to equal', 'bar');
                done();
            });
        });

        it('should return a promise fulfilled with the return value when an assertion returns a non-promise value', function () {
            var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject, value) {
                expect(subject, 'to equal', 'foo');
                return 'bar';
            });
            clonedExpect('foo', 'to foo').then(function (value) {
                expect(value, 'to equal', 'bar');
            });
        });

        describe('#and', function () {
            describe('with a synchronous assertion', function () {
                it('should succeed', function () {
                    return expect('foo', 'to equal', 'foo').and('to be a string');
                });

                it('should succeed when another clause is added', function () {
                    return expect('foo', 'to equal', 'foo').and('to be a string').and('to match', /^f/);
                });

                it('should work without returning the promise', function () {
                    expect('foo', 'to equal', 'foo').and('to be a string');
                });

                it('should fail with a diff', function () {
                    return expect(function () {
                        return expect('foo', 'to equal', 'foo').and('to be a number');
                    }, 'to error', "expected 'foo' to be a number");
                });

                it('should fail with a diff even when the promise is not returned', function () {
                    return expect(function () {
                        expect('foo', 'to equal', 'foo').and('to be a number');
                    }, 'to error', "expected 'foo' to be a number");
                });

                describe('with an expect.it as the second clause', function () {
                    it('should succeed', function () {
                        return expect('foo', 'to equal', 'foo').and(expect.it('to be a string'));
                    });

                    it('should fail with a diff', function () {
                        return expect(function () {
                            return expect('foo', 'to equal', 'foo').and(expect.it('to be a number'));
                        }, 'to error', "expected 'foo' to be a number");
                    });
                });
            });

            describe('with an asynchronous assertion anded with a synchronous one', function () {
                it('should succeed', function () {
                    return expect('foo', 'when delayed', 5, 'to equal', 'foo').and('to be a string');
                });

                it('should succeed when another clause is added', function () {
                    return expect('foo', 'when delayed', 5, 'to equal', 'foo').and('when delayed', 5, 'to be a string').and('when delayed', 2, 'to be a string');
                });

                it('should fail with a diff when the asynchronous assertion fails', function () {
                    return expect(function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'bar').and('to be a string');
                    }, 'to error',
                        "expected 'foo' when delayed 5 to equal 'bar'\n" +
                        "\n" +
                        "-foo\n" +
                        "+bar"
                    );
                });

                it('should fail with a diff when the synchronous assertion fails', function () {
                    return expect(function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and('to be a number');
                    }, 'to error', "expected 'foo' to be a number");
                });

                it('should fail with a diff when both assertions fail', function () {
                    return expect(function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'bar').and('to be a number');
                    }, 'to error',
                        "expected 'foo' when delayed 5 to equal 'bar'\n" +
                        "\n" +
                        "-foo\n" +
                        "+bar"
                    );
                });

                describe('with an expect.it as the second clause', function () {
                    it('should succeed', function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(expect.it('to be a string'));
                    });

                    it('should succeed when more clauses are added', function () {
                        return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(expect.it('to be a string')).and('to be a string').and('to be a string');
                    });

                    it('should fail with a diff', function () {
                        return expect(function () {
                            return expect('foo', 'when delayed', 5, 'to equal', 'foo').and(expect.it('to be a number'));
                        }, 'to error', "expected 'foo' to be a number");
                    });
                });
            });

            describe('with a nested asynchronous assertion', function () {
                it('should mount the and method on a promise returned from a nested assertion', function () {
                    var clonedExpect = expect.clone().addAssertion('to foo', function (expect, subject) {
                        return expect(subject, 'to bar').and('to equal', 'foo');
                    }).addAssertion('to bar', function (expect, subject) {
                        return expect.promise(function (run) {
                            setTimeout(run(function () {
                                expect(subject, 'to be truthy');
                            }), 1);
                        });
                    });
                    return clonedExpect('foo', 'to foo');
                });
            });
        });

        it('should throw an exception if the argument was not a function', function () {
            var expectedError = new TypeError('expect.promise(...) requires a function argument to be supplied.\n' +
                                              'See http://unexpectedjs.github.io/api/promise/ for more details.');
            expect(function () {
                expect.promise();
            }, 'to throw', expectedError);

            [undefined, null, '', [], {}].forEach(function (arg) {
                expect(function () {
                    expect.promise(arg);
                }, 'to throw', expectedError);
            });
        });

        describe('#inspect', function () {
            var originalDefaultFormat = expect.output.constructor.defaultFormat;
            beforeEach(function () {
                expect.output.constructor.defaultFormat = 'text';
            });
            afterEach(function () {
                expect.output.constructor.defaultFormat = originalDefaultFormat;
            });

            it('should inspect a fulfilled promise without a value', function () {
                expect(expect.promise(function () {
                    expect(2, 'to equal', 2);
                }).inspect(), 'to equal', 'Promise (fulfilled)');
            });

            it('should inspect a fulfilled promise with a value', function () {
                expect(expect.promise(function () {
                    return 123;
                }).inspect(), 'to equal', 'Promise (fulfilled) => 123');
            });

            it('should inspect a pending promise', function () {
                var asyncPromise = expect('foo', 'when delayed a little bit', 'to equal', 'foo');
                expect(asyncPromise.inspect(), 'to equal', 'Promise (pending)');
                return asyncPromise;
            });

            it('should inspect a rejected promise without a reason', function () {
                var promise = expect.promise(function (resolve, reject) {
                    reject();
                });

                return promise.caught(function () {
                    expect(promise.inspect(), 'to equal', 'Promise (rejected)');
                });
            });

            it('should inspect a rejected promise with a reason', function () {
                var promise = expect.promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new Error('argh'));
                    }, 0);
                });

                return promise.caught(function () {
                    expect(promise.inspect(), 'to equal', "Promise (rejected) => Error('argh')");
                });
            });
        });

        describe('#settle', function () {
            it('should support non-Promise leaves', function () {
                return expect.promise.settle({
                    a: 123
                }).then(function (promises) {
                    expect(promises, 'to equal', []);
                });
            });
        });
    });

    describe('with an assertion that has a non-standard name', function () {
        it('should render the error message sanely in an annotation block inside a satisfy diff', function () {
            var clonedExpect = expect.clone().addAssertion('foobar', function (expect, subject) {
                expect(subject, 'to equal', 'foobar');
            });
            expect(function () {
                clonedExpect([ 'barfoo' ], 'to have items satisfying', 'foobar');
            }, 'to throw',
                "expected [ 'barfoo' ] to have items satisfying foobar\n" +
                "\n" +
                "[\n" +
                "  'barfoo' // expected: foobar\n" +
                "           //\n" +
                "           // -barfoo\n" +
                "           // +foobar\n" +
                "]"
            );
        });
    });

    describe('styles', function () {
        describe('#magicPen', function () {
            it('should inspect an empty MagicPen instance', function () {
                expect(expect.output.clone().magicPen(expect.output.clone()).toString(), 'to equal', 'magicpen()');
            });
        });

        describe('#errorName', function () {
            it('should inspect an object with an anoymous constructor', function () {
                expect(expect.output.clone().errorName(Object.create(null)).toString(), 'to equal', 'Error');
            });
        });

        describe('#appendItems', function () {
            it('should inspect multiple items', function () {
                var magicPen = expect.output.clone();
                magicPen.addStyle('appendInspected', function (arg) {
                    this.text(arg);
                });
                expect(magicPen.appendItems([1, 2], ',').toString(), 'to equal', '1,2');
            });

            it('should default to a separator of the empty string', function () {
                var magicPen = expect.output.clone();
                magicPen.addStyle('appendInspected', function (arg) {
                    this.text(arg);
                });
                expect(magicPen.appendItems([1, 2]).toString(), 'to equal', '12');
            });
        });
    });

    describe('outputFormat', function () {
        describe('when given a format', function () {
            it('decides the output that will be used for serializing errors', function () {
                expect(function () {
                    var clonedExpect = expect.clone().outputFormat('html');
                    clonedExpect(42, 'to equal', 24);
                }, 'to throw', {
                    htmlMessage:
                        '<div style="font-family: monospace; white-space: nowrap">\n' +
                        '  <div><span style="color: red; font-weight: bold">expected</span>&nbsp;<span style="color: #0086b3">42</span>&nbsp;<span style="color: red; font-weight: bold">to&nbsp;equal</span>&nbsp;<span style="color: #0086b3">24</span></div>\n' +
                        '</div>'
                });

                expect(function () {
                    var clonedExpect = expect.clone().outputFormat('ansi');
                    clonedExpect(42, 'to equal', 24);
                }, 'to throw', {
                    message: '\n\x1b[31m\x1b[1mexpected\x1b[22m\x1b[39m 42 \x1b[31m\x1b[1mto equal\x1b[22m\x1b[39m 24'
                });
            });
        });
    });

    describe('with the next assertion as a continuation', function () {
        describe('with "to have items satisfying" followed by another assertion', function () {
            it('should succeed', function () {
                return expect([ 123 ], 'to have items satisfying to be a number');
            });

            it('should fail', function () {
                return expect(function () {
                    return expect([ 123 ], 'to have items satisfying to be a boolean');
                }, 'to error',
                    "expected [ 123 ] to have items satisfying to be a boolean\n" +
                    "\n" +
                    "[\n" +
                    "  123 // should be a boolean\n" +
                    "]"
                );
            });
        });

        describe('with "to have items satisfying" twice followed by another assertion', function () {
            it('should succeed', function () {
                return expect([ [ 123 ] ], 'to have items satisfying to have items satisfying to be a number');
            });

            it('should fail', function () {
                return expect(function () {
                    return expect([ [ 123 ] ], 'to have items satisfying to have items satisfying to be a boolean');
                }, 'to error',
                    "expected [ [ 123 ] ]\n" +
                    "to have items satisfying to have items satisfying to be a boolean\n" +
                    "\n" +
                    "[\n" +
                    "  [\n" +
                    "    123 // should be a boolean\n" +
                    "  ]\n" +
                    "]"
                );
            });
        });

        describe('with "when rejected" followed by another assertion', function () {
            it('should succeed', function () {
                return expect(expect.promise.reject(123), 'when rejected to satisfy', 123);
            });

            it('should fail', function () {
                return expect(function () {
                    return expect(expect.promise.reject(true), 'when rejected to be a number');
                }, 'to error',
                    "expected Promise (rejected) => true when rejected to be a number\n" +
                    "  expected true to be a number"
                );
            });
        });

        describe('with "when rejected" twice followed by another assertion', function () {
            it('should succeed', function () {
                return expect(expect.promise.reject(expect.promise.reject(123)), 'when rejected when rejected to satisfy', 123);
            });

            it('should fail', function () {
                return expect(function () {
                    return expect(expect.promise.reject(expect.promise.reject(true)), 'when rejected when rejected to be a number');
                }, 'to error',
                    "expected Promise (rejected) => Promise (rejected) => true\n" +
                    "when rejected when rejected to be a number\n" +
                    "  expected Promise (rejected) => true when rejected to be a number\n" +
                    "    expected true to be a number"
                );
            });
        });
    });
});
