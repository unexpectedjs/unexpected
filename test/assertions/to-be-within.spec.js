/* global expect, BigInt */
describe('within assertion', () => {
  it('asserts a number within a range', () => {
    expect(0, 'to be within', 0, 4);
    expect(1, 'to be within', 0, 4);
    expect(4, 'to be within', 0, 4);
    expect('b', 'to be within', 'a', 'c');
    expect(-1, 'not to be within', 0, 4);
    expect(5, 'not to be within', 0, 4);
    expect('z', 'not to be within', 'a', 'c');
  });

  it('throws when the assertion fails', () => {
    expect(
      function () {
        expect(4, 'not to be within', 0, 4);
      },
      'to throw exception',
      'expected 4 not to be within 0..4'
    );
    expect(
      function () {
        expect(null, 'not to be within', 0, 4);
      },
      'to throw exception',
      'expected null not to be within 0, 4\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <null> not to be within <number> <number>\n' +
        '  did you mean:\n' +
        '    <BigInt> [not] to be within <BigInt> <BigInt>\n' +
        '    <number> [not] to be within <number> <number>\n' +
        '    <string> [not] to be within <string> <string>'
    );
  });

  it('throws with the correct error message when the end points are strings', () => {
    expect(
      function () {
        expect('a', 'to be within', 'c', 'd');
      },
      'to throw exception',
      "expected 'a' to be within 'c'..'d'"
    );
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts a number within a range', () => {
        expect(BigInt(0), 'to be within', BigInt(0), BigInt(4));
        expect(BigInt(1), 'to be within', BigInt(0), BigInt(4));
        expect(BigInt(4), 'to be within', BigInt(0), BigInt(4));
      });

      it('throws when the assertion fails', () => {
        expect(
          function () {
            expect(BigInt(4), 'not to be within', BigInt(0), BigInt(4));
          },
          'to throw exception',
          'expected BigInt(4) not to be within BigInt(0)..BigInt(4)'
        );
      });

      it('refuses to compare a BigInt to a number', () => {
        expect(
          function () {
            expect(BigInt(123), 'to be within', 100, 200);
          },
          'to throw',
          'expected BigInt(123) to be within 100, 200\n' +
            '  The assertion does not have a matching signature for:\n' +
            '    <BigInt> to be within <number> <number>\n' +
            '  did you mean:\n' +
            '    <BigInt> [not] to be within <BigInt> <BigInt>\n' +
            '    <number> [not] to be within <number> <number>\n' +
            '    <string> [not] to be within <string> <string>'
        );
      });
    });
  }
});
