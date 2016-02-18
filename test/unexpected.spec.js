/*global unexpected*/

it.skipIf = function (condition) {
    (condition ? it.skip : it).apply(it, Array.prototype.slice.call(arguments, 1));
};

describe('unexpected', function () {
    var expect = unexpected.clone();

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

            it('does not consider object with a different structure candidates for diffing', function () {
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

            it('does not consider different strings candidates for diffing', function () {
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
