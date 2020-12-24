/* global expect, BigInt */
describe('within assertion', () => {
  it('asserts a number within a range', () => {
    expect(0).toBeWithin(0, 4);
    expect(1).toBeWithin(0, 4);
    expect(4).toBeWithin(0, 4);
    expect('b').toBeWithin('a', 'c');
    expect(-1).notToBeWithin(0, 4);
    expect(5).notToBeWithin(0, 4);
    expect('z').notToBeWithin('a', 'c');
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(4).notToBeWithin(0, 4);
    }).toThrowException('expected 4 not to be within 0..4');
    expect(function () {
      expect(null).notToBeWithin(0, 4);
    }).toThrowException(
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
    expect(function () {
      expect('a').toBeWithin('c', 'd');
    }).toThrowException("expected 'a' to be within 'c'..'d'");
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts a number within a range', () => {
        expect(BigInt(0)).toBeWithin(BigInt(0), BigInt(4));
        expect(BigInt(1)).toBeWithin(BigInt(0), BigInt(4));
        expect(BigInt(4)).toBeWithin(BigInt(0), BigInt(4));
      });

      it('throws when the assertion fails', () => {
        expect(function () {
          expect(BigInt(4)).notToBeWithin(BigInt(0), BigInt(4));
        }).toThrowException(
          'expected BigInt(4) not to be within BigInt(0)..BigInt(4)'
        );
      });

      it('refuses to compare a BigInt to a number', () => {
        expect(function () {
          expect(BigInt(123)).toBeWithin(100, 200);
        }).toThrow(
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
