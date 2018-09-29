/*global expect*/
describe('to have a value satisfying assertion', () => {
  it('requires a third argument', () => {
    expect(
      () => {
        expect([1, 2, 3], 'to have a value satisfying');
      },
      'to throw',
      'expected [ 1, 2, 3 ] to have a value satisfying\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have a value satisfying\n' +
        '  did you mean:\n' +
        '    <object> [not] to have a value [exhaustively] satisfying <any>\n' +
        '    <object> [not] to have a value [exhaustively] satisfying <assertion>'
    );
  });

  it('accepts objects as the subject', () => {
    expect(() => {
      expect({ foo: 1 }, 'to have a value satisfying', 'to be a number');
    }, 'not to throw');
  });

  it('accepts arrays as the subject', () => {
    expect(() => {
      expect([1], 'to have a value satisfying', 'to be a number');
    }, 'not to throw');
  });

  it('only accepts objects and arrays as the subject', () => {
    expect(
      () => {
        expect(42, 'to have a value satisfying', value => {});
      },
      'to throw',
      'expected 42 to have a value satisfying function (value) {}\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to have a value satisfying <function>\n' +
        '  did you mean:\n' +
        '    <object> [not] to have a value [exhaustively] satisfying <any>\n' +
        '    <object> [not] to have a value [exhaustively] satisfying <assertion>'
    );
  });

  it('fails if the given object is empty', () => {
    expect(
      () => {
        expect({}, 'to have a value satisfying', 'to be a number');
      },
      'to throw',
      'expected {} to have a value satisfying to be a number\n' +
        '  expected {} not to be empty'
    );
  });

  it('fails if the given array is empty', () => {
    expect(
      () => {
        expect([], 'to have a value satisfying', 'to be a number');
      },
      'to throw',
      'expected [] to have a value satisfying to be a number\n' +
        '  expected [] not to be empty'
    );
  });

  it('asserts that at least one value in the object satisfies the RHS expectation', () => {
    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'to have a value satisfying',
      'to be a number'
    );

    expect({ foo: '0', bar: 1 }, 'to have a value satisfying', value => {
      expect(value, 'to be a number');
    });

    expect(
      { foo: 0, bar: 'bar' },
      'to have a value satisfying',
      'not to be a number'
    );

    expect(
      { foo: { foo: 0 }, bar: { bar: 1 } },
      'to have a value satisfying',
      'to have a value satisfying',
      'to be a number'
    );
  });

  it('asserts that no values in the object satisfies the RHS expectation', () => {
    expect(
      { foo: 0, bar: 1, baz: 2, qux: 3 },
      'not to have a value satisfying',
      'to be a string'
    );

    expect({ foo: '0', bar: '1' }, 'not to have a value satisfying', value => {
      expect(value, 'to be a number');
    });

    expect(
      { foo: 0, bar: 1 },
      'not to have a value satisfying',
      'not to be a number'
    );

    expect(
      { foo: { foo: '0' }, bar: { bar: '1' } },
      'not to have a value satisfying',
      'to have a value satisfying',
      'to be a number'
    );
  });

  it("throws the correct error if none of the subject's values match the RHS expectation", () => {
    expect(
      () => {
        expect(
          { foo: 'foo', bar: 'bar' },
          'to have a value satisfying',
          expect.it('to be a number')
        );
      },
      'to throw',
      "expected { foo: 'foo', bar: 'bar' }\n" +
        "to have a value satisfying expect.it('to be a number')"
    );
  });

  it("throws the correct error, when negated, if any of the subject's values match the RHS expectation", () => {
    expect(
      () => {
        expect(
          { foo: 'foo', bar: 1 },
          'not to have a value satisfying',
          expect.it('to be a number')
        );
      },
      'to throw',
      "expected { foo: 'foo', bar: 1 }\n" +
        "not to have a value satisfying expect.it('to be a number')\n\n" +
        '{\n' +
        "  foo: 'foo',\n" +
        '  bar: 1 // should be removed\n' +
        '}'
    );
  });

  describe('delegating to an async assertion', () => {
    var clonedExpect = expect
      .clone()
      .addAssertion(
        'to be a number after a short delay',
        (expect, subject, delay) => {
          expect.errorMode = 'nested';

          return expect.promise(run => {
            setTimeout(
              run(() => {
                expect(subject, 'to be a number');
              }),
              1
            );
          });
        }
      );

    it('should succeed', () => {
      return clonedExpect(
        { 0: 1, 1: 2, 2: 3 },
        'to have a value satisfying',
        'to be a number after a short delay'
      );
    });
  });

  describe('with the exhaustively flag', () => {
    it('should succeed', () => {
      expect(
        [{ foo: 'bar', quux: 'baz' }],
        'to have a value exhaustively satisfying',
        { foo: 'bar', quux: 'baz' }
      );
    });

    it('should fail when the spec is not met only because of the "exhaustively" semantics', () => {
      expect(
        () => {
          expect(
            [{ foo: 'bar', quux: 'baz' }],
            'to have a value exhaustively satisfying',
            { foo: 'bar' }
          );
        },
        'to throw',
        "expected [ { foo: 'bar', quux: 'baz' } ]\n" +
          "to have a value exhaustively satisfying { foo: 'bar' }"
      );
    });
  });

  describe('with a subtype that overrides valueForKey()', () => {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'oneFooObject',
      base: 'object',
      identify: function(obj) {
        return obj && typeof 'object' && obj.foo === '';
      },
      valueForKey: function(obj, key) {
        if (key === 'foo') {
          return 1;
        }
        return obj[key];
      }
    });

    it('should process the value in "to have a value satisfying"', () => {
      expect(
        clonedExpect(
          { foo: '' },
          'to have a value satisfying',
          expect.it('to be a number')
        ),
        'to be fulfilled'
      );
    });
  });
});
