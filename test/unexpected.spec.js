/* global unexpected, weknowhow */

it.skipIf = function (condition) {
  (condition ? it.skip : it).apply(
    it,
    Array.prototype.slice.call(arguments, 1)
  );
};

describe('unexpected', () => {
  const expect = unexpected.clone();

  it('should freeze the top-level unexpected instance', () => {
    const topLevelExpect =
      typeof weknowhow === 'undefined' ? require('../lib/') : weknowhow.expect;

    expect(
      function () {
        topLevelExpect.addAssertion('<any> to foo', function () {});
      },
      'to throw',
      'Cannot add an assertion to a frozen instance, please run .clone() first'
    );
  });

  describe('argument validation', () => {
    it('fails when given no parameters', () => {
      expect(
        function () {
          expect();
        },
        'to throw',
        'The expect function requires at least two parameters.'
      );
    });

    it('fails when given only one parameter', () => {
      expect(
        function () {
          expect('foo');
        },
        'to throw',
        'The expect function requires at least two parameters.'
      );
    });

    it('fails when the second parameter is not a string', () => {
      expect(
        function () {
          expect({}, {});
        },
        'to throw',
        'The expect function requires the second parameter to be a string or an expect.it.'
      );
    });

    it('fails if the given assertion can not be found', () => {
      expect(
        () => {
          expect(
            ['foo', 'bar', 'baz'],
            'to have entries satisfying',
            expect.it('to be a string')
          );
        },
        'to throw',
        "Unknown assertion 'to have entries satisfying', did you mean: 'to have an item satisfying'"
      );
    });

    it('fails if the given assertion is not defined for the provided parameters', () => {
      expect(
        () => {
          expect(
            'foo',
            'to have items satisfying',
            expect.it('to be a string')
          );
        },
        'to throw',
        "expected 'foo' to have items satisfying expect.it('to be a string')\n" +
          '  The assertion does not have a matching signature for:\n' +
          '    <string> to have items satisfying <expect.it>\n' +
          '  did you mean:\n' +
          '    <Set> to have items [exhaustively] satisfying <any>\n' +
          '    <Set> to have items [exhaustively] satisfying <assertion>\n' +
          '    <array-like> to have items [exhaustively] satisfying <any>\n' +
          '    <array-like> to have items [exhaustively] satisfying <assertion>'
      );
    });

    describe('in a nested expect', () => {
      it('fails when given no parameters', () => {
        const clonedExpect = expect
          .clone()
          .addAssertion('<any> to foo', function (expect) {
            expect();
          });
        expect(
          function () {
            clonedExpect('foo', 'to foo');
          },
          'to throw',
          'The expect function requires at least one parameter.'
        );
      });

      it('fails when the second parameter is not a string', () => {
        const clonedExpect = expect
          .clone()
          .addAssertion('<any> to foo', function (expect) {
            expect({}, {});
          });
        expect(
          function () {
            clonedExpect({}, {});
          },
          'to throw',
          'The expect function requires the second parameter to be a string or an expect.it.'
        );
      });
    });
  });

  it('throws if the assertion does not exist', () => {
    expect(
      function () {
        expect({}, 'to bee', 2);
      },
      'to throw exception',
      "Unknown assertion 'to bee', did you mean: 'to be'"
    );
  });

  it('shows a specific error message when the assertion exists, but not for the given type signature', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion('<string> [not] to foo <array>', function (expect) {
        expect();
      });
    expect(
      function () {
        clonedExpect(123, 'to foo', 456);
      },
      'to throw',
      'expected 123 to foo 456\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to foo <number>\n' +
        '  did you mean:\n' +
        '    <string> [not] to foo <array>'
    );
  });

  describe('expect', () => {
    it('should catch non-Unexpected error caught from a nested assertion', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion('<any> to foo', function (expect, subject) {
          return expect(subject, 'to bar');
        })
        .addAssertion('<any> to bar', function (expect, subject) {
          return expect.promise(function (run) {
            setTimeout(
              run(function () {
                throw new Error('foo');
              }),
              1
            );
          });
        });

      return expect(
        function () {
          return clonedExpect('bar', 'to foo');
        },
        'to error',
        new Error('foo')
      );
    });
  });

  describe('when given an expect.it as the 2nd argument', () => {
    it('should succeed', () => {
      expect('foo', expect.it('to be a string'));
    });

    it('should fail with a diff', () => {
      expect(
        function () {
          expect(123, expect.it('to be a string'));
        },
        'to throw',
        'expected 123 to be a string'
      );
    });
  });

  describe('diffs', () => {
    describe('on strings', () => {
      it('highlights unexpected extra newlines after the input', () => {
        expect(
          function () {
            expect('foo\n', 'to equal', 'foo');
          },
          'to throw',
          "expected 'foo\\n' to equal 'foo'\n" + '\n' + '-foo\\n\n' + '+foo'
        );
      });

      it('highlights missing newlines after the input', () => {
        expect(
          function () {
            expect('foo', 'to equal', 'foo\n');
          },
          'to throw',
          "expected 'foo' to equal 'foo\\n'\n" + '\n' + '-foo\n' + '+foo\\n'
        );
      });

      it('highlights unexpected carriage returns', () => {
        expect(
          function () {
            expect('foo\r\nbar', 'to equal', 'foo\nbar');
          },
          'to throw',
          "expected 'foo\\r\\nbar' to equal 'foo\\nbar'\n" +
            '\n' +
            '-foo\\r\n' +
            '+foo\n' +
            ' bar'
        );

        expect(
          function () {
            expect('foo\r\n', 'to equal', 'foo\n');
          },
          'to throw',
          "expected 'foo\\r\\n' to equal 'foo\\n'\n" +
            '\n' +
            '-foo\\r\n' +
            '+foo'
        );

        expect(
          function () {
            expect('foo\r\n', 'to equal', 'foo');
          },
          'to throw',
          "expected 'foo\\r\\n' to equal 'foo'\n" +
            '\n' +
            '-foo\\r\\n\n' +
            '+foo'
        );
      });

      it('highlights missing carriage returns', () => {
        expect(
          function () {
            expect('foo\nbar', 'to equal', 'foo\r\nbar');
          },
          'to throw',
          "expected 'foo\\nbar' to equal 'foo\\r\\nbar'\n" +
            '\n' +
            '-foo\n' +
            '+foo\\r\n' +
            ' bar'
        );

        expect(
          function () {
            expect('foo\n', 'to equal', 'foo\r\n');
          },
          'to throw',
          "expected 'foo\\n' to equal 'foo\\r\\n'\n" +
            '\n' +
            '-foo\n' +
            '+foo\\r'
        );

        expect(
          function () {
            expect('foo', 'to equal', 'foo\r\n');
          },
          'to throw',
          "expected 'foo' to equal 'foo\\r\\n'\n" +
            '\n' +
            '-foo\n' +
            '+foo\\r\\n'
        );
      });

      it('matching carriage returns are not highlighted', () => {
        expect(
          function () {
            expect('foo\r\nbar', 'to equal', 'foo\r\nbaz');
          },
          'to throw',
          "expected 'foo\\r\\nbar' to equal 'foo\\r\\nbaz'\n" +
            '\n' +
            ' foo\r\n' +
            '-bar\n' +
            '+baz'
        );
      });

      it('should show a \\r\\n line as removed', () => {
        expect(
          function () {
            expect('foo\r\n\r\nbar', 'to equal', 'foo\r\nbar');
          },
          'to throw',
          "expected 'foo\\r\\n\\r\\nbar' to equal 'foo\\r\\nbar'\n" +
            '\n' +
            ' foo\r\n' +
            '-\\r\n' +
            ' bar'
        );
      });

      it('should show an empty removed line', () => {
        expect(
          function () {
            expect('foo\n\nbar', 'to equal', 'foo\nbar');
          },
          'to throw',
          "expected 'foo\\n\\nbar' to equal 'foo\\nbar'\n" +
            '\n' +
            ' foo\n' +
            '-\n' +
            ' bar'
        );
      });

      it('should show a missing empty line', () => {
        expect(
          function () {
            expect('foo\nbar', 'to equal', 'foo\n\nbar');
          },
          'to throw',
          "expected 'foo\\nbar' to equal 'foo\\n\\nbar'\n" +
            '\n' +
            ' foo\n' +
            '+\n' +
            ' bar'
        );
      });

      it('should show missing content when comparing to the empty string', () => {
        expect(
          function () {
            expect('', 'to equal', 'foo\nbar');
          },
          'to throw',
          "expected '' to equal 'foo\\nbar'\n" + '\n' + '+foo\n' + '+bar'
        );
      });

      it('should show unexpected content when comparing to the empty string', () => {
        expect(
          function () {
            expect('foo\nbar', 'to equal', '');
          },
          'to throw',
          "expected 'foo\\nbar' to equal ''\n" + '\n' + '-foo\n' + '-bar'
        );
      });
    });

    describe('on objects', () => {
      it('should not collapse parts containing conflicts', () => {
        expect(
          function () {
            expect(
              {
                bar: {
                  b: { foo: { bar: 123 } },
                },
              },
              'to equal',
              {
                bar: {},
              }
            );
          },
          'to throw',
          'expected { bar: { b: { foo: ... } } } to equal { bar: {} }\n' +
            '\n' +
            '{\n' +
            '  bar: {\n' +
            '    b: { foo: { bar: 123 } } // should be removed\n' +
            '  }\n' +
            '}'
        );
      });

      it('should quote property names that require it', () => {
        expect(
          function () {
            expect(
              {
                "the-'thing": 123,
              },
              'to equal',
              {
                "the-'thing": 456,
              }
            );
          },
          'to throw',
          "expected { 'the-\\'thing': 123 } to equal { 'the-\\'thing': 456 }\n" +
            '\n' +
            '{\n' +
            "  'the-\\'thing': 123 // should equal 456\n" +
            '}'
        );
      });

      it('can contain nested string diffs', () => {
        expect(
          function () {
            expect(
              {
                value: 'bar',
              },
              'to equal',
              {
                value: 'baz',
              }
            );
          },
          'to throw',
          "expected { value: 'bar' } to equal { value: 'baz' }\n" +
            '\n' +
            '{\n' +
            "  value: 'bar' // should equal 'baz'\n" +
            '               //\n' +
            '               // -bar\n' +
            '               // +baz\n' +
            '}'
        );
      });

      it('highlights properties that has been removed', () => {
        expect(
          function () {
            expect(
              {
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
              },
              'to equal',
              {
                bar: 'bar',
                baz: 'baz',
              }
            );
          },
          'to throw',
          "expected { foo: 'foo', bar: 'bar', baz: 'baz' } to equal { bar: 'bar', baz: 'baz' }\n" +
            '\n' +
            '{\n' +
            "  foo: 'foo', // should be removed\n" +
            "  bar: 'bar',\n" +
            "  baz: 'baz'\n" +
            '}'
        );
      });

      it('highlights missing properties', () => {
        expect(
          function () {
            expect(
              {
                one: 1,
                three: 3,
              },
              'to equal',
              {
                one: 1,
                two: 2,
                three: 3,
              }
            );
          },
          'to throw',
          'expected { one: 1, three: 3 } to equal { one: 1, two: 2, three: 3 }\n' +
            '\n' +
            '{\n' +
            '  one: 1,\n' +
            '  three: 3\n' +
            '  // missing two: 2\n' +
            '}'
        );
      });

      it('highlights properties with an unexpected value', () => {
        expect(
          function () {
            expect(
              {
                one: 1,
                two: 42,
                three: 3,
              },
              'to equal',
              {
                one: 1,
                two: 2,
                three: 3,
              }
            );
          },
          'to throw',
          'expected { one: 1, two: 42, three: 3 } to equal { one: 1, two: 2, three: 3 }\n' +
            '\n' +
            '{\n' +
            '  one: 1,\n' +
            '  two: 42, // should equal 2\n' +
            '  three: 3\n' +
            '}'
        );
      });

      it('can contain nested object diffs for properties', () => {
        expect(
          function () {
            expect(
              {
                one: { two: { three: 4 } },
              },
              'to equal',
              {
                one: { two: { three: 3 } },
              }
            );
          },
          'to throw',
          'expected { one: { two: { three: 4 } } } to equal { one: { two: { three: 3 } } }\n' +
            '\n' +
            '{\n' +
            '  one: {\n' +
            '    two: {\n' +
            '      three: 4 // should equal 3\n' +
            '    }\n' +
            '  }\n' +
            '}'
        );
      });

      it('collapses subtrees without conflicts', () => {
        expect(
          function () {
            expect(
              {
                pill: {
                  red: "I'll show you how deep the rabbit hole goes",
                  blue: { ignorance: { of: 'illusion' } },
                },
              },
              'to equal',
              {
                pill: {
                  red: "I'll show you how deep the rabbit hole goes.",
                  blue: { ignorance: { of: 'illusion' } },
                },
              }
            );
          },
          'to throw',
          'expected\n' +
            '{\n' +
            '  pill: {\n' +
            "    red: 'I\\'ll show you how deep the rabbit hole goes',\n" +
            '    blue: { ignorance: ... }\n' +
            '  }\n' +
            '}\n' +
            'to equal\n' +
            '{\n' +
            '  pill: {\n' +
            "    red: 'I\\'ll show you how deep the rabbit hole goes.',\n" +
            '    blue: { ignorance: ... }\n' +
            '  }\n' +
            '}\n' +
            '\n' +
            '{\n' +
            '  pill: {\n' +
            "    red: 'I\\'ll show you how deep the rabbit hole goes', // should equal 'I\\'ll show you how deep the rabbit hole goes.'\n" +
            '                                                         //\n' +
            "                                                         // -I'll show you how deep the rabbit hole goes\n" +
            "                                                         // +I'll show you how deep the rabbit hole goes.\n" +
            "    blue: { ignorance: { of: 'illusion' } }\n" +
            '  }\n' +
            '}'
        );
      });

      it('highlights mismatching constructors', () => {
        function Foo(text) {
          this.text = text;
        }

        function Bar(text) {
          this.text = text;
        }

        expect(
          function () {
            expect(new Foo('test'), 'to equal', new Bar('test'));
          },
          'to throw',
          "expected Foo({ text: 'test' }) to equal Bar({ text: 'test' })\n" +
            '\n' +
            'Mismatching constructors Foo should be Bar'
        );
      });
    });

    describe('on arrays', () => {
      it('suppresses array diff for large arrays', () => {
        expect(
          function () {
            const a = new Array(513);
            const b = new Array(513);
            a[0] = 1;
            b[0] = 2;
            expect(a, 'to equal', b);
          },
          'to throw',
          /Diff suppressed due to size > 512/
        );
      });

      it('highlights unexpected entries', () => {
        expect(
          function () {
            expect([0, 1, 2], 'to equal', [0, 2]);
          },
          'to throw',
          'expected [ 0, 1, 2 ] to equal [ 0, 2 ]\n' +
            '\n' +
            '[\n' +
            '  0,\n' +
            '  1, // should be removed\n' +
            '  2\n' +
            ']'
        );
      });

      it('highlights missing entries', () => {
        expect(
          function () {
            expect([0, 2], 'to equal', [0, 1, 2]);
          },
          'to throw',
          'expected [ 0, 2 ] to equal [ 0, 1, 2 ]\n' +
            '\n' +
            '[\n' +
            '  0,\n' +
            '  // missing 1\n' +
            '  2\n' +
            ']'
        );
      });

      it('omits comma after last actual entry', () => {
        expect(
          function () {
            expect([0], 'to equal', [0, 1]);
          },
          'to throw',
          'expected [ 0 ] to equal [ 0, 1 ]\n' +
            '\n' +
            '[\n' +
            '  0\n' +
            '  // missing 1\n' +
            ']'
        );
      });

      it('handles complicated similarities', () => {
        expect(
          function () {
            expect([4, 3, 1, 2], 'to equal', [1, 2, 3, 4]);
          },
          'to throw',
          'expected [ 4, 3, 1, 2 ] to equal [ 1, 2, 3, 4 ]\n' +
            '\n' +
            '[\n' +
            '┌─────▷\n' +
            '│ ┌───▷\n' +
            '│ │ ┌─▷\n' +
            '│ │ │   4,\n' +
            '│ │ └── 3, // should be moved\n' +
            '└─│──── 1, // should be moved\n' +
            '  └──── 2 // should be moved\n' +
            ']'
        );

        expect(
          function () {
            expect([4, 1, 2, 3], 'to equal', [1, 2, 3, 4]);
          },
          'to throw',
          'expected [ 4, 1, 2, 3 ] to equal [ 1, 2, 3, 4 ]\n' +
            '\n' +
            '[\n' +
            '┌─────▷\n' +
            '│ ┌───▷\n' +
            '│ │ ┌─▷\n' +
            '│ │ │   4,\n' +
            '└─│─│── 1, // should be moved\n' +
            '  └─│── 2, // should be moved\n' +
            '    └── 3 // should be moved\n' +
            ']'
        );

        expect(
          function () {
            expect([1, 2, 3, 0], 'to equal', [0, 1, 2, 3]);
          },
          'to throw',
          'expected [ 1, 2, 3, 0 ] to equal [ 0, 1, 2, 3 ]\n' +
            '\n' +
            '[\n' +
            '┌─▷\n' +
            '│   1,\n' +
            '│   2,\n' +
            '│   3,\n' +
            '└── 0 // should be moved\n' +
            ']'
        );

        expect(
          function () {
            expect([4, 3, 1, 2], 'to equal', [3, 4]);
          },
          'to throw',
          'expected [ 4, 3, 1, 2 ] to equal [ 3, 4 ]\n' +
            '\n' +
            '[\n' +
            '┌─▷\n' +
            '│   4,\n' +
            '└── 3, // should be moved\n' +
            '    1, // should be removed\n' +
            '    2 // should be removed\n' +
            ']'
        );
      });

      it('highlights conflicting entries', () => {
        expect(
          function () {
            expect([0, 'once', 2], 'to equal', [0, 'one', 2]);
          },
          'to throw',
          "expected [ 0, 'once', 2 ] to equal [ 0, 'one', 2 ]\n" +
            '\n' +
            '[\n' +
            '  0,\n' +
            "  'once', // should equal 'one'\n" +
            '          //\n' +
            '          // -once\n' +
            '          // +one\n' +
            '  2\n' +
            ']'
        );
      });

      it('considers object with a similar structure candidates for diffing', () => {
        expect(
          function () {
            expect([0, 1, { name: 'John', age: 34 }, 3, 2], 'to equal', [
              0,
              { name: 'Jane', age: 24, children: 2 },
              3,
              2,
            ]);
          },
          'to throw',
          "expected [ 0, 1, { name: 'John', age: 34 }, 3, 2 ]\n" +
            "to equal [ 0, { name: 'Jane', age: 24, children: 2 }, 3, 2 ]\n" +
            '\n' +
            '[\n' +
            '  0,\n' +
            '  1, // should be removed\n' +
            '  {\n' +
            "    name: 'John', // should equal 'Jane'\n" +
            '                  //\n' +
            '                  // -John\n' +
            '                  // +Jane\n' +
            '    age: 34 // should equal 24\n' +
            '    // missing children: 2\n' +
            '  },\n' +
            '  3,\n' +
            '  2\n' +
            ']'
        );
      });

      it('does not consider object with a different structure candidates for diffing', () => {
        expect(
          function () {
            expect([0, 1, { name: 'John' }, 3, 2], 'to equal', [
              0,
              { firstName: 'John', lastName: 'Doe' },
              3,
              2,
            ]);
          },
          'to throw',
          "expected [ 0, 1, { name: 'John' }, 3, 2 ]\n" +
            "to equal [ 0, { firstName: 'John', lastName: 'Doe' }, 3, 2 ]\n" +
            '\n' +
            '[\n' +
            '  0,\n' +
            "  // missing { firstName: 'John', lastName: 'Doe' }\n" +
            '  1, // should be removed\n' +
            "  { name: 'John' }, // should be removed\n" +
            '  3,\n' +
            '  2\n' +
            ']'
        );
      });

      it('considers similar strings candidates for diffing', () => {
        expect(
          function () {
            expect(['twoo', 1, 3, 4, 5], 'to equal', [0, 1, 'two', 3, 4, 5]);
          },
          'to throw',
          "expected [ 'twoo', 1, 3, 4, 5 ] to equal [ 0, 1, 'two', 3, 4, 5 ]\n" +
            '\n' +
            '[\n' +
            '    // missing 0\n' +
            '┌─▷\n' +
            "│   'twoo', // should equal 'two'\n" +
            '│           //\n' +
            '│           // -twoo\n' +
            '│           // +two\n' +
            '└── 1, // should be moved\n' +
            '    3,\n' +
            '    4,\n' +
            '    5\n' +
            ']'
        );
      });

      it('does not consider different strings candidates for diffing', () => {
        expect(
          function () {
            expect(['tw00', 1, 3, 4, 5], 'to equal', [0, 1, 'two', 3, 4, 5]);
          },
          'to throw',
          "expected [ 'tw00', 1, 3, 4, 5 ] to equal [ 0, 1, 'two', 3, 4, 5 ]\n" +
            '\n' +
            '[\n' +
            '  // missing 0\n' +
            "  'tw00', // should be removed\n" +
            '  1,\n' +
            "  // missing 'two'\n" +
            '  3,\n' +
            '  4,\n' +
            '  5\n' +
            ']'
        );
      });

      it('handles similar objects with no diff defined for custom type', () => {
        function Person(firstName, lastName) {
          this.firstName = firstName;
          this.lastName = lastName;
        }

        const clonedExpect = expect.clone().addType({
          name: 'Person',
          identify(value) {
            return value instanceof Person;
          },
          equal(a, b) {
            return a.firstName === b.firstName && a.lastName === b.lastName;
          },
          inspect(person, depth, output) {
            return output
              .text("new Person('")
              .text(person.firstName)
              .text("', '")
              .text(person.lastName)
              .text("')");
          },
          diff() {
            return null;
          },
        });

        expect(
          function () {
            clonedExpect([new Person('John', 'Doe')], 'to equal', [
              new Person('Jane', 'Doe'),
            ]);
          },
          'to throw',
          "expected [ new Person('John', 'Doe') ] to equal [ new Person('Jane', 'Doe') ]\n" +
            '\n' +
            '[\n' +
            "  new Person('John', 'Doe') // should equal new Person('Jane', 'Doe')\n" +
            ']'
        );
      });

      describe('sparse arrays', () => {
        it('elem was sparse', () => {
          expect(
            function () {
              const sparse = [];
              sparse[1] = 2;
              sparse[2] = 3;
              expect(sparse, 'to equal', [1, 2, 3]);
            },
            'to throw',
            'expected [ , 2, 3 ] to equal [ 1, 2, 3 ]\n' +
              '\n' +
              '[\n' +
              '  undefined, // should equal 1\n' +
              '  2,\n' +
              '  3\n' +
              ']'
          );
        });
        it('elem should be sparse', () => {
          expect(
            function () {
              const sparse = [];
              sparse[1] = 2;
              sparse[2] = 3;
              expect([1, 2, 3], 'to equal', sparse);
            },
            'to throw',
            'expected [ 1, 2, 3 ] to equal [ , 2, 3 ]\n' +
              '\n' +
              '[\n' +
              '  1, // should be undefined\n' +
              '  2,\n' +
              '  3\n' +
              ']'
          );
        });
      });
    });
  });

  describe('with an assertion that has a non-standard name', () => {
    it('should render the error message sanely in an annotation block inside a satisfy diff', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion('<any> foobar', function (expect, subject) {
          expect(subject, 'to equal', 'foobar');
        });
      expect(
        function () {
          clonedExpect(['barfoo'], 'to have items satisfying', 'foobar');
        },
        'to throw',
        "expected [ 'barfoo' ] to have items satisfying foobar\n" +
          '\n' +
          '[\n' +
          "  'barfoo' // expected: foobar\n" +
          '           //\n' +
          '           // -barfoo\n' +
          '           // +foobar\n' +
          ']'
      );
    });
  });

  describe('styles', () => {
    describe('#errorName', () => {
      it('should inspect an object with an anoymous constructor', () => {
        expect(
          expect.output.clone().errorName(Object.create(null)).toString(),
          'to equal',
          'Error'
        );
      });
    });

    describe('#appendItems', () => {
      it('should inspect multiple items', () => {
        const magicPen = expect.output.clone();
        magicPen.addStyle('appendInspected', function (arg) {
          this.text(arg);
        });
        expect(magicPen.appendItems([1, 2], ',').toString(), 'to equal', '1,2');
      });

      it('should default to a separator of the empty string', () => {
        const magicPen = expect.output.clone();
        magicPen.addStyle('appendInspected', function (arg) {
          this.text(arg);
        });
        expect(magicPen.appendItems([1, 2]).toString(), 'to equal', '12');
      });
    });
  });

  describe('with the next assertion as a continuation', () => {
    describe('with multiple compound assertions', () => {
      const clonedExpect = expect
        .clone()
        .addAssertion(
          '<number> [when] incremented <assertion?>',
          function (expect, subject) {
            return expect.shift(subject + 1);
          }
        )
        .addAssertion(
          '<number> [when] added to <number> <assertion?>',
          function (expect, subject, value) {
            return expect.shift(subject + value);
          }
        );

      it('should support several compound assertions separated by an assertion argument', () => {
        expect(
          function () {
            return clonedExpect(
              2,
              'when incremented when added to',
              1,
              'when incremented when added to',
              1,
              'to satisfy',
              10
            );
          },
          'to error',
          'expected 2\n' +
            'when incremented when added to 1 when incremented when added to 1 to satisfy 10'
        );
      });

      it('should support several long compound assertions separated by an assertion argument', () => {
        expect(
          function () {
            return clonedExpect(
              2,
              'when incremented when incremented when incremented when added to',
              1,
              'when incremented when incremented when incremented when added to',
              1,
              'to satisfy',
              5
            );
          },
          'to error',
          'expected 2\n' +
            'when incremented when incremented when incremented when added to 1 when incremented when incremented when incremented when added to 1 to satisfy 5'
        );
      });
    });

    describe('with "to have items satisfying" followed by another assertion', () => {
      it('should succeed', () => {
        return expect([123], 'to have items satisfying to be a number');
      });

      it('should fail', () => {
        return expect(
          function () {
            return expect([123], 'to have items satisfying to be a boolean');
          },
          'to error',
          'expected [ 123 ] to have items satisfying to be a boolean\n' +
            '\n' +
            '[\n' +
            '  123 // should be a boolean\n' +
            ']'
        );
      });
    });

    describe('with "to have items satisfying" twice followed by another assertion', () => {
      it('should succeed', () => {
        return expect(
          [[123]],
          'to have items satisfying to have items satisfying to be a number'
        );
      });

      it('should fail', () => {
        return expect(
          function () {
            return expect(
              [[123]],
              'to have items satisfying to have items satisfying to be a boolean'
            );
          },
          'to error',
          'expected [ [ 123 ] ]\n' +
            'to have items satisfying to have items satisfying to be a boolean\n' +
            '\n' +
            '[\n' +
            '  [\n' +
            '    123 // should be a boolean\n' +
            '  ]\n' +
            ']'
        );
      });
    });

    describe('with "when rejected" followed by another assertion', () => {
      it('should succeed', () => {
        return expect(
          expect.promise.reject(123),
          'when rejected to satisfy',
          123
        );
      });

      it('should fail', () => {
        return expect(
          function () {
            return expect(
              expect.promise.reject(true),
              'when rejected to be a number'
            );
          },
          'to error',
          'expected Promise (rejected) => true when rejected to be a number\n' +
            '  expected true to be a number'
        );
      });
    });

    describe('with "when rejected" twice followed by another assertion', () => {
      it('should succeed', () => {
        return expect(
          expect.promise.reject(expect.promise.reject(123)),
          'when rejected when rejected to satisfy',
          123
        );
      });

      it('should fail', () => {
        return expect(
          function () {
            return expect(
              expect.promise.reject(expect.promise.reject(true)),
              'when rejected when rejected to be a number'
            );
          },
          'to error',
          'expected Promise (rejected) => Promise (rejected) => true\n' +
            'when rejected when rejected to be a number\n' +
            '  expected Promise (rejected) => true when rejected to be a number\n' +
            '    expected true to be a number'
        );
      });
    });

    // https://github.com/unexpectedjs/unexpected/issues/394
    it('should produce a meaningful error message when the last half of a compound assertion is not a valid assertion name', () => {
      expect(
        function () {
          expect(
            function () {},
            'when called with',
            'M1',
            'to throw a',
            SyntaxError
          );
        },
        'to throw',
        'expected function () {}\n' +
          "when called with 'M1', 'to throw a', function SyntaxError() { /* native code */ }\n" +
          '  The assertion does not have a matching signature for:\n' +
          '    <function> when called with <string> <string> <function>\n' +
          '  did you mean:\n' +
          '    <function> [when] called with <array-like> <assertion?>'
      );
    });
  });

  describe('#output', () => {
    it('does not allow the creation of a style named "inline"', () => {
      expect(
        function () {
          expect.output.addStyle('inline', function () {});
        },
        'to throw',
        '"inline" style cannot be defined, it clashes with a built-in attribute'
      );
    });

    it('does not allow the creation of a style named "inline" on a clone', () => {
      expect(
        function () {
          expect.output.clone().addStyle('inline', function () {});
        },
        'to throw',
        '"inline" style cannot be defined, it clashes with a built-in attribute'
      );
    });

    it('does not allow the creation of a style named "diff"', () => {
      expect(
        function () {
          expect.output.addStyle('diff', function () {});
        },
        'to throw',
        '"diff" style cannot be defined, it clashes with a built-in attribute'
      );
    });
  });

  it('should render the error message correctly when an non-existent assertion is used later in the argument list', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion('<any> to foo <assertion>', function (expect, subject) {
        expect(subject, 'to equal', 'foo');
      })
      .addAssertion('<any> to bar <assertion>', function (expect, subject) {
        expect(subject, 'to equal', 'bar');
      });
    expect(
      function () {
        clonedExpect(123, 'to foo', 'to bar', 'bogus');
      },
      'to throw',
      'expected 123 to foo to bar bogus'
    );
  });

  it('should render the error message correctly when a failing assertion is followed by an assertion where a non-string is where an assertion should have been', () => {
    expect(
      function () {
        expect(
          function () {
            return 123;
          },
          'when called when called with',
          'abc',
          /123/
        );
      },
      'to throw',
      "expected function () { return 123; } when called when called with 'abc', /123/\n" +
        "  expected 123 when called with 'abc', /123/\n" +
        '    The assertion does not have a matching signature for:\n' +
        '      <number> when called with <string> <regexp>\n' +
        '    did you mean:\n' +
        '      <function> [when] called with <array-like> <assertion?>'
    );
  });

  describe('wrappedExpect via an assertion', () => {
    const clonedExpect = expect.clone();

    // This is roughly babel's transpilation of
    // expect.addAssertion('<string> when suffixed with foo <assertion?>', function (expect, subject, ...rest) {
    //     return expect(subject + 'foo', ...rest);
    // });

    clonedExpect.addAssertion(
      '<string> when suffixed with foo <assertion?>',
      function (expect, subject) {
        const _len = arguments.length;
        const rest = Array(_len > 2 ? _len - 2 : 0);
        for (let _key = 2; _key < _len; _key++) {
          rest[_key - 2] = arguments[_key];
        }
        return expect.apply(undefined, [`${subject}foo`].concat(rest));
      }
    );

    it('should return a promise that resolves to that value', () => {
      clonedExpect('bar', 'when suffixed with foo').then(function (value) {
        expect(value, 'to equal', 'barfoo');
      });
    });

    describe('when followed by another assertion', () => {
      it('should succeed', () => {
        clonedExpect('bar', 'when suffixed with foo', 'to equal', 'barfoo');
      });

      it('should fail with a diff', () => {
        expect(
          function () {
            clonedExpect('bar', 'when suffixed with foo', 'to equal', 'foobar');
          },
          'to throw',
          "expected 'bar' when suffixed with foo to equal 'foobar'\n" +
            '\n' +
            '-barfoo\n' +
            '+foobar'
        );
      });
    });

    describe('when followed by an expect.it', () => {
      it('should succeed', () => {
        clonedExpect(
          'bar',
          'when suffixed with foo',
          expect.it('to equal', 'barfoo')
        );
      });

      it('should fail with a diff', () => {
        expect(
          function () {
            clonedExpect(
              'bar',
              'when suffixed with foo',
              expect.it('to equal', 'foobar')
            );
          },
          'to throw',
          "expected 'bar' when suffixed with foo expect.it('to equal', 'foobar')\n" +
            "  expected 'barfoo' to equal 'foobar'\n" +
            '\n' +
            '  -barfoo\n' +
            '  +foobar'
        );
      });
    });

    it('should return a promise that has an "and" method', () => {
      clonedExpect.addAssertion(
        '<string> to equal foo and when suffixed with bar <assertion?>',
        function (expect, subject) {
          const _len = arguments.length;
          const rest = Array(_len > 2 ? _len - 2 : 0);
          for (let _key = 2; _key < _len; _key++) {
            rest[_key - 2] = arguments[_key];
          }
          const result = `${subject}bar`;
          return expect
            .apply(undefined, [result].concat(rest))
            .and('to equal', 'foobar')
            .then(function () {
              return result;
            });
        }
      );

      clonedExpect('foo', 'to equal foo and when suffixed with bar').then(
        function (value) {
          expect(value, 'to equal', 'foobar');
        }
      );
    });
  });

  it('throws when calling a function that only works on the expect handed to a function', () => {
    expect(
      () => expect.shift(),
      'to throw',
      'This method only works on the expect function handed to an assertion'
    );
  });

  describe('with a cloned expect', () => {
    it('throws when calling a function that only works on the expect handed to a function', () => {
      expect(
        () => expect.clone().shift(),
        'to throw',
        'This method only works on the expect function handed to an assertion'
      );
    });
  });

  describe('with a child expect', () => {
    it('throws when calling a function that only works on the expect function handed to an assertion', () => {
      expect(
        () => expect.child().shift(),
        'to throw',
        'This method only works on the expect function handed to an assertion'
      );
    });
  });

  it('throws when calling a function that only works on the top-level expect', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion('<any> to foo', (expect) => {
        expect.use(() => {});
      });

    expect(
      () => clonedExpect(123, 'to foo'),
      'to throw',
      'This method only works on the top level expect function'
    );
  });
});
