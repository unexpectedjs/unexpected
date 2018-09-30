/*global expect*/
describe('to satisfy assertion', () => {
  function toArguments() {
    return arguments;
  }

  it('passes when an object is tested against itself, even in the presence of circular references', () => {
    var circular = {};
    circular.loop = circular;
    expect(circular, 'to satisfy', circular);
  });

  describe('with the not flag', () => {
    it('should succeed when the assertion fails without the not flag', () => {
      expect({ foo: 123 }, 'not to satisfy', { foo: 456 });
    });

    it('should succeed when the assertion fails without the not flag, async case', () => {
      return expect({ foo: 123 }, 'not to satisfy', {
        foo: expect.it('when delayed a little bit', 'to equal', 456)
      });
    });

    it('should fail when a non-Unexpected error occurs', () => {
      expect(
        function() {
          expect({ foo: 123 }, 'not to satisfy', function() {
            throw new Error('foo');
          });
        },
        'to throw',
        'foo'
      );
    });

    it('should fail when the assertion succeeds', () => {
      expect(
        function() {
          expect({ foo: 123 }, 'not to satisfy', { foo: 123 });
        },
        'to throw',
        'expected { foo: 123 } not to satisfy { foo: 123 }'
      );
    });
  });

  describe('with an array satisfied against an object with a numeric property', () => {
    it('should succeed', () => {
      expect(['aa', 'bb', 'cc'], 'to satisfy', { 2: /cc/ });
    });

    it('should fail', () => {
      expect(
        function() {
          expect(['aa', 'bb', 'cc'], 'to satisfy', { 2: /quux/ });
        },
        'to throw',
        "expected [ 'aa', 'bb', 'cc' ] to satisfy { 2: /quux/ }\n" +
          '\n' +
          '[\n' +
          "  'aa',\n" +
          "  'bb',\n" +
          "  'cc' // should match /quux/\n" +
          ']'
      );
    });
  });

  describe('with an object satisfied against an array', () => {
    it('should fail', () => {
      expect(
        function() {
          expect({}, 'to satisfy', []);
        },
        'to throw',
        'expected {} to satisfy []'
      );
    });

    describe('when the array is nested inside an object', () => {
      it('should fail', () => {
        expect(
          function() {
            expect({ foo: {} }, 'to satisfy', { foo: [] });
          },
          'to throw',
          'expected { foo: {} } to satisfy { foo: [] }\n' +
            '\n' +
            '{\n' +
            '  foo: {} // should satisfy []\n' +
            '}'
        );
      });
    });
  });

  describe('with an array satisfied against an array', () => {
    it('should render missing number items nicely', () => {
      expect(
        function() {
          expect([], 'to satisfy', [1, 2]);
        },
        'to throw',
        'expected [] to satisfy [ 1, 2 ]\n' +
          '\n' +
          '[\n' +
          '  // missing 1\n' +
          '  // missing 2\n' +
          ']'
      );
    });

    it('should render missing object items nicely', () => {
      expect(
        function() {
          expect([], 'to satisfy', [{ foo: true }, { baz: false }]);
        },
        'to throw',
        'expected [] to satisfy [ { foo: true }, { baz: false } ]\n' +
          '\n' +
          '[\n' +
          '  // missing { foo: true }\n' +
          '  // missing { baz: false }\n' +
          ']'
      );
    });

    it('should render missing custom items nicely', () => {
      var clonedExpect = expect.clone();

      clonedExpect.addStyle('xuuqProperty', function(key, inspectedValue) {
        this.text('<')
          .appendInspected(key)
          .text('> --> ')
          .append(inspectedValue);
      });

      clonedExpect.addType({
        name: 'xuuq',
        base: 'object',
        identify: function(obj) {
          return obj && typeof 'object' && obj.quux === 'xuuq';
        },
        property: function(output, key, inspectedValue) {
          return output.xuuqProperty(key, inspectedValue);
        }
      });

      expect(
        function() {
          clonedExpect([], 'to satisfy', [
            { quux: 'xuuq', foo: true },
            { quux: 'xuuq', baz: false }
          ]);
        },
        'to throw',
        'expected [] to satisfy\n' +
          '[\n' +
          "  { <'quux'> --> 'xuuq', <'foo'> --> true },\n" +
          "  { <'quux'> --> 'xuuq', <'baz'> --> false }\n" +
          ']\n' +
          '\n' +
          '[\n' +
          "  // missing { <'quux'> --> 'xuuq', <'foo'> --> true }\n" +
          "  // missing { <'quux'> --> 'xuuq', <'baz'> --> false }\n" +
          ']'
      );
    });

    it('should fall back to comparing index-by-index if one of the arrays has more than 10 entries', () => {
      expect(
        function() {
          expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'to satisfy', [
            0,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9
          ]);
        },
        'to throw',
        'expected [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]\n' +
          'to satisfy [ 0, 2, 3, 4, 5, 6, 7, 8, 9 ]\n' +
          '\n' +
          '[\n' +
          '  0,\n' +
          '  1, // should equal 2\n' +
          '  2, // should equal 3\n' +
          '  3, // should equal 4\n' +
          '  4, // should equal 5\n' +
          '  5, // should equal 6\n' +
          '  6, // should equal 7\n' +
          '  7, // should equal 8\n' +
          '  8, // should equal 9\n' +
          '  9, // should be removed\n' +
          '  10 // should be removed\n' +
          ']'
      );

      expect(
        function() {
          expect([1, 2, 3, 4, 5, 6, 7, 8], 'to satisfy', [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11
          ]);
        },
        'to throw',
        'expected [ 1, 2, 3, 4, 5, 6, 7, 8 ]\n' +
          'to satisfy [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]\n' +
          '\n' +
          '[\n' +
          '  1,\n' +
          '  2,\n' +
          '  3,\n' +
          '  4,\n' +
          '  5,\n' +
          '  6,\n' +
          '  7,\n' +
          '  8\n' +
          '  // missing 9\n' +
          '  // missing 10\n' +
          '  // missing 11\n' +
          ']'
      );
    });

    describe('with sync expect.it entries in the value', () => {
      it('should render missing entries', () => {
        expect(
          function() {
            expect([1, 2], 'to satisfy', [
              expect.it('to be a number'),
              2,
              expect.it('to be a string')
            ]);
          },
          'to throw',
          'expected [ 1, 2 ]\n' +
            "to satisfy [ expect.it('to be a number'), 2, expect.it('to be a string') ]\n" +
            '\n' +
            '[\n' +
            '  1,\n' +
            '  2\n' +
            '  // missing: should be a string\n' +
            ']'
        );
      });

      it('should render moved entries', () => {
        return expect(
          function() {
            expect(['a', 'b'], 'to satisfy', [expect.it('to equal', 'b')]);
          },
          'to throw',
          "expected [ 'a', 'b' ] to satisfy [ expect.it('to equal', 'b') ]\n" +
            '\n' +
            '[\n' +
            "  'a', // should be removed\n" +
            "  'b'\n" +
            ']'
        );
      });

      it('should render entries that do not satisfy the RHS entry', () => {
        return expect(
          function() {
            expect(['a', 'b'], 'to satisfy', ['e', expect.it('to equal', 'c')]);
          },
          'to throw',
          "expected [ 'a', 'b' ] to satisfy [ 'e', expect.it('to equal', 'c') ]\n" +
            '\n' +
            '[\n' +
            "  'a', // should equal 'e'\n" +
            '       //\n' +
            '       // -a\n' +
            '       // +e\n' +
            "  'b' // should equal 'c'\n" +
            '      //\n' +
            '      // -b\n' +
            '      // +c\n' +
            ']'
        );
      });

      it('should render extraneous entries', () => {
        expect(
          function() {
            expect([1, 2, 3], 'to satisfy', [1, 2]);
          },
          'to throw',
          'expected [ 1, 2, 3 ] to satisfy [ 1, 2 ]\n' +
            '\n' +
            '[\n' +
            '  1,\n' +
            '  2,\n' +
            '  3 // should be removed\n' +
            ']'
        );
      });
    });

    describe('with async expect.it entries in the value', () => {
      it('should render missing entries', () => {
        return expect(
          function() {
            return expect([1, 2], 'to satisfy', [
              expect.it('when delayed a little bit', 'to be a number'),
              2,
              expect.it('when delayed a little bit', 'to be a string')
            ]);
          },
          'to error',
          'expected [ 1, 2 ] to satisfy\n' +
            '[\n' +
            "  expect.it('when delayed a little bit', 'to be a number'),\n" +
            '  2,\n' +
            "  expect.it('when delayed a little bit', 'to be a string')\n" +
            ']\n' +
            '\n' +
            '[\n' +
            '  1,\n' +
            '  2\n' +
            '  // missing: expected: when delayed a little bit to be a string\n' +
            ']'
        );
      });

      it('should render unsatisfied entries', () => {
        return expect(
          function() {
            return expect([1, 2, 3, 4, 5, 6], 'to satisfy', [
              expect.it('when delayed a little bit', 'to be a number'),
              2,
              expect.it('when delayed a little bit', 'to be a string'),
              expect.it('when delayed a little bit', 'to be a boolean'),
              expect.it(
                'when delayed a little bit',
                'to be a regular expression'
              ),
              expect.it('when delayed a little bit', 'to be a function')
            ]);
          },
          'to error',
          'expected [ 1, 2, 3, 4, 5, 6 ] to satisfy\n' +
            '[\n' +
            "  expect.it('when delayed a little bit', 'to be a number'),\n" +
            '  2,\n' +
            "  expect.it('when delayed a little bit', 'to be a string'),\n" +
            "  expect.it('when delayed a little bit', 'to be a boolean'),\n" +
            "  expect.it('when delayed a little bit', 'to be a regular expression'),\n" +
            "  expect.it('when delayed a little bit', 'to be a function')\n" +
            ']\n' +
            '\n' +
            '[\n' +
            '  1,\n' +
            '  2,\n' +
            '  3, // expected: when delayed a little bit to be a string\n' +
            '  4, // expected: when delayed a little bit to be a boolean\n' +
            '  5, // expected: when delayed a little bit to be a regular expression\n' +
            '  6 // expected: when delayed a little bit to be a function\n' +
            ']'
        );
      });

      it('should render moved entries', () => {
        return expect(
          function() {
            return expect(['a', 'b'], 'to satisfy', [
              expect.it('when delayed a little bit', 'to equal', 'b')
            ]);
          },
          'to error',
          "expected [ 'a', 'b' ]\n" +
            "to satisfy [ expect.it('when delayed a little bit', 'to equal', 'b') ]\n" +
            '\n' +
            '[\n' +
            "  'a', // should be removed\n" +
            "  'b'\n" +
            ']'
        );
      });

      it('should render entries that do not satisfy the RHS entry', () => {
        return expect(
          function() {
            return expect(['a', 'b'], 'to satisfy', [
              'a',
              expect.it('when delayed a little bit', 'to equal', 'c')
            ]);
          },
          'to error',
          "expected [ 'a', 'b' ]\n" +
            "to satisfy [ 'a', expect.it('when delayed a little bit', 'to equal', 'c') ]\n" +
            '\n' +
            '[\n' +
            "  'a',\n" +
            "  'b' // expected: when delayed a little bit to equal 'c'\n" +
            '      //\n' +
            '      // -b\n' +
            '      // +c\n' +
            ']'
        );
      });

      it('should render extraneous entries', () => {
        return expect(
          function() {
            return expect([1, 2, 3], 'to satisfy', [
              expect.it('when delayed a little bit', 'to be a number'),
              2
            ]);
          },
          'to error',
          'expected [ 1, 2, 3 ]\n' +
            "to satisfy [ expect.it('when delayed a little bit', 'to be a number'), 2 ]\n" +
            '\n' +
            '[\n' +
            '  1,\n' +
            '  2,\n' +
            '  3 // should be removed\n' +
            ']'
        );
      });
    });
  });

  describe('with an array satisfied against an object', () => {
    it('should render missing items nicely', () => {
      expect(
        function() {
          expect([], 'to satisfy', { 0: 1, 1: 2 });
        },
        'to throw',
        'expected [] to satisfy { 0: 1, 1: 2 }\n' +
          '\n' +
          '[\n' +
          '  // missing 1\n' +
          '  // missing 2\n' +
          ']'
      );
    });
  });

  if (Object.defineProperty) {
    it('should honor the getKeys implementation of a type when building a diff', () => {
      function MyThing(a, b) {
        this.a = a;
        Object.defineProperty(this, 'b', { enumerable: false, value: b });
      }

      var clonedExpect = expect.clone().addType({
        name: 'MyThing',
        base: 'object',
        identify(obj) {
          return obj instanceof MyThing;
        },
        getKeys() {
          return ['a', 'b'];
        }
      });

      expect(
        function() {
          clonedExpect(new MyThing(123, 456), 'to exhaustively satisfy', {
            a: 123,
            b: 654
          });
        },
        'to throw',
        'expected MyThing({ a: 123, b: 456 }) to exhaustively satisfy { a: 123, b: 654 }\n' +
          '\n' +
          'MyThing({\n' +
          '  a: 123,\n' +
          '  b: 456 // should equal 654\n' +
          '})'
      );
    });
  }

  it('renders missing properties correctly', () => {
    expect(
      function() {
        expect({ foo: 'bar' }, 'to satisfy', { foo: 'bar', baz: 123 });
      },
      'to throw',
      "expected { foo: 'bar' } to satisfy { foo: 'bar', baz: 123 }\n" +
        '\n' +
        '{\n' +
        "  foo: 'bar'\n" +
        '  // missing baz: 123\n' +
        '}'
    );
  });

  it('should render a diff where missing properties expected to be missing are not rendered', () => {
    // Regression test, used to be shown as:  shown as // missing: <property name>: undefined
    expect(
      function() {
        expect({ bar: 123 }, 'to satisfy', { foo: undefined, bar: 456 });
      },
      'to throw',
      'expected { bar: 123 } to satisfy { foo: undefined, bar: 456 }\n' +
        '\n' +
        '{\n' +
        '  bar: 123 // should equal 456\n' +
        '}'
    );
  });

  it('ignores blacklisted properties in the diff', () => {
    var error = new Error('foo');
    error.description = 'qux';
    expect(
      function() {
        expect(error, 'to satisfy', new Error('bar'));
      },
      'to throw',
      "expected Error('foo') to satisfy Error('bar')\n" +
        '\n' +
        'Error({\n' +
        "  message: 'foo' // should equal 'bar'\n" +
        '                 //\n' +
        '                 // -foo\n' +
        '                 // +bar\n' +
        '})'
    );
  });

  it('renders missing properties correctly with expect.it', () => {
    expect(
      function() {
        expect({ foo: 'bar' }, 'to satisfy', {
          foo: 'bar',
          baz: expect.it('to equal', 123)
        });
      },
      'to throw',
      "expected { foo: 'bar' } to satisfy { foo: 'bar', baz: expect.it('to equal', 123) }\n" +
        '\n' +
        '{\n' +
        "  foo: 'bar'\n" +
        '  // missing: baz: should equal 123\n' +
        '}'
    );
  });

  describe('with the assertion flag', () => {
    it('should succeed', () => {
      expect('foo', 'to satisfy assertion', 'to equal', 'foo');
    });

    it('should fail with a diff', () => {
      expect(
        function() {
          expect('foo', 'to satisfy assertion', 'to equal', 'bar');
        },
        'to throw',
        "expected 'foo' to equal 'bar'\n" + '\n' + '-foo\n' + '+bar'
      );
    });

    describe('and the exhaustively flag', () => {
      it('should succeed', () => {
        expect({ foo: 123 }, 'to exhaustively satisfy assertion', 'to equal', {
          foo: 123
        });
      });

      it('should fail with a diff', () => {
        expect(
          function() {
            expect(
              { foo: 123 },
              'to exhaustively satisfy assertion',
              'to equal',
              { foo: 456 }
            );
          },
          'to throw',
          'expected { foo: 123 } to equal { foo: 456 }\n' +
            '\n' +
            '{\n' +
            '  foo: 123 // should equal 456\n' +
            '}'
        );
      });
    });
  });

  it('forwards normal errors to the top-level', () => {
    expect(
      function() {
        expect(
          {
            foo: 'foo'
          },
          'to satisfy',
          function(value) {
            throw new Error('Custom error');
          }
        );
      },
      'to throw',
      'Custom error'
    );
  });

  it('forwards normal errors found in promise aggregate errors to the top level', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('to foo', function(expect, subject) {
        var promises = [
          clonedExpect.promise(function() {
            clonedExpect('foo', 'to equal', 'bar');
          }),
          clonedExpect.promise(function() {
            return clonedExpect.promise.any([
              clonedExpect.promise(function() {
                clonedExpect('foo', 'to equal', 'bar');
              }),
              clonedExpect.promise(function() {
                throw new Error('wat');
              })
            ]);
          })
        ];
        return expect.promise.all(promises).caught(function(err) {
          return clonedExpect.promise.settle(promises);
        });
      });

    expect(
      function() {
        return clonedExpect('foo', 'to foo');
      },
      'to throw',
      'wat'
    );
  });

  describe('with a regexp satisfied against a regexp', () => {
    it('should succeed', () => {
      expect(/wat/gim, 'to satisfy', /wat/gim);
    });

    it('should fail when the regular expressions have different sets of flags', () => {
      expect(
        function() {
          expect(/wat/im, 'to satisfy', /wat/gi);
        },
        'to throw',
        'expected /wat/im to satisfy /wat/gi\n' +
          '\n' +
          '-/wat/im\n' +
          '+/wat/gi'
      );
    });

    it('should fail when the regular expressions have different patterns', () => {
      expect(
        function() {
          expect(/foo/i, 'to satisfy', /bar/i);
        },
        'to throw',
        'expected /foo/i to satisfy /bar/i\n' + '\n' + '-/foo/i\n' + '+/bar/i'
      );
    });
  });

  describe('with a expect.it function wrapper', () => {
    it("succeeds if the function doesn't throw", () => {
      expect({ foo: 'bar' }, 'to satisfy', {
        foo: expect.it(v => expect(v, 'to be a string'))
      });
    });

    it('should fail with an diff if the function fails', () => {
      expect(
        function() {
          expect({ foo: 3 }, 'to satisfy', {
            foo: expect.it(v => expect(v, 'to equal', 2))
          });
        },
        'to throw',
        "expected { foo: 3 } to satisfy { foo: expect.it(v => expect(v, 'to equal', 2)) }\n" +
          '\n' +
          '{\n' +
          '  foo: 3 // should equal 2\n' +
          '}'
      );
    });
  });

  describe('with a synchronous expect.it in the RHS object', () => {
    it('should support an object with a property value of expect.it', () => {
      expect({ foo: 'bar' }, 'to satisfy', {
        foo: expect.it('to be a string')
      });
    });

    it('should support passing an array value to an expect.it', () => {
      expect({ foo: [123] }, 'to satisfy', {
        foo: expect.it('to have items satisfying', 'to be a number')
      });
    });

    it('should not call functions in the LHS object', () => {
      expect(
        {
          foo() {
            throw new Error('Explosion');
          }
        },
        'to satisfy',
        {
          foo: expect.it('to be a function')
        }
      );
    });

    it('should succeed with an or group where the first assertion passes and the second one fails', () => {
      return expect(
        2,
        'to satisfy',
        expect.it('to equal', 2).or('to equal', 1)
      );
    });

    it('should succeed with an or group where the first one fails and the second assertion passes', () => {
      return expect(
        1,
        'to satisfy',
        expect.it('to equal', 2).or('to equal', 1)
      );
    });

    it('should succeed with an or group where both assertions pass', () => {
      return expect(
        1,
        'to satisfy',
        expect.it('to equal', 2).or('to equal', 1)
      );
    });

    it('should fail with an or group where both assertions fail', () => {
      expect(
        function() {
          expect(3, 'to satisfy', expect.it('to equal', 2).or('to equal', 1));
        },
        'to throw',
        'expected 3 to satisfy\n' +
          "expect.it('to equal', 2)\n" +
          "      .or('to equal', 1)\n" +
          '\n' +
          '⨯ expected 3 to equal 2 or\n' +
          '⨯ expected 3 to equal 1'
      );
    });
  });

  describe('with an asynchronous expect.it in the RHS object', () => {
    it('should support an object with a property value of expect.it', () => {
      return expect({ foo: 'bar' }, 'to satisfy', {
        foo: expect.it('when delayed a little bit', 'to be a string')
      });
    });

    it('should support passing an array value to an expect.it', () => {
      return expect({ foo: [123] }, 'to satisfy', {
        foo: expect.it(
          'when delayed a little bit',
          'to have items satisfying',
          'to be a number'
        )
      });
    });

    it('should succeed with an or group where the first assertion passes and the second one fails', () => {
      return expect(
        2,
        'to satisfy',
        expect
          .it('when delayed a little bit', 'to equal', 2)
          .or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should succeed with an or group where the first one fails and the second assertion passes', () => {
      return expect(
        1,
        'to satisfy',
        expect
          .it('when delayed a little bit', 'to equal', 2)
          .or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should succeed with an or group where the first one fails synchronously and the second assertion passes asynchronously', () => {
      return expect(
        1,
        'to satisfy',
        expect.it('to equal', 2).or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should succeed with an or group where the first one fails asynchronously and the second assertion passes synchronously', () => {
      return expect(
        1,
        'to satisfy',
        expect.it('when delayed a little bit', 'to equal', 2).or('to equal', 1)
      );
    });

    it('should succeed with an or group where both assertions pass', () => {
      return expect(
        1,
        'to satisfy',
        expect
          .it('when delayed a little bit', 'to equal', 2)
          .or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should fail with an or group where both assertions fail asynchronously', () => {
      return expect(
        expect(
          3,
          'to satisfy',
          expect
            .it('when delayed a little bit', 'to equal', 2)
            .or('when delayed a little bit', 'to equal', 1)
        ),
        'to be rejected with',
        'expected 3 to satisfy\n' +
          "expect.it('when delayed a little bit', 'to equal', 2)\n" +
          "      .or('when delayed a little bit', 'to equal', 1)\n" +
          '\n' +
          '⨯ expected 3 when delayed a little bit to equal 2 or\n' +
          '⨯ expected 3 when delayed a little bit to equal 1'
      );
    });

    it('should fail with an or group where the first one fails synchronously and the second one fails asynchronously', () => {
      return expect(
        expect(
          3,
          'to satisfy',
          expect
            .it('to equal', 2)
            .or('when delayed a little bit', 'to equal', 1)
        ),
        'to be rejected with',
        'expected 3 to satisfy\n' +
          "expect.it('to equal', 2)\n" +
          "      .or('when delayed a little bit', 'to equal', 1)\n" +
          '\n' +
          '⨯ expected 3 to equal 2 or\n' +
          '⨯ expected 3 when delayed a little bit to equal 1'
      );
    });

    it('should fail with an or group where the first one fails asynchronously and the second one fails synchronously', () => {
      return expect(
        expect(
          3,
          'to satisfy',
          expect
            .it('when delayed a little bit', 'to equal', 2)
            .or('to equal', 1)
        ),
        'to be rejected with',
        'expected 3 to satisfy\n' +
          "expect.it('when delayed a little bit', 'to equal', 2)\n" +
          "      .or('to equal', 1)\n" +
          '\n' +
          '⨯ expected 3 when delayed a little bit to equal 2 or\n' +
          '⨯ expected 3 to equal 1'
      );
    });
  });

  it('should support diffs in the error report', () => {
    expect(
      function() {
        expect(
          'foo',
          'to satisfy',
          expect.it('to equal', 'bar').or('to equal', 'baz')
        );
      },
      'to throw',
      "expected 'foo' to satisfy\n" +
        "expect.it('to equal', 'bar')\n" +
        "      .or('to equal', 'baz')\n" +
        '\n' +
        "⨯ expected 'foo' to equal 'bar' or\n" +
        '\n' +
        '  -foo\n' +
        '  +bar\n' +
        "⨯ expected 'foo' to equal 'baz'\n" +
        '\n' +
        '  -foo\n' +
        '  +baz'
    );
  });

  it('should support expect.it at the first level', () => {
    expect(
      function() {
        expect('bar', 'to satisfy', expect.it('to be a number'));
      },
      'to throw',
      "expected 'bar' to satisfy expect.it('to be a number')\n" +
        '\n' +
        "expected 'bar' to be a number"
    );
  });

  it('should support regular expressions in the RHS object', () => {
    expect({ foo: 'bar' }, 'to satisfy', {
      foo: /ba/
    });

    expect(
      function() {
        expect({ foo: 'foo' }, 'to satisfy', {
          foo: /f00/
        });
      },
      'to throw',
      "expected { foo: 'foo' } to satisfy { foo: /f00/ }\n" +
        '\n' +
        '{\n' +
        "  foo: 'foo' // should match /f00/\n" +
        '}'
    );

    expect(
      function() {
        expect({ foo: 'foo' }, 'to satisfy', {
          foo: expect.it('not to match', /oo/)
        });
      },
      'to throw',
      "expected { foo: 'foo' } to satisfy { foo: expect.it('not to match', /oo/) }\n" +
        '\n' +
        '{\n' +
        "  foo: 'foo' // should not match /oo/\n" +
        '             //\n' +
        '             // foo\n' +
        '             //  ^^\n' +
        '}'
    );
  });

  it('should support expect.it in an array', () => {
    expect({ foo: [123] }, 'to satisfy', {
      foo: [expect.it('to be a number')]
    });
  });

  it('should support directly naming other assertions', () => {
    expect(123, 'to satisfy assertion', 'to be a number');
  });

  it('should support delegating to itself as a weird noop', () => {
    expect(
      123,
      'to satisfy assertion',
      'to satisfy assertion',
      'to satisfy assertion',
      'to be a number'
    );
  });

  describe('with a regular function in the RHS object', () => {
    it('should throw an exception if the condition is not met', () => {
      expect({ foo: 123 }, 'to satisfy', function(obj) {
        expect(obj.foo, 'to equal', 123);
      });
    });

    it('should only consider functions that are identified as functions by the type system', () => {
      var clonedExpect = expect.clone().addType({
        name: 'functionStartingWithF',
        identify(obj) {
          return typeof obj === 'function' && /^f/i.test(obj.name);
        }
      });

      function foo() {
        throw new Error('argh, do not call me');
      }

      clonedExpect(foo, 'to satisfy', foo);
      clonedExpect({ foo }, 'to satisfy', { foo });
    });
  });

  describe('on Error instances', () => {
    it('should support satisfying against an Error instance', () => {
      expect(new Error('foo'), 'to satisfy', new Error('foo'));
    });

    it('should support satisfying against a primitive', () => {
      expect(
        function() {
          expect(new Error('foo'), 'to satisfy', 123);
        },
        'to throw',
        "expected Error('foo') to satisfy 123"
      );
    });

    it('should support satisfying against an Error instance when the subject has additional properties', () => {
      var err = new Error('foo');
      err.bar = 123;
      expect(err, 'to satisfy', new Error('foo'));
    });

    it('should not consider errors with different constructors to satisfy each other, even if all properties are identical', () => {
      expect(
        function() {
          expect(new Error('foo'), 'to satisfy', new TypeError('foo'));
        },
        'to throw',
        "expected Error('foo') to satisfy TypeError('foo')"
      );
    });

    it('should support satisfying against an object', () => {
      expect(new Error('foo'), 'to satisfy', { message: 'foo' });
    });

    describe('in "exhaustively" mode', () => {
      it('should succeed', () => {
        expect(new Error('foo'), 'to exhaustively satisfy', { message: 'foo' });
      });

      describe('should fail with a diff', () => {
        it('when satisfying against an object', () => {
          var err = new Error('foo');
          err.bar = 123;
          expect(
            function() {
              expect(err, 'to exhaustively satisfy', { message: 'foo' });
            },
            'to throw',
            "expected Error({ message: 'foo', bar: 123 })\n" +
              "to exhaustively satisfy { message: 'foo' }\n" +
              '\n' +
              '{\n' +
              "  message: 'foo',\n" +
              '  bar: 123 // should be removed\n' +
              '}'
          );
        });

        it('when satisfying against another Error instance', () => {
          var error = new Error('foobar');
          error.data = { foo: 'bar' };
          expect(
            function() {
              expect(error, 'to exhaustively satisfy', new Error('foobar'));
            },
            'to throw',
            "expected Error({ message: 'foobar', data: { foo: 'bar' } })\n" +
              "to exhaustively satisfy Error('foobar')\n" +
              '\n' +
              'Error({\n' +
              "  message: 'foobar',\n" +
              "  data: { foo: 'bar' } // should be removed\n" +
              '})'
          );
        });
      });

      it('should treat a missing value property the same as a subject property of undefined', () => {
        expect({ foo: undefined }, 'to exhaustively satisfy', {});
      });

      it('should treat a missing subject property the same as a value property of undefined', () => {
        expect({}, 'to exhaustively satisfy', { foo: undefined });
      });

      // Regression test for #380
      it('should display a proper error message when a missing key is satisfied against an expect.it', () => {
        expect(
          function() {
            expect({}, 'to exhaustively satisfy', {
              foo: expect.it('to be undefined')
            });
          },
          'to throw',
          "expected {} to exhaustively satisfy { foo: expect.it('to be undefined') }\n" +
            '\n' +
            '{\n' +
            "  // missing foo: should satisfy expect.it('to be undefined')\n" +
            '}'
        );
      });
    });

    it('should support satisfying against a regexp', () => {
      expect(new Error('foo'), 'to satisfy', /foo/);
    });

    describe('when satisfying against a function', () => {
      it('should succeed if the function does not throw', () => {
        expect(new Error('foo'), 'to satisfy', function(err) {
          expect(err, 'to be an', Error);
        });
      });

      it('fails when the function throws', () => {
        expect(
          function() {
            expect(new Error('Custom message'), 'to satisfy', function(err) {
              expect(err, 'to be a', TypeError);
            });
          },
          'to throw',
          "expected Error('Custom message') to be a TypeError"
        );
      });
    });
  });

  if (typeof Buffer !== 'undefined') {
    describe('on Buffer instances', () => {
      it('should assert equality', () => {
        expect(new Buffer([1, 2, 3]), 'to satisfy', new Buffer([1, 2, 3]));
      });

      it('should fail with a binary diff when the assertion fails', () => {
        expect(
          function() {
            expect(new Buffer([1, 2, 3]), 'to satisfy', new Buffer([1, 2, 4]));
          },
          'to throw',
          'expected Buffer([0x01, 0x02, 0x03]) to equal Buffer([0x01, 0x02, 0x04])\n' +
            '\n' +
            '-01 02 03                                         │...│\n' +
            '+01 02 04                                         │...│'
        );
      });

      describe('with expect.it', () => {
        it('should succeed', () => {
          expect(
            new Buffer('bar'),
            'to satisfy',
            expect.it('to equal', new Buffer('bar'))
          );
        });

        it('should fail with a diff', () => {
          expect(
            function() {
              expect(
                new Buffer('bar'),
                'to satisfy',
                expect.it('to equal', new Buffer('foo'))
              );
            },
            'to throw',
            'expected Buffer([0x62, 0x61, 0x72])\n' +
              "to satisfy expect.it('to equal', Buffer([0x66, 0x6F, 0x6F]))\n" +
              '\n' +
              'expected Buffer([0x62, 0x61, 0x72]) to equal Buffer([0x66, 0x6F, 0x6F])\n' +
              '\n' +
              '-62 61 72                                         │bar│\n' +
              '+66 6F 6F                                         │foo│'
          );
        });
      });

      it('should satisfy a function', () => {
        expect(new Buffer('bar'), 'to satisfy', function(buffer) {
          expect(buffer, 'to have length', 3);
        });
      });

      describe('in an async setting', () => {
        it('should succeed', () => {
          return expect(
            new Buffer([0, 1, 2]),
            'to satisfy',
            expect.it(
              'when delayed a little bit',
              'to equal',
              new Buffer([0, 1, 2])
            )
          );
        });

        it('should fail with a diff', () => {
          return expect(
            expect(
              new Buffer([0, 1, 2]),
              'to satisfy',
              expect.it(
                'when delayed a little bit',
                'to equal',
                new Buffer([2, 1, 0])
              )
            ),
            'to be rejected with',
            'expected Buffer([0x00, 0x01, 0x02])\n' +
              "to satisfy expect.it('when delayed a little bit', 'to equal', Buffer([0x02, 0x01, 0x00]))\n" +
              '\n' +
              'expected Buffer([0x00, 0x01, 0x02])\n' +
              'when delayed a little bit to equal Buffer([0x02, 0x01, 0x00])\n' +
              '\n' +
              '-00 01 02                                         │...│\n' +
              '+02 01 00                                         │...│'
          );
        });
      });
    });
  }

  if (typeof Uint8Array !== 'undefined') {
    describe('on Uint8Array instances', () => {
      it('should assert equality', () => {
        expect(
          new Uint8Array([1, 2, 3]),
          'to satisfy',
          new Uint8Array([1, 2, 3])
        );
      });

      it('fail with a binary diff when the assertion fails', () => {
        expect(
          function() {
            expect(
              new Uint8Array([1, 2, 3]),
              'to satisfy',
              new Uint8Array([1, 2, 4])
            );
          },
          'to throw',
          'expected Uint8Array([0x01, 0x02, 0x03]) to equal Uint8Array([0x01, 0x02, 0x04])\n' +
            '\n' +
            '-01 02 03                                         │...│\n' +
            '+01 02 04                                         │...│'
        );
      });
    });
  }

  describe('on object with getters', () => {
    it('should satisfy on the value returned by the getter', () => {
      var subject = { nextLevel: {} };
      Object.defineProperty(subject.nextLevel, 'getMe', {
        get() {
          return 'got me';
        },
        enumerable: false
      });

      expect(subject, 'to satisfy', {
        nextLevel: {
          getMe: 'got me'
        }
      });
    });
  });

  describe('on array-like', () => {
    it('should diff correctly against an array on the right hand side', () => {
      expect(
        function() {
          expect(toArguments({ foo: 'foo' }, 2, 3), 'to satisfy', [
            { foo: 'f00' }
          ]);
        },
        'to throw',
        "expected arguments( { foo: 'foo' }, 2, 3 ) to satisfy [ { foo: 'f00' } ]\n" +
          '\n' +
          'arguments(\n' +
          '  {\n' +
          "    foo: 'foo' // should equal 'f00'\n" +
          '               //\n' +
          '               // -foo\n' +
          '               // +f00\n' +
          '  },\n' +
          '  2, // should be removed\n' +
          '  3 // should be removed\n' +
          ')'
      );
    });
  });

  describe('on arrays', () => {
    it('should require all indices to be present in the subject', () => {
      expect([1, 2, 3], 'to satisfy', [1, 2, 3]);
    });

    it('should produce a diff when an undefined item in the subject is found at a position outside of the value array', () => {
      expect(
        function() {
          expect([undefined], 'to satisfy', []);
        },
        'to throw',
        'expected [ undefined ] to satisfy []\n' +
          '\n' +
          '[\n' +
          '  undefined // should be removed\n' +
          ']'
      );
    });

    it('should produce a diff when the value has more items than the subject', () => {
      expect(
        function() {
          expect([], 'to satisfy', [undefined]);
        },
        'to throw',
        'expected [] to satisfy [ undefined ]\n' +
          '\n' +
          '[\n' +
          '  // missing undefined\n' +
          ']'
      );
    });

    it('should fail if the value does not include all the indices of the subject', () => {
      expect(
        function() {
          expect([1, 2, 3], 'to satisfy', [1, 2]);
        },
        'to throw',
        'expected [ 1, 2, 3 ] to satisfy [ 1, 2 ]\n' +
          '\n' +
          '[\n' +
          '  1,\n' +
          '  2,\n' +
          '  3 // should be removed\n' +
          ']'
      );
    });

    it('should fail if the value includes more indices than the subject', () => {
      expect(
        function() {
          expect([1, 2, 3], 'to satisfy', [1, 2, 3, 4]);
        },
        'to throw',
        'expected [ 1, 2, 3 ] to satisfy [ 1, 2, 3, 4 ]\n' +
          '\n' +
          '[\n' +
          '  1,\n' +
          '  2,\n' +
          '  3\n' +
          '  // missing 4\n' +
          ']'
      );
    });
  });

  it('should render a missing item expected to satisfy an expect.it', () => {
    expect(
      function() {
        expect([], 'to satisfy', [expect.it('to be falsy')]);
      },
      'to throw',
      // FIXME: Would be better if we could render // missing: should be falsy
      // but in this case we do not have an UnexpectedError instance:
      "expected [] to satisfy [ expect.it('to be falsy') ]\n" +
        '\n' +
        '[\n' +
        "  // missing: expect.it('to be falsy')\n" +
        ']'
    );
  });

  it('should support a chained expect.it', () => {
    expect({ foo: 123 }, 'to satisfy', {
      foo: expect.it('to be a number').and('to be greater than', 10)
    });

    expect(
      function() {
        expect({ foo: 123 }, 'to satisfy', {
          foo: expect.it('to be a number').and('to be greater than', 200)
        });
      },
      'to throw',
      'expected { foo: 123 } to satisfy\n' +
        '{\n' +
        "  foo: expect.it('to be a number')\n" +
        "               .and('to be greater than', 200)\n" +
        '}\n' +
        '\n' +
        '{\n' +
        '  foo: 123 // ✓ should be a number and\n' +
        '           // ⨯ should be greater than 200\n' +
        '}'
    );
  });

  it('should support asserting on properties that are not defined', () => {
    expect({ foo: 123 }, 'to satisfy', {
      bar: expect.it('to be undefined')
    });
  });

  it('should assert missing properties with undefined in the RHS object', () => {
    expect({ foo: 123 }, 'to satisfy', {
      bar: undefined
    });
  });

  it('should support the exhaustively flag', () => {
    expect({ foo: 123 }, 'to exhaustively satisfy', { foo: 123 });
  });

  it('should support delegating to itself with the exhaustively flag', () => {
    expect({ foo: { bar: 123 }, baz: 456 }, 'to satisfy', {
      foo: expect.it('to exhaustively satisfy', { bar: 123 })
    });
  });

  it('should support delegating to itself without the exhaustively flag', () => {
    expect({ foo: { bar: 123, baz: 456 } }, 'to exhaustively satisfy', {
      foo: expect.it('to satisfy', { bar: 123 })
    });
  });

  it('should not fail when matching an object against a number', () => {
    expect({ foo: {} }, 'not to satisfy', { foo: 123 });
  });

  it('fails when comparing errors that do not have the same message', () => {
    expect(
      function() {
        expect(new Error('foo'), 'to satisfy', new Error('bar'));
      },
      'to throw exception',
      "expected Error('foo') to satisfy Error('bar')\n" +
        '\n' +
        'Error({\n' +
        "  message: 'foo' // should equal 'bar'\n" +
        '                 //\n' +
        '                 // -foo\n' +
        '                 // +bar\n' +
        '})'
    );
  });

  it('fails when error message does not match given regexp', () => {
    expect(
      function() {
        expect(new Error('foo'), 'to satisfy', /bar/);
      },
      'to throw exception',
      "expected Error('foo') to satisfy /bar/"
    );
  });

  it('fails when using an unknown assertion', () => {
    expect(
      function() {
        expect({ bool: 'true' }, 'to satisfy', {
          bool: expect.it('to be true')
        });
      },
      'to throw exception',
      "expected { bool: 'true' } to satisfy { bool: expect.it('to be true') }\n" +
        '\n' +
        '{\n' +
        "  bool: 'true' // expected 'true' to be true\n" +
        '               //   The assertion does not have a matching signature for:\n' +
        '               //     <string> to be true\n' +
        '               //   did you mean:\n' +
        '               //     <boolean> [not] to be true\n' +
        '}'
    );
  });

  it('fails is error does not satisfy properties of given object', () => {
    expect(
      function() {
        expect(new Error('foo'), 'to satisfy', { message: 'bar' });
      },
      'to throw exception',
      "expected Error('foo') to satisfy { message: 'bar' }\n" +
        '\n' +
        '{\n' +
        '  message:\n' +
        "    'foo' // should equal 'bar'\n" +
        '          //\n' +
        '          // -foo\n' +
        '          // +bar\n' +
        '}'
    );
  });

  it('includes the constructor name in the diff', () => {
    function Foo(value) {
      this.value = value;
    }
    expect(
      function() {
        expect(new Foo('bar'), 'to satisfy', { value: 'quux' });
      },
      'to throw exception',
      "expected Foo({ value: 'bar' }) to satisfy { value: 'quux' }\n" +
        '\n' +
        'Foo({\n' +
        "  value: 'bar' // should equal 'quux'\n" +
        '               //\n' +
        '               // -bar\n' +
        '               // +quux\n' +
        '})'
    );
  });

  it('collapses subtrees without conflicts', () => {
    expect(
      function() {
        expect(
          {
            pill: {
              red: "I'll show you how deep the rabbit hole goes",
              blue: {
                ignorance: {
                  of: { illusion: { will: { not: { lead: 'to the truth' } } } }
                }
              },
              purple: {
                you: 'wat there is another pill',
                them: 'there is always more choices'
              }
            }
          },
          'to satisfy',
          {
            pill: {
              red: "I'll show you how deep the rabbit hole goes.",
              blue: {
                ignorance: {
                  of: { illusion: { will: { not: { lead: 'to the truth' } } } }
                }
              }
            }
          }
        );
      },
      'to throw',
      'expected\n' +
        '{\n' +
        '  pill: {\n' +
        "    red: 'I\\'ll show you how deep the rabbit hole goes',\n" +
        '    blue: { ignorance: ... },\n' +
        "    purple: { you: 'wat there is another pill', them: 'there is always more choices' }\n" +
        '  }\n' +
        '}\n' +
        'to satisfy\n' +
        '{\n' +
        '  pill: {\n' +
        "    red: 'I\\'ll show you how deep the rabbit hole goes.',\n" +
        '    blue: { ignorance: ... }\n' +
        '  }\n' +
        '}\n' +
        '\n' +
        '{\n' +
        '  pill: {\n' +
        "    red: 'I\\'ll show you how deep the rabbit hole goes',\n" +
        "         // should equal 'I\\'ll show you how deep the rabbit hole goes.'\n" +
        '         //\n' +
        "         // -I'll show you how deep the rabbit hole goes\n" +
        "         // +I'll show you how deep the rabbit hole goes.\n" +
        '    blue: { ignorance: { of: ... } },\n' +
        "    purple: { you: 'wat there is another pill', them: 'there is always more choices' }\n" +
        '  }\n' +
        '}'
    );
  });

  it('indents removed objects correctly', () => {
    var str = 'abcdefghijklmnopqrstuvwxyz';
    expect(
      function() {
        expect(
          { foo: { a: str, b: str, c: str, d: str, e: str } },
          'to equal',
          {}
        );
      },
      'to throw',
      'expected\n' +
        '{\n' +
        '  foo: {\n' +
        "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
        '  }\n' +
        '}\n' +
        'to equal {}\n' +
        '\n' +
        '{\n' +
        '  foo: {\n' +
        "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
        '  } // should be removed\n' +
        '}'
    );
  });

  it('indents unchanged objects correctly', () => {
    var str = 'abcdefghijklmnopqrstuvwxyz';
    expect(
      function() {
        expect(
          { foo: { a: str, b: str, c: str, d: str, e: str }, bar: 1 },
          'to equal',
          { foo: { a: str, b: str, c: str, d: str, e: str } }
        );
      },
      'to throw',
      'expected\n' +
        '{\n' +
        '  foo: {\n' +
        "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
        '  },\n' +
        '  bar: 1\n' +
        '}\n' +
        'to equal\n' +
        '{\n' +
        '  foo: {\n' +
        "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
        '  }\n' +
        '}\n' +
        '\n' +
        '{\n' +
        '  foo: {\n' +
        "    a: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    b: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    c: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    d: 'abcdefghijklmnopqrstuvwxyz',\n" +
        "    e: 'abcdefghijklmnopqrstuvwxyz'\n" +
        '  },\n' +
        '  bar: 1 // should be removed\n' +
        '}'
    );
  });

  describe('with a custom type', () => {
    function MysteryBox(value) {
      this.propertyName = `prop${Math.floor(1000 * Math.random())}`;
      this[this.propertyName] = value;
    }
    var clonedExpect;

    beforeEach(() => {
      clonedExpect = expect.clone().addType({
        base: 'wrapperObject',
        name: 'mysteryBox',
        identify(obj) {
          return obj instanceof MysteryBox;
        },
        unwrap(box) {
          return box[box.propertyName];
        },
        prefix(output) {
          return output.text('MysteryBox(');
        },
        suffix(output) {
          return output.text(')');
        }
      });
    });

    it('should inspect multiline block values in diffs correctly', () => {
      expect(
        function() {
          clonedExpect.addType({
            base: 'number',
            name: 'numberBox',
            identify(obj) {
              return typeof obj === 'number' && obj > 0 && obj < 10;
            },
            inspect(obj, depth, output) {
              return output.block(function() {
                this.text('+-+')
                  .nl()
                  .text(`|${obj}|`)
                  .nl()
                  .text('|_|');
              });
            }
          });
          clonedExpect({ foo: 2, bar: 'baz' }, 'to satisfy', { bar: 'quux' });
        },
        'to throw',
        'expected\n' +
          '{\n' +
          '  foo: +-+\n' +
          '       |2|\n' +
          '       |_|,\n' +
          "  bar: 'baz'\n" +
          '}\n' +
          "to satisfy { bar: 'quux' }\n" +
          '\n' +
          '{\n' +
          '  foo: +-+\n' +
          '       |2|\n' +
          '       |_|,\n' +
          "  bar: 'baz' // should equal 'quux'\n" +
          '             //\n' +
          '             // -baz\n' +
          '             // +quux\n' +
          '}'
      );
    });

    it('should use a "to satisfy" label when a conflict does not have a label', () => {
      expect(
        function() {
          expect({ foo: { bar: 123 } }, 'to satisfy', { foo: { bar: /d/ } });
        },
        'to throw',
        'expected { foo: { bar: 123 } } to satisfy { foo: { bar: /d/ } }\n' +
          '\n' +
          '{\n' +
          '  foo: {\n' +
          '    bar: 123 // should equal /d/\n' +
          '  }\n' +
          '}'
      );
    });

    it('should build the correct diff when the subject and value have "diff" and "inline" keys', () => {
      expect(
        function() {
          expect({ diff: 123, inline: 456 }, 'to satisfy', {
            diff: 321,
            inline: 654
          });
        },
        'to throw',
        'expected { diff: 123, inline: 456 } to satisfy { diff: 321, inline: 654 }\n' +
          '\n' +
          '{\n' +
          '  diff: 123, // should equal 321\n' +
          '  inline: 456 // should equal 654\n' +
          '}'
      );
    });

    it('should support satisfy agaist the unwrapped object with nested expect.it', () => {
      clonedExpect(new MysteryBox({ baz: 123 }), 'to satisfy', {
        baz: expect.it('to be a number')
      });
    });

    it('should delegate to the "to satisfies" assertion defined for the custom type', () => {
      clonedExpect(
        {
          foo: new MysteryBox({ baz: 123, quux: 987 }),
          bar: new MysteryBox(456)
        },
        'to satisfy',
        {
          foo: { baz: clonedExpect.it('to be a number') },
          bar: 456
        }
      );
    });

    it('should preserve the "exhaustively" flag when matching inside instances of the custom type', () => {
      expect(
        function() {
          clonedExpect(
            {
              foo: new MysteryBox({ baz: 123, quux: 987 })
            },
            'to exhaustively satisfy',
            {
              foo: { baz: clonedExpect.it('to be a number') }
            }
          );
        },
        'to throw',
        'expected { foo: MysteryBox({ baz: 123, quux: 987 }) }\n' +
          "to exhaustively satisfy { foo: { baz: expect.it('to be a number') } }\n" +
          '\n' +
          '{\n' +
          '  foo: MysteryBox({\n' +
          '    baz: 123,\n' +
          '    quux: 987 // should be removed\n' +
          '  })\n' +
          '}'
      );
    });

    it('should include wrapper object type information in diff', () => {
      expect(
        function() {
          clonedExpect(
            {
              foo: new MysteryBox({ baz: 123, quux: 987 })
            },
            'to satisfy',
            {
              foo: { baz: clonedExpect.it('not to be a number') }
            }
          );
        },
        'to throw',
        'expected { foo: MysteryBox({ baz: 123, quux: 987 }) }\n' +
          "to satisfy { foo: { baz: expect.it('not to be a number') } }\n" +
          '\n' +
          '{\n' +
          '  foo: MysteryBox({\n' +
          '    baz: 123, // should not be a number\n' +
          '    quux: 987\n' +
          '  })\n' +
          '}'
      );
    });

    it('should preserve the "exhaustively" flag when matching instances of the custom type against each other', () => {
      expect(
        function() {
          clonedExpect(
            {
              foo: new MysteryBox({ baz: 123, quux: 987 })
            },
            'to exhaustively satisfy',
            {
              foo: new MysteryBox({ baz: clonedExpect.it('to be a number') })
            }
          );
        },
        'to throw',
        'expected { foo: MysteryBox({ baz: 123, quux: 987 }) }\n' +
          "to exhaustively satisfy { foo: MysteryBox({ baz: expect.it('to be a number') }) }\n" +
          '\n' +
          '{\n' +
          '  foo: MysteryBox({\n' +
          '    baz: 123,\n' +
          '    quux: 987 // should be removed\n' +
          '  })\n' +
          '}'
      );
    });

    it('should support matching against other instances of the custom type', () => {
      clonedExpect(
        {
          foo: new MysteryBox({ baz: 123 }),
          bar: new MysteryBox(456)
        },
        'to satisfy',
        {
          foo: new MysteryBox({ baz: clonedExpect.it('to be a number') }),
          bar: new MysteryBox(456)
        }
      );
    });

    it('should fail to match', () => {
      expect(
        function() {
          clonedExpect(
            {
              foo: new MysteryBox('abc')
            },
            'to satisfy',
            {
              foo: 'def'
            }
          );
        },
        'to throw',
        "expected { foo: MysteryBox('abc') } to satisfy { foo: 'def' }\n" +
          '\n' +
          '{\n' +
          "  foo: MysteryBox('abc') // should equal 'def'\n" +
          '                         //\n' +
          '                         // -abc\n' +
          '                         // +def\n' +
          '}'
      );
    });

    it('should fail to match unequal instances of the custom type', () => {
      expect(
        function() {
          clonedExpect(
            {
              foo: new MysteryBox('abc')
            },
            'to satisfy',
            {
              foo: new MysteryBox('def')
            }
          );
        },
        'to throw',
        "expected { foo: MysteryBox('abc') } to satisfy { foo: MysteryBox('def') }\n" +
          '\n' +
          '{\n' +
          "  foo: MysteryBox('abc') // should equal MysteryBox('def')\n" +
          '                         //\n' +
          '                         // -abc\n' +
          '                         // +def\n' +
          '}'
      );
    });
  });

  it('can be negated with the "not" flag', () => {
    expect(123, 'not to satisfy assertion', 'to be a string');

    expect('foobar', 'not to satisfy', /quux/i);

    expect({ foo: 123 }, 'not to satisfy', {
      foo: expect.it('to be a string')
    });

    expect({ foo: 123, bar: 456 }, 'not to exhaustively satisfy', { foo: 123 });

    expect({ foo: 123 }, 'not to exhaustively satisfy', { bar: undefined });
  });

  it('fails when the assertion fails', () => {
    expect(function() {
      expect(123, 'to satisfy assertion', 'to be a string');
    }, 'to throw');

    expect(
      function() {
        expect('foobar', 'to satisfy', /quux/i);
      },
      'to throw',
      "expected 'foobar' to match /quux/i"
    );

    // FIXME: Could this error message be improved?
    expect(
      function() {
        expect({ foo: 123 }, 'to satisfy', {
          foo: expect.it('to be a string')
        });
      },
      'to throw',
      "expected { foo: 123 } to satisfy { foo: expect.it('to be a string') }\n" +
        '\n' +
        '{\n' +
        '  foo: 123 // should be a string\n' +
        '}'
    );

    expect(function() {
      expect({ foo: 123, bar: 456 }, 'to exhaustively satisfy', { foo: 123 });
    }, 'to throw');

    expect(function() {
      expect({ foo: 123 }, 'to exhaustively satisfy', { bar: undefined });
    }, 'to throw');
  });

  describe('when delegating to async assertions', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion('to be a number after a short delay', function(
        expect,
        subject
      ) {
        expect.errorMode = 'nested';

        return expect.promise(function(run) {
          setTimeout(
            run(function() {
              expect(subject, 'to be a number');
            }),
            1
          );
        });
      });

    it('returns a promise that is resolved if the assertion succeeds', () => {
      return clonedExpect(
        42,
        'to satisfy',
        clonedExpect.it('to be a number after a short delay')
      );
    });

    it('returns a promise that is rejected if the assertion fails', () => {
      return expect(
        clonedExpect(
          'wat',
          'to satisfy',
          clonedExpect.it('to be a number after a short delay')
        ),
        'to be rejected with',
        "expected 'wat' to satisfy expect.it('to be a number after a short delay')\n" +
          '\n' +
          "expected 'wat' to be a number after a short delay\n" +
          "  expected 'wat' to be a number"
      );
    });

    it('supports many levels of asynchronous assertions', () => {
      return expect(
        expect(
          'abc',
          'when delayed a little bit',
          'when delayed a little bit',
          'to satisfy',
          expect.it('when delayed a little bit', 'to equal', 'def')
        ),
        'to be rejected with',
        "expected 'abc'\n" +
          "when delayed a little bit when delayed a little bit to satisfy expect.it('when delayed a little bit', 'to equal', 'def')\n" +
          '\n' +
          "expected 'abc' when delayed a little bit to equal 'def'\n" +
          '\n' +
          '-abc\n' +
          '+def'
      );
    });

    it('supports and groups combined with async assertions', () => {
      return expect(
        expect(
          123,
          'to satisfy',
          expect
            .it('when delayed a little bit', 'to equal', 456)
            .or('when delayed a little bit', 'to be a string')
            .and('to be greater than', 100)
            .or('when delayed a little bit', 'to be a number')
            .and('when delayed a little bit', 'to be within', 100, 110)
        ),
        'to be rejected with',
        'expected 123 to satisfy\n' +
          "expect.it('when delayed a little bit', 'to equal', 456)\n" +
          "      .or('when delayed a little bit', 'to be a string')\n" +
          "        .and('to be greater than', 100)\n" +
          "      .or('when delayed a little bit', 'to be a number')\n" +
          "        .and('when delayed a little bit', 'to be within', 100, 110)\n" +
          '\n' +
          '⨯ expected 123 when delayed a little bit to equal 456\n' +
          'or\n' +
          '⨯ expected 123 when delayed a little bit to be a string and\n' +
          '✓ expected 123 to be greater than 100\n' +
          'or\n' +
          "✓ expected 123 when delayed a little bit 'to be a number' and\n" +
          '⨯ expected 123 when delayed a little bit to be within 100, 110'
      );
    });
  });

  describe('with an array with non-numerical properties', () => {
    describe('satisfied exhaustively against an object', () => {
      it('should succeed', () => {
        var subject = [123];
        subject.foobar = 456;
        expect(subject, 'to exhaustively satisfy', {
          0: 123,
          foobar: 456
        });
      });

      it('should fail with a diff', () => {
        var subject = [123];
        subject.foobar = 456;
        expect(
          function() {
            expect(subject, 'to exhaustively satisfy', {
              0: 123,
              foobar: 987
            });
          },
          'to throw',
          'expected [ 123, foobar: 456 ] to exhaustively satisfy { 0: 123, foobar: 987 }\n' +
            '\n' +
            '[\n' +
            '  123,\n' +
            '  foobar: 456 // should equal 987\n' +
            ']'
        );
      });
    });

    describe('satisfied exhaustively against another array', () => {
      it('should succeed', () => {
        var subject = [123];
        subject.foobar = 456;

        var expected = [123];
        expected.foobar = 456;
        expect(subject, 'to exhaustively satisfy', expected);
      });

      it('should fail with a diff', () => {
        var subject = [2, 3, 1];
        subject.foo = 123;
        subject.bar = 456;
        subject.quux = {};

        var expected = [1, 2, 3];
        expected.bar = 456;
        expected.baz = 789;
        expected.quux = false;

        expect(
          function() {
            expect(subject, 'to satisfy', expected);
          },
          'to throw',
          'expected [ 2, 3, 1, foo: 123, bar: 456, quux: {} ]\n' +
            'to satisfy [ 1, 2, 3, bar: 456, baz: 789, quux: false ]\n' +
            '\n' +
            '[\n' +
            '┌─▷\n' +
            '│   2,\n' +
            '│   3,\n' +
            '└── 1, // should be moved\n' +
            '    foo: 123, // should be removed\n' +
            '    bar: 456,\n' +
            '    quux: {} // should equal false\n' +
            '    // missing baz: 789\n' +
            ']'
        );
      });
    });
  });

  it('should not break when trying to determine whether an object and null are structurally similar', () => {
    expect(
      function() {
        expect([{}], 'to satisfy', [null]);
      },
      'to throw',
      'expected [ {} ] to satisfy [ null ]\n' +
        '\n' +
        '[\n' +
        '  {} // should equal null\n' +
        ']'
    );
  });

  describe('with the exhaustively flag', () => {
    function Foo() {}
    Foo.prototype.isFoo = true;
    describe('matching on properties found in the prototype', () => {
      it('should succeed', () => {
        expect(new Foo(), 'to exhaustively satisfy', { isFoo: true });
      });

      it('should fail with a diff', () => {
        expect(
          function() {
            expect(new Foo(), 'to exhaustively satisfy', { isFoo: false });
          },
          'to throw',
          'expected Foo({}) to exhaustively satisfy { isFoo: false }\n' +
            '\n' +
            'Foo({\n' +
            '  isFoo: true // should equal false\n' +
            '})'
        );
      });
    });

    it('should consider a object with no own properties to be exhaustively satisfied by an empty object', () => {
      expect(new Foo(), 'to exhaustively satisfy', {});
    });

    describe('with a non-enumerable property', () => {
      var bar = {};
      Object.defineProperty(bar, 'nonEnumerable', {
        value: 'theValue',
        enumerable: false
      });

      describe('when matching the non-enumerable property', () => {
        it('should succeed', () => {
          expect(bar, 'to exhaustively satisfy', { nonEnumerable: 'theValue' });
        });

        it('should fail with a diff', () => {
          expect(
            function() {
              expect(bar, 'to exhaustively satisfy', {
                nonEnumerable: 'wrong'
              });
            },
            'to throw',
            "expected { nonEnumerable: 'theValue' }\n" +
              "to exhaustively satisfy { nonEnumerable: 'wrong' }\n" +
              '\n' +
              '{\n' +
              '  nonEnumerable:\n' +
              "    'theValue' // should equal 'wrong'\n" +
              '               //\n' +
              '               // -theValue\n' +
              '               // +wrong\n' +
              '}'
          );
        });
      });

      describe('when not matching the non-enumerable property', () => {
        it('should fail with a diff', () => {
          expect(
            function() {
              expect(bar, 'to exhaustively satisfy', {
                somethingElse: 'wrong'
              });
            },
            'to throw',
            "expected { nonEnumerable: 'theValue' }\n" +
              "to exhaustively satisfy { somethingElse: 'wrong' }\n" +
              '\n' +
              '{\n' +
              "  nonEnumerable: 'theValue' // should be removed\n" +
              "  // missing somethingElse: 'wrong'\n" +
              '}'
          );
        });
      });
    });
  });

  describe('when an unpresent value to is satisfied against an expect.it function wrapper', () => {
    it('should allow an unpresent value to be satisfied against the function', () => {
      expect({}, 'to satisfy', {
        foo: expect.it(v => {
          expect(v, 'to be undefined');
        })
      });
    });

    it('should fail when the function throws', () => {
      expect(
        () => {
          expect({}, 'to satisfy', {
            foo: expect.it(value => {
              expect(value, 'to be a string');
            })
          });
        },
        'to throw',
        err => {
          // Compensate for V8 5.1+ setting { foo: function () {} }.foo.name === 'foo'
          // http://v8project.blogspot.dk/2016/04/v8-release-51.html
          expect(
            err
              .getErrorMessage('text')
              .toString()
              .replace('function foo', 'function '),
            'to contain',
            '{\n' + '  // missing: foo: should be a string\n' + '}'
          );
        }
      );
    });
  });

  describe('when an unpresent value to is satisfied against an expect.it', () => {
    it('should succeed', () => {
      expect({}, 'to satisfy', { foo: expect.it('to be undefined') });
    });

    it('should fail with a diff', () => {
      expect(
        () => {
          expect({}, 'to satisfy', { foo: expect.it('to be a string') });
        },
        'to throw',
        "expected {} to satisfy { foo: expect.it('to be a string') }\n" +
          '\n' +
          '{\n' +
          '  // missing: foo: should be a string\n' +
          '}'
      );
    });
  });

  it('should not break when the assertion fails and there is a fulfilled function in the RHS', () => {
    expect(
      function() {
        expect({}, 'to satisfy', {
          bar: 123,
          foo: expect.it(v => {
            expect(v, 'to be undefined');
          })
        });
      },
      'to throw',
      function(err) {
        // Compensate for V8 5.1+ setting { foo: function () {} }.foo.name === 'foo'
        // http://v8project.blogspot.dk/2016/04/v8-release-51.html
        expect(
          err
            .getErrorMessage('text')
            .toString()
            .replace(/function foo/g, 'function '),
          'to satisfy',
          'expected {}\n' +
            "to satisfy { bar: 123, foo: expect.it(v => { expect(v, 'to be undefined'); }) }\n" +
            '\n' +
            '{\n' +
            '  // missing bar: 123\n' +
            "  // missing foo: should satisfy expect.it(v => { expect(v, 'to be undefined'); })\n" +
            '}'
        );
      }
    );
  });

  it('should render a diff when the function differs', () => {
    function myFunction() {}
    function myOtherFunction() {}

    expect(
      () => {
        expect({ foo: myFunction }, 'to satisfy', { foo: myOtherFunction });
      },
      'to throw',
      'expected { foo: function myFunction() {} }\n' +
        'to satisfy { foo: function myOtherFunction() {} }\n' +
        '\n' +
        '{\n' +
        '  foo: function myFunction() {} // expected { foo: function myFunction() {} }\n' +
        '                                // to satisfy { foo: function myOtherFunction() {} }\n' +
        '}'
    );
  });

  describe('when matching the constructor property of an object', () => {
    function Foo() {}

    // Fails because functions aren't modelled as objects:
    it.skip('should succeed', () => {
      expect(new Foo(), 'to satisfy', { constructor: { name: 'Foo' } });
    });

    it('fail with a diff', () => {
      expect(
        function() {
          expect(new Foo(), 'to satisfy', { constructor: 123 });
        },
        'to throw',
        'expected Foo({}) to satisfy { constructor: 123 }\n' +
          '\n' +
          'Foo({\n' +
          '  constructor: function Foo() {} // should equal 123\n' +
          '})'
      );
    });
  });

  it('should not break when the assertion fails and the subject has a property that also exists on Object.prototype', () => {
    expect(
      function() {
        expect({ constructor: 123 }, 'to satisfy', { foo: 456 });
      },
      'to throw',
      'expected { constructor: 123 } to satisfy { foo: 456 }\n' +
        '\n' +
        '{\n' +
        '  constructor: 123\n' +
        '  // missing foo: 456\n' +
        '}'
    );
  });
});
