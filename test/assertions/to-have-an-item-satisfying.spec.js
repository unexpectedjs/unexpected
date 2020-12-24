/* global expect */
describe('to have an item satisfying assertion', () => {
  it('requires a third argument', () => {
    expect(function () {
      expect([1, 2, 3]).toHaveAnItemSatisfying();
    }).toThrow(
      'expected [ 1, 2, 3 ] to have an item satisfying\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <array> to have an item satisfying\n' +
        '  did you mean:\n' +
        '    <array-like> [not] to have an item [exhaustively] satisfying <any>\n' +
        '    <array-like> [not] to have an item [exhaustively] satisfying <assertion>'
    );
  });

  it('only accepts arrays as the subject', () => {
    expect(function () {
      expect(42).toHaveAnItemSatisfying().toBeANumber();
    }).toThrow(
      "expected 42 to have an item satisfying 'to be a number'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <number> to have an item satisfying <string>\n' +
        '  did you mean:\n' +
        '    <array-like> [not] to have an item [exhaustively] satisfying <any>\n' +
        '    <array-like> [not] to have an item [exhaustively] satisfying <assertion>'
    );
  });

  it('fails if the given array is empty', () => {
    expect(function () {
      expect([]).toHaveAnItemSatisfying().toBeANumber();
    }).toThrow(
      'expected [] to have an item satisfying to be a number\n' +
        '  expected [] not to be empty'
    );
  });

  it('asserts that at least one item in the array satisfies the RHS expectation', () => {
    expect(['foo', 1]).toHaveAnItemSatisfying().toBeANumber();

    expect(['foo', 1]).toHaveAnItemSatisfying().toBeANumber();

    expect([0, 1, 'foo', 2]).toHaveAnItemSatisfying().notToBeANumber();

    expect([[1], [2]])
      .toHaveAnItemSatisfying()
      .toHaveAnItemSatisfying()
      .toBeANumber();
  });

  it('asserts that no items in the array satisfies the RHS expectation', () => {
    expect(['foo', 'bar']).notToHaveAnItemSatisfying().toBeANumber();

    expect(['foo', 'bar']).notToHaveAnItemSatisfying(
      expect.it(function (item) {
        expect(item).toBeANumber();
      })
    );

    expect([0, 1, 42, 2]).notToHaveAnItemSatisfying().notToBeANumber();

    expect([['bar'], ['bar']])
      .notToHaveAnItemSatisfying()
      .toHaveAnItemSatisfying()
      .toBeANumber();
  });

  it("throws the correct error if none of the subject's values match the RHS expectation", () => {
    expect(function () {
      expect(['foo', 'bar']).toHaveAnItemSatisfying(expect.toBeANumber());
    }).toThrow(
      "expected [ 'foo', 'bar' ] to have an item satisfying expect.it('to be a number')"
    );
  });

  it("throws the correct error, when negated, if any of the subject's values match the RHS expectation", () => {
    expect(function () {
      expect(['foo', 1]).notToHaveAnItemSatisfying(expect.toBeANumber());
    }).toThrow(
      "expected [ 'foo', 1 ] not to have an item satisfying expect.it('to be a number')\n\n" +
        '[\n' +
        "  'foo',\n" +
        '  1 // should be removed\n' +
        ']'
    );
  });

  it('formats non-Unexpected errors correctly', () => {
    expect(function () {
      expect([
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      ]).toHaveAnItemSatisfying(function (item) {
        expect.fail(function (output) {
          output.text('foo').nl().text('bar');
        });
      });
    }).toThrow(
      'expected\n' +
        '[\n' +
        '  [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ]\n' +
        ']\n' +
        'to have an item satisfying\n' +
        'function (item) {\n' +
        '  expect.fail(function (output) {\n' +
        "    output.text('foo').nl().text('bar');\n" +
        '  });\n' +
        '}'
    );
  });

  describe('delegating to an async assertion', () => {
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

    it('should succeed', () => {
      return clonedExpect([1, 2, 3]).toHaveAnItemSatisfying(
        'to be a number after a short delay'
      );
    });
  });

  describe('with the exhaustively flag', () => {
    it('should succeed', () => {
      expect([{ foo: 'bar', quux: 'baz' }]).toHaveAnItemExhaustivelySatisfying({
        foo: 'bar',
        quux: 'baz',
      });
    });

    it('should fail when the spec is not met only because of the "exhaustively" semantics', () => {
      expect(function () {
        expect([
          { foo: 'bar', quux: 'baz' },
        ]).toHaveAnItemExhaustivelySatisfying({ foo: 'bar' });
      }).toThrow(
        "expected [ { foo: 'bar', quux: 'baz' } ]\n" +
          "to have an item exhaustively satisfying { foo: 'bar' }"
      );
    });
  });
});
