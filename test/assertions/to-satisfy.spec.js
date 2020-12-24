/* global expect */
describe('to satisfy assertion', () => {
  function toArguments() {
    return arguments;
  }

  it('passes when an object is tested against itself, even in the presence of circular references', () => {
    const circular = {};
    circular.loop = circular;
    expect(circular).toSatisfy(circular);
  });

  describe('with the not flag', () => {
    it('should succeed when the assertion fails without the not flag', () => {
      expect({ foo: 123 }).notToSatisfy({ foo: 456 });
    });

    it('should succeed when the assertion fails without the not flag, async case', () => {
      return expect({ foo: 123 }).notToSatisfy({
        foo: expect.it('when delayed a little bit', 'to equal', 456),
      });
    });

    it('should fail when a non-Unexpected error occurs', () => {
      expect(function () {
        expect({ foo: 123 }).notToSatisfy(
          expect.it(function () {
            throw new Error('foo');
          })
        );
      }).toThrow('foo');
    });

    it('should fail when the assertion succeeds', () => {
      expect(function () {
        expect({ foo: 123 }).notToSatisfy({ foo: 123 });
      }).toThrow('expected { foo: 123 } not to satisfy { foo: 123 }');
    });
  });

  describe('with an array satisfied against an object with a numeric property', () => {
    it('should succeed', () => {
      expect(['aa', 'bb', 'cc']).toSatisfy({ 2: /cc/ });
    });

    it('should fail', () => {
      expect(function () {
        expect(['aa', 'bb', 'cc']).toSatisfy({ 2: /quux/ });
      }).toThrow(
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
      expect(function () {
        expect({}).toSatisfy([]);
      }).toThrow('expected {} to satisfy []');
    });

    describe('when the array is nested inside an object', () => {
      it('should fail', () => {
        expect(function () {
          expect({ foo: {} }).toSatisfy({ foo: [] });
        }).toThrow(
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
      expect(function () {
        expect([]).toSatisfy([1, 2]);
      }).toThrow(
        'expected [] to satisfy [ 1, 2 ]\n' +
          '\n' +
          '[\n' +
          '  // missing 1\n' +
          '  // missing 2\n' +
          ']'
      );
    });

    it('should render missing object items nicely', () => {
      expect(function () {
        expect([]).toSatisfy([{ foo: true }, { baz: false }]);
      }).toThrow(
        'expected [] to satisfy [ { foo: true }, { baz: false } ]\n' +
          '\n' +
          '[\n' +
          '  // missing { foo: true }\n' +
          '  // missing { baz: false }\n' +
          ']'
      );
    });

    it('should render missing custom items nicely', () => {
      const clonedExpect = expect.clone();

      clonedExpect.addStyle('xuuqProperty', function (key, inspectedValue) {
        this.text('<')
          .appendInspected(key)
          .text('> --> ')
          .append(inspectedValue);
      });

      clonedExpect.addType({
        name: 'xuuq',
        base: 'object',
        identify: function (obj) {
          return obj && typeof 'object' && obj.quux === 'xuuq';
        },
        property: function (output, key, inspectedValue) {
          return output.xuuqProperty(key, inspectedValue);
        },
      });

      expect(function () {
        clonedExpect([]).toSatisfy([
          { quux: 'xuuq', foo: true },
          { quux: 'xuuq', baz: false },
        ]);
      }).toThrow(
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
      expect(function () {
        expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).toSatisfy([
          0,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
        ]);
      }).toThrow(
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

      expect(function () {
        expect([1, 2, 3, 4, 5, 6, 7, 8]).toSatisfy([
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
          11,
        ]);
      }).toThrow(
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
        expect(function () {
          expect([1, 2]).toSatisfy([
            expect.toBeANumber(),
            2,
            expect.toBeAString(),
          ]);
        }).toThrow(
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
        return expect(function () {
          expect(['a', 'b']).toSatisfy([expect.toEqual('b')]);
        }).toThrow(
          "expected [ 'a', 'b' ] to satisfy [ expect.it('to equal', 'b') ]\n" +
            '\n' +
            '[\n' +
            "  'a', // should be removed\n" +
            "  'b'\n" +
            ']'
        );
      });

      it('should render entries that do not satisfy the RHS entry', () => {
        return expect(function () {
          expect(['a', 'b']).toSatisfy(['e', expect.toEqual('c')]);
        }).toThrow(
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
        expect(function () {
          expect([1, 2, 3]).toSatisfy([1, 2]);
        }).toThrow(
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
        return expect(function () {
          return expect([1, 2]).toSatisfy([
            expect.it('when delayed a little bit', 'to be a number'),
            2,
            expect.it('when delayed a little bit', 'to be a string'),
          ]);
        }).toError(
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
        return expect(function () {
          return expect([1, 2, 3, 4, 5, 6]).toSatisfy([
            expect.it('when delayed a little bit', 'to be a number'),
            2,
            expect.it('when delayed a little bit', 'to be a string'),
            expect.it('when delayed a little bit', 'to be a boolean'),
            expect.it(
              'when delayed a little bit',
              'to be a regular expression'
            ),
            expect.it('when delayed a little bit', 'to be a function'),
          ]);
        }).toError(
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
        return expect(function () {
          return expect(['a', 'b']).toSatisfy([
            expect.it('when delayed a little bit', 'to equal', 'b'),
          ]);
        }).toError(
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
        return expect(function () {
          return expect(['a', 'b']).toSatisfy([
            'a',
            expect.it('when delayed a little bit', 'to equal', 'c'),
          ]);
        }).toError(
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
        return expect(function () {
          return expect([1, 2, 3]).toSatisfy([
            expect.it('when delayed a little bit', 'to be a number'),
            2,
          ]);
        }).toError(
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
      expect(function () {
        expect([]).toSatisfy({ 0: 1, 1: 2 });
      }).toThrow(
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

      const clonedExpect = expect.clone().addType({
        name: 'MyThing',
        base: 'object',
        identify(obj) {
          return obj instanceof MyThing;
        },
        getKeys() {
          return ['a', 'b'];
        },
      });

      expect(function () {
        clonedExpect(new MyThing(123, 456)).toExhaustivelySatisfy({
          a: 123,
          b: 654,
        });
      }).toThrow(
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
    expect(function () {
      expect({ foo: 'bar' }).toSatisfy({ foo: 'bar', baz: 123 });
    }).toThrow(
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
    expect(function () {
      expect({ bar: 123 }).toSatisfy({ foo: undefined, bar: 456 });
    }).toThrow(
      'expected { bar: 123 } to satisfy { foo: undefined, bar: 456 }\n' +
        '\n' +
        '{\n' +
        '  bar: 123 // should equal 456\n' +
        '}'
    );
  });

  it('ignores blacklisted properties in the diff', () => {
    const error = new Error('foo');
    error.description = 'qux';
    expect(function () {
      expect(error).toSatisfy(new Error('bar'));
    }).toThrow(
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
    expect(function () {
      expect({ foo: 'bar' }).toSatisfy({
        foo: 'bar',
        baz: expect.toEqual(123),
      });
    }).toThrow(
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
      expect('foo').toSatisfyAssertion().toEqual('foo');
    });

    it('should fail with a diff', () => {
      expect(function () {
        expect('foo').toSatisfyAssertion().toEqual('bar');
      }).toThrow("expected 'foo' to equal 'bar'\n" + '\n' + '-foo\n' + '+bar');
    });

    describe('and the exhaustively flag', () => {
      it('should succeed', () => {
        expect({ foo: 123 }).toExhaustivelySatisfyAssertion().toEqual({
          foo: 123,
        });
      });

      it('should fail with a diff', () => {
        expect(function () {
          expect({ foo: 123 })
            .toExhaustivelySatisfyAssertion()
            .toEqual({ foo: 456 });
        }).toThrow(
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
    expect(function () {
      expect({
        foo: 'foo',
      }).toSatisfy(
        expect.it(function (value) {
          throw new Error('Custom error');
        })
      );
    }).toThrow('Custom error');
  });

  it('forwards normal errors found in promise aggregate errors to the top level', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion('<any> to foo', function (expect, subject) {
        const promises = [
          clonedExpect.promise(function () {
            clonedExpect('foo').toEqual('bar');
          }),
          clonedExpect.promise(function () {
            return clonedExpect.promise.any([
              clonedExpect.promise(function () {
                clonedExpect('foo').toEqual('bar');
              }),
              clonedExpect.promise(function () {
                throw new Error('wat');
              }),
            ]);
          }),
        ];
        return expect.promise.all(promises).caught(() => {
          return clonedExpect.promise.settle(promises);
        });
      });

    expect(function () {
      return clonedExpect('foo', 'to foo');
    }).toThrow('wat');
  });

  describe('with a regexp satisfied against a regexp', () => {
    it('should succeed', () => {
      expect(/wat/gim).toSatisfy(/wat/gim);
    });

    it('should fail when the regular expressions have different sets of flags', () => {
      expect(function () {
        expect(/wat/im).toSatisfy(/wat/gi);
      }).toThrow(
        'expected /wat/im to satisfy /wat/gi\n' +
          '\n' +
          '-/wat/im\n' +
          '+/wat/gi'
      );
    });

    it('should fail when the regular expressions have different patterns', () => {
      expect(function () {
        expect(/foo/i).toSatisfy(/bar/i);
      }).toThrow(
        'expected /foo/i to satisfy /bar/i\n' + '\n' + '-/foo/i\n' + '+/bar/i'
      );
    });
  });

  describe('with a expect.it function wrapper', () => {
    it("succeeds if the function doesn't throw", () => {
      expect({ foo: 'bar' }).toSatisfy({
        foo: expect.it((v) => expect(v).toBeAString()),
      });
    });

    it('should fail with an diff if the function fails', () => {
      expect(() => {
        expect({ foo: 3 }).toSatisfy({
          foo: expect.it(function (v) {
            expect(v).toEqual(2);
          }),
        });
      }).toThrow(
        'expected { foo: 3 }\n' +
          "to satisfy { foo: expect.it(function (v) { expect(v, 'to equal', 2); }) }\n" +
          '\n' +
          '{\n' +
          '  foo: 3 // should equal 2\n' +
          '}'
      );
    });

    it('should handle nested diffs', () => {
      expect(() => {
        expect({ foo: { bar: 'baz' } }).toSatisfy({
          foo: expect.it(function (v) {
            expect(v).toEqual({ bar: 'qux' });
          }),
        });
      }).toThrow(
        "expected { foo: { bar: 'baz' } } to satisfy\n" +
          '{\n' +
          '  foo: expect.it(function (v) {\n' +
          "         expect(v, 'to equal', { bar: 'qux' });\n" +
          '       })\n' +
          '}\n' +
          '\n' +
          '{\n' +
          '  foo: {\n' +
          "    bar: 'baz' // should equal 'qux'\n" +
          '               //\n' +
          '               // -baz\n' +
          '               // +qux\n' +
          '  }\n' +
          '}'
      );
    });

    it('should handle nested diffs with async parts', () =>
      expect(() =>
        expect(
          { foo: { bar: 'baz' }, number: 123 },
          'when delayed a little bit',
          'to satisfy',
          {
            foo: expect.it(function (v) {
              expect(v).toEqual({ bar: 'qux' });
            }),
            number: expect.it('when delayed a little bit', 'to equal', 987),
          }
        )
      ).toError(
        "expected { foo: { bar: 'baz' }, number: 123 } when delayed a little bit\n" +
          'to satisfy {\n' +
          '  foo: expect.it(function (v) {\n' +
          "         expect(v, 'to equal', { bar: 'qux' });\n" +
          '       }),\n' +
          "  number: expect.it('when delayed a little bit', 'to equal', 987)\n" +
          '}\n' +
          '\n' +
          '{\n' +
          '  foo: {\n' +
          "    bar: 'baz' // should equal 'qux'\n" +
          '               //\n' +
          '               // -baz\n' +
          '               // +qux\n' +
          '  },\n' +
          '  number: 123 // expected: when delayed a little bit to equal 987\n' +
          '}'
      ));
  });

  describe('with a synchronous expect.it in the RHS object', () => {
    it('should support an object with a property value of expect.it', () => {
      expect({ foo: 'bar' }).toSatisfy({
        foo: expect.toBeAString(),
      });
    });

    it('should support passing an array value to an expect.it', () => {
      expect({ foo: [123] }).toSatisfy({
        foo: expect.toHaveItemsSatisfying().toBeANumber(),
      });
    });

    it('should not call functions in the LHS object', () => {
      expect({
        foo() {
          throw new Error('Explosion');
        },
      }).toSatisfy({
        foo: expect.toBeAFunction(),
      });
    });

    it('should succeed with an or group where the first assertion passes and the second one fails', () => {
      return expect(2).toSatisfy(expect.toEqual(2).or('to equal', 1));
    });

    it('should succeed with an or group where the first one fails and the second assertion passes', () => {
      return expect(1).toSatisfy(expect.toEqual(2).or('to equal', 1));
    });

    it('should succeed with an or group where both assertions pass', () => {
      return expect(1).toSatisfy(expect.toEqual(2).or('to equal', 1));
    });

    it('should fail with an or group where both assertions fail', () => {
      expect(function () {
        expect(3).toSatisfy(expect.toEqual(2).or('to equal', 1));
      }).toThrow(
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
      return expect({ foo: 'bar' }).toSatisfy({
        foo: expect.it('when delayed a little bit', 'to be a string'),
      });
    });

    it('should support passing an array value to an expect.it', () => {
      return expect({ foo: [123] }).toSatisfy({
        foo: expect.it(
          'when delayed a little bit',
          'to have items satisfying',
          'to be a number'
        ),
      });
    });

    it('should succeed with an or group where the first assertion passes and the second one fails', () => {
      return expect(2).toSatisfy(
        expect
          .it('when delayed a little bit', 'to equal', 2)
          .or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should succeed with an or group where the first one fails and the second assertion passes', () => {
      return expect(1).toSatisfy(
        expect
          .it('when delayed a little bit', 'to equal', 2)
          .or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should succeed with an or group where the first one fails synchronously and the second assertion passes asynchronously', () => {
      return expect(1).toSatisfy(
        expect.toEqual(2).or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should succeed with an or group where the first one fails asynchronously and the second assertion passes synchronously', () => {
      return expect(1).toSatisfy(
        expect.it('when delayed a little bit', 'to equal', 2).or('to equal', 1)
      );
    });

    it('should succeed with an or group where both assertions pass', () => {
      return expect(1).toSatisfy(
        expect
          .it('when delayed a little bit', 'to equal', 2)
          .or('when delayed a little bit', 'to equal', 1)
      );
    });

    it('should fail with an or group where both assertions fail asynchronously', () => {
      return expect(
        expect(3).toSatisfy(
          expect
            .it('when delayed a little bit', 'to equal', 2)
            .or('when delayed a little bit', 'to equal', 1)
        )
      ).toBeRejectedWith(
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
        expect(3).toSatisfy(
          expect.toEqual(2).or('when delayed a little bit', 'to equal', 1)
        )
      ).toBeRejectedWith(
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
        expect(3).toSatisfy(
          expect
            .it('when delayed a little bit', 'to equal', 2)
            .or('to equal', 1)
        )
      ).toBeRejectedWith(
        'expected 3 to satisfy\n' +
          "expect.it('when delayed a little bit', 'to equal', 2)\n" +
          "      .or('to equal', 1)\n" +
          '\n' +
          '⨯ expected 3 when delayed a little bit to equal 2 or\n' +
          '⨯ expected 3 to equal 1'
      );
    });
  });

  describe('with an expect.it and customised types', () => {
    function Foo(thing) {
      this.thing = thing;
    }
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'Foo',
      identify(obj) {
        return obj instanceof Foo;
      },
      inspect(obj, depth, output) {
        output.text('Foo', 'green');
      },
    });

    clonedExpect.addAssertion(
      '<Foo> to satisfy <object>',
      (expect, subject, value) => {
        return expect.withError(
          () => expect(subject.thing).toSatisfy(value.thing),
          (err) => {
            expect.fail({
              diff: (output, diff, inspect, equal) => {
                output.text('-- custom diff --', 'yellow').nl(2);

                const thingDiff = err.getDiff(output);
                if (thingDiff) {
                  output.append(thingDiff);
                }

                return output;
              },
            });
          }
        );
      }
    );

    it('should handle async diffs with nested parts', () =>
      expect(() =>
        clonedExpect(new Foo({ foo: 123 })).toSatisfy({
          thing: expect.it('when delayed a little bit', 'to equal', {
            foo: 787,
          }),
        })
      ).toError(
        'expected Foo\n' +
          "to satisfy { thing: expect.it('when delayed a little bit', 'to equal', { foo: 787 }) }\n" +
          '\n' +
          '-- custom diff --\n' +
          '\n' +
          'expected { foo: 123 } when delayed a little bit to equal { foo: 787 }\n' +
          '\n' +
          '{\n' +
          '  foo: 123 // should equal 787\n' +
          '}'
      ));
  });

  it('should support diffs in the error report', () => {
    expect(function () {
      expect('foo').toSatisfy(expect.toEqual('bar').or('to equal', 'baz'));
    }).toThrow(
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
    expect(function () {
      expect('bar').toSatisfy(expect.toBeANumber());
    }).toThrow(
      "expected 'bar' to satisfy expect.it('to be a number')\n" +
        '\n' +
        "expected 'bar' to be a number"
    );
  });

  it('should support regular expressions in the RHS object', () => {
    expect({ foo: 'bar' }).toSatisfy({
      foo: /ba/,
    });

    expect(function () {
      expect({ foo: 'foo' }).toSatisfy({
        foo: /f00/,
      });
    }).toThrow(
      "expected { foo: 'foo' } to satisfy { foo: /f00/ }\n" +
        '\n' +
        '{\n' +
        "  foo: 'foo' // should match /f00/\n" +
        '}'
    );

    expect(function () {
      expect({ foo: 'foo' }).toSatisfy({
        foo: expect.notToMatch(/oo/),
      });
    }).toThrow(
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
    expect({ foo: [123] }).toSatisfy({
      foo: [expect.toBeANumber()],
    });
  });

  it('should support directly naming other assertions', () => {
    expect(123).toSatisfyAssertion().toBeANumber();
  });

  it('should support delegating to itself as a weird noop', () => {
    expect(123)
      .toSatisfyAssertion()
      .toSatisfyAssertion()
      .toSatisfyAssertion()
      .toBeANumber();
  });

  describe('with an expect.it in the RHS object', () => {
    it('should throw an exception if the condition is not met', () => {
      expect({ foo: 123 }).toSatisfy(
        expect.it(function (obj) {
          expect(obj.foo).toEqual(123);
        })
      );
    });

    it('should only consider functions that are identified as functions by the type system', () => {
      const clonedExpect = expect.clone().addType({
        name: 'functionStartingWithF',
        identify(obj) {
          return (
            typeof obj === 'function' && obj.toString().match(/^function\s*f/)
          );
        },
      });

      function foo() {
        throw new Error('argh, do not call me');
      }

      clonedExpect(foo).toSatisfy(foo);
      clonedExpect({ foo }).toSatisfy({ foo });
    });
  });

  describe('on Error instances', () => {
    it('should support satisfying against an Error instance', () => {
      expect(new Error('foo')).toSatisfy(new Error('foo'));
    });

    it('should support satisfying against a primitive', () => {
      expect(function () {
        expect(new Error('foo')).toSatisfy(123);
      }).toThrow("expected Error('foo') to satisfy 123");
    });

    it('should support satisfying against an Error instance when the subject has additional properties', () => {
      const err = new Error('foo');
      err.bar = 123;
      expect(err).toSatisfy(new Error('foo'));
    });

    it('should not consider errors with different constructors to satisfy each other, even if all properties are identical', () => {
      expect(function () {
        expect(new Error('foo')).toSatisfy(new TypeError('foo'));
      }).toThrow("expected Error('foo') to satisfy TypeError('foo')");
    });

    it('should support satisfying against an object', () => {
      expect(new Error('foo')).toSatisfy({ message: 'foo' });
    });

    describe('in "exhaustively" mode', () => {
      it('should succeed', () => {
        expect(new Error('foo')).toExhaustivelySatisfy({ message: 'foo' });
      });

      describe('should fail with a diff', () => {
        it('when satisfying against an object', () => {
          const err = new Error('foo');
          err.bar = 123;
          expect(function () {
            expect(err).toExhaustivelySatisfy({ message: 'foo' });
          }).toThrow(
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
          const error = new Error('foobar');
          error.data = { foo: 'bar' };
          expect(function () {
            expect(error).toExhaustivelySatisfy(new Error('foobar'));
          }).toThrow(
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
        expect({ foo: undefined }).toExhaustivelySatisfy({});
      });

      it('should treat a missing subject property the same as a value property of undefined', () => {
        expect({}).toExhaustivelySatisfy({ foo: undefined });
      });

      // Regression test for #380
      it('should display a proper error message when a missing key is satisfied against an expect.it', () => {
        expect(function () {
          expect({}).toExhaustivelySatisfy({
            foo: expect.toBeUndefined(),
          });
        }).toThrow(
          "expected {} to exhaustively satisfy { foo: expect.it('to be undefined') }\n" +
            '\n' +
            '{\n' +
            "  // missing foo: should satisfy expect.it('to be undefined')\n" +
            '}'
        );
      });
    });

    it('should support satisfying against a regexp', () => {
      expect(new Error('foo')).toSatisfy(/foo/);
    });

    describe('when satisfying against an expect.it-wrapped function', () => {
      it('should succeed if the function does not throw', () => {
        expect(new Error('foo')).toSatisfy(
          expect.it(function (err) {
            expect(err).toBeAn(Error);
          })
        );
      });

      it('fails when the function throws', () => {
        expect(function () {
          expect(new Error('Custom message')).toSatisfy(
            expect.it(function (err) {
              expect(err).toBeA(TypeError);
            })
          );
        }).toThrow("expected Error('Custom message') to be a TypeError");
      });
    });
  });

  if (typeof Buffer !== 'undefined') {
    describe('on Buffer instances', () => {
      it('should assert equality', () => {
        expect(Buffer.from([1, 2, 3])).toSatisfy(Buffer.from([1, 2, 3]));
      });

      it('should fail with a binary diff when the assertion fails', () => {
        expect(function () {
          expect(Buffer.from([1, 2, 3])).toSatisfy(Buffer.from([1, 2, 4]));
        }).toThrow(
          'expected Buffer.from([0x01, 0x02, 0x03]) to equal Buffer.from([0x01, 0x02, 0x04])\n' +
            '\n' +
            '-01 02 03                                         │...│\n' +
            '+01 02 04                                         │...│'
        );
      });

      describe('with expect.it', () => {
        it('should succeed', () => {
          expect(Buffer.from('bar')).toSatisfy(
            expect.toEqual(Buffer.from('bar'))
          );
        });

        it('should fail with a diff', () => {
          expect(function () {
            expect(Buffer.from('bar')).toSatisfy(
              expect.toEqual(Buffer.from('foo'))
            );
          }).toThrow(
            'expected Buffer.from([0x62, 0x61, 0x72])\n' +
              "to satisfy expect.it('to equal', Buffer.from([0x66, 0x6F, 0x6F]))\n" +
              '\n' +
              'expected Buffer.from([0x62, 0x61, 0x72]) to equal Buffer.from([0x66, 0x6F, 0x6F])\n' +
              '\n' +
              '-62 61 72                                         │bar│\n' +
              '+66 6F 6F                                         │foo│'
          );
        });
      });

      it('should satisfy a function', () => {
        expect(Buffer.from('bar')).toSatisfy(
          expect.it(function (buffer) {
            expect(buffer).toHaveLength(3);
          })
        );
      });

      describe('in an async setting', () => {
        it('should succeed', () => {
          return expect(Buffer.from([0, 1, 2])).toSatisfy(
            expect.it(
              'when delayed a little bit',
              'to equal',
              Buffer.from([0, 1, 2])
            )
          );
        });

        it('should fail with a diff', () => {
          return expect(
            expect(Buffer.from([0, 1, 2])).toSatisfy(
              expect.it(
                'when delayed a little bit',
                'to equal',
                Buffer.from([2, 1, 0])
              )
            )
          ).toBeRejectedWith(
            'expected Buffer.from([0x00, 0x01, 0x02])\n' +
              "to satisfy expect.it('when delayed a little bit', 'to equal', Buffer.from([0x02, 0x01, 0x00]))\n" +
              '\n' +
              'expected Buffer.from([0x00, 0x01, 0x02])\n' +
              'when delayed a little bit to equal Buffer.from([0x02, 0x01, 0x00])\n' +
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
        expect(new Uint8Array([1, 2, 3])).toSatisfy(new Uint8Array([1, 2, 3]));
      });

      it('fail with a binary diff when the assertion fails', () => {
        expect(function () {
          expect(new Uint8Array([1, 2, 3])).toSatisfy(
            new Uint8Array([1, 2, 4])
          );
        }).toThrow(
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
      const subject = { nextLevel: {} };
      Object.defineProperty(subject.nextLevel, 'getMe', {
        get() {
          return 'got me';
        },
        enumerable: false,
      });

      expect(subject).toSatisfy({
        nextLevel: {
          getMe: 'got me',
        },
      });
    });
  });

  describe('on array-like', () => {
    it('should diff correctly against an array on the right hand side', () => {
      expect(function () {
        expect(toArguments({ foo: 'foo' }, 2, 3)).toSatisfy([{ foo: 'f00' }]);
      }).toThrow(
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

    it('should support context correctly with expect.it (numerical)', () => {
      function Greeter(folks) {
        this.push(...(folks || []));

        this.greet = function (prefix) {
          return prefix + this.join(' & ');
        };
      }

      Greeter.prototype = [];

      const clonedExpect = expect.clone();
      clonedExpect.addType({
        name: 'Greeter',
        base: 'array-like',
        identify: (obj) => obj instanceof Greeter,
      });

      const expected = ['Alice', 'Bob'];
      expected.greet = expect
        .whenCalledWith(['Hello, '])
        .toEqual('Hello, Alice & Bob');

      clonedExpect(new Greeter(['Alice', 'Bob'])).toSatisfy(expected);
    });

    it('should support context correctly with expect.it (non-numerical)', () => {
      function Greeter(folks) {
        this.push(...(folks || []));

        this.greet = function (prefix) {
          return prefix + this.join(' & ');
        };
      }

      Greeter.prototype = [];

      const clonedExpect = expect.clone();
      clonedExpect.addType({
        name: 'Greeter',
        base: 'array-like',
        identify: (obj) => obj instanceof Greeter,
        numericalPropertiesOnly: false,
      });

      const expected = ['Alice', 'Bob'];
      expected.greet = expect
        .whenCalledWith(['Hello, '])
        .toEqual('Hello, Alice & Bob');

      clonedExpect(new Greeter(['Alice', 'Bob'])).toSatisfy(expected);
    });
  });

  describe('on arrays', () => {
    it('should require all indices to be present in the subject', () => {
      expect([1, 2, 3]).toSatisfy([1, 2, 3]);
    });

    it('should produce a diff when an undefined item in the subject is found at a position outside of the value array', () => {
      expect(function () {
        expect([undefined]).toSatisfy([]);
      }).toThrow(
        'expected [ undefined ] to satisfy []\n' +
          '\n' +
          '[\n' +
          '  undefined // should be removed\n' +
          ']'
      );
    });

    it('should produce a diff when the value has more items than the subject', () => {
      expect(function () {
        expect([]).toSatisfy([undefined]);
      }).toThrow(
        'expected [] to satisfy [ undefined ]\n' +
          '\n' +
          '[\n' +
          '  // missing undefined\n' +
          ']'
      );
    });

    it('should fail if the value does not include all the indices of the subject', () => {
      expect(function () {
        expect([1, 2, 3]).toSatisfy([1, 2]);
      }).toThrow(
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
      expect(function () {
        expect([1, 2, 3]).toSatisfy([1, 2, 3, 4]);
      }).toThrow(
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

    it('handles multi-line items correctly', () => {
      class Box {
        constructor(value) {
          this.value = value;
        }
      }

      const clonedExpect = expect.clone().addType({
        name: 'box',
        identify: (value) => value && value instanceof Box,
        inspect: (box, depth, output, inspect) =>
          output.block((output) => {
            output.text('╔═══╗').nl();
            output.text(`║ ${box.value} ║`).nl();
            output.text('╚═══╝');
          }),
        equal: (a, b, equal) => a.value === b.value,
      });

      expect(() => {
        clonedExpect([
          new Box(0),
          new Box(1),
          new Box(2),
          new Box(4),
          new Box(3),
        ]).toSatisfy([new Box(1), new Box(0), new Box(2), new Box(3)]);
      }).toThrow(
        `\
        expected
        [
          ╔═══╗
          ║ 0 ║
          ╚═══╝,
          ╔═══╗
          ║ 1 ║
          ╚═══╝,
          ╔═══╗
          ║ 2 ║
          ╚═══╝,
          ╔═══╗
          ║ 4 ║
          ╚═══╝,
          ╔═══╗
          ║ 3 ║
          ╚═══╝
        ]
        to satisfy
        [
          ╔═══╗
          ║ 1 ║
          ╚═══╝,
          ╔═══╗
          ║ 0 ║
          ╚═══╝,
          ╔═══╗
          ║ 2 ║
          ╚═══╝,
          ╔═══╗
          ║ 3 ║
          ╚═══╝
        ]

        [
          ╔═══╗  // should equal ╔═══╗
          ║ 0 ║  //              ║ 1 ║
          ╚═══╝, //              ╚═══╝
          ╔═══╗  // should equal ╔═══╗
          ║ 1 ║  //              ║ 0 ║
          ╚═══╝, //              ╚═══╝
          ╔═══╗
          ║ 2 ║
          ╚═══╝,
          ╔═══╗  // should equal ╔═══╗
          ║ 4 ║  //              ║ 3 ║
          ╚═══╝, //              ╚═══╝
          ╔═══╗ // should be removed
          ║ 3 ║
          ╚═══╝
        ]`.replace(/^ {8}/gm, '')
      );
    });
  });

  it('should render a missing item expected to satisfy an expect.it', () => {
    expect(function () {
      expect([]).toSatisfy([expect.toBeFalsy()]);
    }).toThrow(
      "expected [] to satisfy [ expect.it('to be falsy') ]\n" +
        '\n' +
        '[\n' +
        "  // missing: expect.it('to be falsy')\n" +
        ']'
    );
  });

  it('should support a chained expect.it', () => {
    expect({ foo: 123 }).toSatisfy({
      foo: expect.toBeANumber().and('to be greater than', 10),
    });

    expect(function () {
      expect({ foo: 123 }).toSatisfy({
        foo: expect.toBeANumber().and('to be greater than', 200),
      });
    }).toThrow(
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
    expect({ foo: 123 }).toSatisfy({
      bar: expect.toBeUndefined(),
    });
  });

  it('should assert missing properties with undefined in the RHS object', () => {
    expect({ foo: 123 }).toSatisfy({
      bar: undefined,
    });
  });

  it('should support the exhaustively flag', () => {
    expect({ foo: 123 }).toExhaustivelySatisfy({ foo: 123 });
  });

  it('should support delegating to itself with the exhaustively flag', () => {
    expect({ foo: { bar: 123 }, baz: 456 }).toSatisfy({
      foo: expect.toExhaustivelySatisfy({ bar: 123 }),
    });
  });

  it('should support delegating to itself without the exhaustively flag', () => {
    expect({ foo: { bar: 123, baz: 456 } }).toExhaustivelySatisfy({
      foo: expect.toSatisfy({ bar: 123 }),
    });
  });

  it('should not fail when matching an object against a number', () => {
    expect({ foo: {} }).notToSatisfy({ foo: 123 });
  });

  it('fails when comparing errors that do not have the same message', () => {
    expect(function () {
      expect(new Error('foo')).toSatisfy(new Error('bar'));
    }).toThrowException(
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
    expect(function () {
      expect(new Error('foo')).toSatisfy(/bar/);
    }).toThrowException("expected Error('foo') to satisfy /bar/");
  });

  it('fails when using an unknown assertion', () => {
    expect(function () {
      expect({ bool: 'true' }).toSatisfy({
        bool: expect.toBeTrue(),
      });
    }).toThrowException(
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
    expect(function () {
      expect(new Error('foo')).toSatisfy({ message: 'bar' });
    }).toThrowException(
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
    expect(function () {
      expect(new Foo('bar')).toSatisfy({ value: 'quux' });
    }).toThrowException(
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
    expect(function () {
      expect({
        pill: {
          red: "I'll show you how deep the rabbit hole goes",
          blue: {
            ignorance: {
              of: { illusion: { will: { not: { lead: 'to the truth' } } } },
            },
          },
          purple: {
            you: 'wat there is another pill',
            them: 'there is always more choices',
          },
        },
      }).toSatisfy({
        pill: {
          red: "I'll show you how deep the rabbit hole goes.",
          blue: {
            ignorance: {
              of: { illusion: { will: { not: { lead: 'to the truth' } } } },
            },
          },
        },
      });
    }).toThrow(
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
    const str = 'abcdefghijklmnopqrstuvwxyz';
    expect(function () {
      expect({ foo: { a: str, b: str, c: str, d: str, e: str } }).toEqual({});
    }).toThrow(
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
    const str = 'abcdefghijklmnopqrstuvwxyz';
    expect(function () {
      expect({
        foo: { a: str, b: str, c: str, d: str, e: str },
        bar: 1,
      }).toEqual({ foo: { a: str, b: str, c: str, d: str, e: str } });
    }).toThrow(
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
    let clonedExpect;

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
        },
      });
    });

    it('should inspect multiline block values in diffs correctly', () => {
      expect(function () {
        clonedExpect.addType({
          base: 'number',
          name: 'numberBox',
          identify(obj) {
            return typeof obj === 'number' && obj > 0 && obj < 10;
          },
          inspect(obj, depth, output) {
            return output.block(function () {
              this.text('+-+').nl().text(`|${obj}|`).nl().text('|_|');
            });
          },
        });
        clonedExpect({ foo: 2, bar: 'baz' }).toSatisfy({ bar: 'quux' });
      }).toThrow(
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
      expect(function () {
        expect({ foo: { bar: 123 } }).toSatisfy({ foo: { bar: /d/ } });
      }).toThrow(
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
      expect(function () {
        expect({ diff: 123, inline: 456 }).toSatisfy({
          diff: 321,
          inline: 654,
        });
      }).toThrow(
        'expected { diff: 123, inline: 456 } to satisfy { diff: 321, inline: 654 }\n' +
          '\n' +
          '{\n' +
          '  diff: 123, // should equal 321\n' +
          '  inline: 456 // should equal 654\n' +
          '}'
      );
    });

    it('should support satisfy agaist the unwrapped object with nested expect.it', () => {
      clonedExpect(new MysteryBox({ baz: 123 })).toSatisfy({
        baz: expect.toBeANumber(),
      });
    });

    it('should delegate to the "to satisfies" assertion defined for the custom type', () => {
      clonedExpect({
        foo: new MysteryBox({ baz: 123, quux: 987 }),
        bar: new MysteryBox(456),
      }).toSatisfy({
        foo: { baz: clonedExpect.toBeANumber() },
        bar: 456,
      });
    });

    it('should preserve the "exhaustively" flag when matching inside instances of the custom type', () => {
      expect(function () {
        clonedExpect({
          foo: new MysteryBox({ baz: 123, quux: 987 }),
        }).toExhaustivelySatisfy({
          foo: { baz: clonedExpect.toBeANumber() },
        });
      }).toThrow(
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
      expect(function () {
        clonedExpect({
          foo: new MysteryBox({ baz: 123, quux: 987 }),
        }).toSatisfy({
          foo: { baz: clonedExpect.notToBeANumber() },
        });
      }).toThrow(
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
      expect(function () {
        clonedExpect({
          foo: new MysteryBox({ baz: 123, quux: 987 }),
        }).toExhaustivelySatisfy({
          foo: new MysteryBox({ baz: clonedExpect.toBeANumber() }),
        });
      }).toThrow(
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
      clonedExpect({
        foo: new MysteryBox({ baz: 123 }),
        bar: new MysteryBox(456),
      }).toSatisfy({
        foo: new MysteryBox({ baz: clonedExpect.toBeANumber() }),
        bar: new MysteryBox(456),
      });
    });

    it('should fail to match', () => {
      expect(function () {
        clonedExpect({
          foo: new MysteryBox('abc'),
        }).toSatisfy({
          foo: 'def',
        });
      }).toThrow(
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
      expect(function () {
        clonedExpect({
          foo: new MysteryBox('abc'),
        }).toSatisfy({
          foo: new MysteryBox('def'),
        });
      }).toThrow(
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
    expect(123).notToSatisfyAssertion().toBeAString();

    expect('foobar').notToSatisfy(/quux/i);

    expect({ foo: 123 }).notToSatisfy({
      foo: expect.toBeAString(),
    });

    expect({ foo: 123, bar: 456 }).notToExhaustivelySatisfy({ foo: 123 });

    expect({ foo: 123 }).notToExhaustivelySatisfy({ bar: undefined });
  });

  it('fails when the assertion fails', () => {
    expect(function () {
      expect(123).toSatisfyAssertion().toBeAString();
    }).toThrow();

    expect(function () {
      expect('foobar').toSatisfy(/quux/i);
    }).toThrow("expected 'foobar' to match /quux/i");

    // FIXME: Could this error message be improved?
    expect(function () {
      expect({ foo: 123 }).toSatisfy({
        foo: expect.toBeAString(),
      });
    }).toThrow(
      "expected { foo: 123 } to satisfy { foo: expect.it('to be a string') }\n" +
        '\n' +
        '{\n' +
        '  foo: 123 // should be a string\n' +
        '}'
    );

    expect(function () {
      expect({ foo: 123, bar: 456 }).toExhaustivelySatisfy({ foo: 123 });
    }).toThrow();

    expect(function () {
      expect({ foo: 123 }).toExhaustivelySatisfy({ bar: undefined });
    }).toThrow();
  });

  describe('when delegating to async assertions', () => {
    const clonedExpect = expect
      .clone()
      .addAssertion(
        '<any> to be a number after a short delay',
        function (expect, subject) {
          expect.errorMode = 'nested';

          return expect.promise(function (run) {
            setTimeout(
              run(function () {
                expect(subject).toBeANumber();
              }),
              1
            );
          });
        }
      );

    it('returns a promise that is resolved if the assertion succeeds', () => {
      return clonedExpect(42).toSatisfy(
        clonedExpect.it('to be a number after a short delay')
      );
    });

    it('returns a promise that is rejected if the assertion fails', () => {
      return expect(
        clonedExpect('wat').toSatisfy(
          clonedExpect.it('to be a number after a short delay')
        )
      ).toBeRejectedWith(
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
        )
      ).toBeRejectedWith(
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
        expect(123).toSatisfy(
          expect
            .it('when delayed a little bit', 'to equal', 456)
            .or('when delayed a little bit', 'to be a string')
            .and('to be greater than', 100)
            .or('when delayed a little bit', 'to be a number')
            .and('when delayed a little bit', 'to be within', 100, 110)
        )
      ).toBeRejectedWith(
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
        const subject = [123];
        subject.foobar = 456;
        expect(subject).toExhaustivelySatisfy({
          0: 123,
          foobar: 456,
        });
      });

      it('should fail with a diff', () => {
        const subject = [123];
        subject.foobar = 456;
        expect(function () {
          expect(subject).toExhaustivelySatisfy({
            0: 123,
            foobar: 987,
          });
        }).toThrow(
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
        const subject = [123];
        subject.foobar = 456;

        const expected = [123];
        expected.foobar = 456;
        expect(subject).toExhaustivelySatisfy(expected);
      });

      it('should fail with a diff', () => {
        const subject = [2, 3, 1];
        subject.foo = 123;
        subject.bar = 456;
        subject.quux = {};

        const expected = [1, 2, 3];
        expected.bar = 456;
        expected.baz = 789;
        expected.quux = false;

        expect(function () {
          expect(subject).toSatisfy(expected);
        }).toThrow(
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
    expect(function () {
      expect([{}]).toSatisfy([null]);
    }).toThrow(
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
        expect(new Foo()).toExhaustivelySatisfy({ isFoo: true });
      });

      it('should fail with a diff', () => {
        expect(function () {
          expect(new Foo()).toExhaustivelySatisfy({ isFoo: false });
        }).toThrow(
          'expected Foo({}) to exhaustively satisfy { isFoo: false }\n' +
            '\n' +
            'Foo({\n' +
            '  isFoo: true // should equal false\n' +
            '})'
        );
      });
    });

    it('should consider a object with no own properties to be exhaustively satisfied by an empty object', () => {
      expect(new Foo()).toExhaustivelySatisfy({});
    });

    describe('with a non-enumerable property', () => {
      const bar = {};
      Object.defineProperty(bar, 'nonEnumerable', {
        value: 'theValue',
        enumerable: false,
      });

      describe('when matching the non-enumerable property', () => {
        it('should succeed', () => {
          expect(bar).toExhaustivelySatisfy({ nonEnumerable: 'theValue' });
        });

        it('should fail with a diff', () => {
          expect(function () {
            expect(bar).toExhaustivelySatisfy({
              nonEnumerable: 'wrong',
            });
          }).toThrow(
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
          expect(function () {
            expect(bar).toExhaustivelySatisfy({
              somethingElse: 'wrong',
            });
          }).toThrow(
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
      expect({}).toSatisfy({
        foo: expect.it((v) => {
          expect(v).toBeUndefined();
        }),
      });
    });

    it('should fail when the function throws', () => {
      expect(() => {
        expect({}).toSatisfy({
          foo: expect.it((value) => {
            expect(value).toBeAString();
          }),
        });
      }).toThrow(
        expect.it((err) => {
          // Compensate for V8 5.1+ setting { foo: function () {} }.foo.name === 'foo'
          // http://v8project.blogspot.dk/2016/04/v8-release-51.html
          expect(
            err
              .getErrorMessage('text')
              .toString()
              .replace('function foo', 'function ')
          ).toContain('{\n' + '  // missing: foo: should be a string\n' + '}');
        })
      );
    });
  });

  describe('when an unpresent value to is satisfied against an expect.it', () => {
    it('should succeed', () => {
      expect({}).toSatisfy({ foo: expect.toBeUndefined() });
    });

    it('should fail with a diff', () => {
      expect(() => {
        expect({}).toSatisfy({ foo: expect.toBeAString() });
      }).toThrow(
        "expected {} to satisfy { foo: expect.it('to be a string') }\n" +
          '\n' +
          '{\n' +
          '  // missing: foo: should be a string\n' +
          '}'
      );
    });
  });

  it('should not break when the assertion fails and there is a fulfilled, expect.it-wrapped function in the RHS', () => {
    expect(() => {
      expect({}).toSatisfy({
        bar: 123,
        foo: expect.it(function (v) {
          expect(v).toBeUndefined();
        }),
      });
    }).toThrow(
      expect.it((err) => {
        // Compensate for V8 5.1+ setting { foo: function () {} }.foo.name === 'foo'
        // http://v8project.blogspot.dk/2016/04/v8-release-51.html
        expect(
          err
            .getErrorMessage('text')
            .toString()
            .replace(/function foo/g, 'function ')
        ).toSatisfy(
          'expected {} to satisfy\n' +
            '{\n' +
            '  bar: 123,\n' +
            "  foo: expect.it(function (v) { expect(v, 'to be undefined'); })\n" +
            '}\n' +
            '\n' +
            '{\n' +
            '  // missing bar: 123\n' +
            "  // missing foo: should satisfy expect.it(function (v) { expect(v, 'to be undefined'); })\n" +
            '}'
        );
      })
    );
  });

  it('should render a diff when the function differs', () => {
    function myFunction() {}
    function myOtherFunction() {}

    expect(() => {
      expect({ foo: myFunction }).toSatisfy({ foo: myOtherFunction });
    }).toThrow(
      'expected { foo: function myFunction() {} }\n' +
        'to satisfy { foo: function myOtherFunction() {} }\n' +
        '\n' +
        '{\n' +
        '  foo: function myFunction() {} // should be function myOtherFunction() {}\n' +
        '}'
    );
  });

  describe('when matching the constructor property of an object', () => {
    function Foo() {}

    // Fails because functions aren't modelled as objects:
    it.skip('should succeed', () => {
      expect(new Foo()).toSatisfy({ constructor: { name: 'Foo' } });
    });

    it('fail with a diff', () => {
      expect(function () {
        expect(new Foo()).toSatisfy({ constructor: 123 });
      }).toThrow(
        'expected Foo({}) to satisfy { constructor: 123 }\n' +
          '\n' +
          'Foo({\n' +
          '  constructor: function Foo() {} // should equal 123\n' +
          '})'
      );
    });
  });

  it('should not break when the assertion fails and the subject has a property that also exists on Object.prototype', () => {
    expect(function () {
      expect({ constructor: 123 }).toSatisfy({ foo: 456 });
    }).toThrow(
      'expected { constructor: 123 } to satisfy { foo: 456 }\n' +
        '\n' +
        '{\n' +
        '  constructor: 123\n' +
        '  // missing foo: 456\n' +
        '}'
    );
  });

  describe('with a function subject', function () {
    function foo() {}
    function bar() {}
    foo.baz = 123;

    describe('against a function', function () {
      it('should succeed', function () {
        expect(foo).toSatisfy(foo);
        expect({ foo }).toSatisfy({ foo });
      });

      it('should fail without a diff', function () {
        expect(function () {
          expect(foo).toSatisfy(bar);
        }).toThrow('expected function foo() {} to be function bar() {}');
      });
    });

    describe('against an object', function () {
      it('should succeed', function () {
        expect(foo).toSatisfy({ baz: 123 });
      });

      it('should fail with an object diff', function () {
        expect(function () {
          expect(foo).toSatisfy({ baz: 456 });
        }).toThrow(
          'expected function foo() {} to satisfy { baz: 456 }\n' +
            '\n' +
            'Function({\n' +
            '  baz: 123 // should equal 456\n' +
            '})'
        );
      });
    });
  });

  describe('with an object subject', function () {
    describe('satisfied against a function not wrapped in expect.it', function () {
      it('should fail', () => {
        expect(() => expect({}).toSatisfy(function () {})).toThrow(
          'expected {} to satisfy function () {}'
        );
      });
    });
  });

  it('should not dereference properties that are not being asserted on', function () {
    expect({
      get ohNo() {
        throw new Error('argh');
      },
      foo: 123,
    }).toSatisfy({ foo: 123 });
  });
});
