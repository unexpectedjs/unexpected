/* global expect, BigInt */
describe('greater than or equal assertion', () => {
  it('asserts >=', () => {
    expect(3).toBeGreaterThanOrEqualTo(2);
    expect(2).toBeGreaterThanOrEqualTo(2);
    expect('a').toBeGreaterThanOrEqualTo('a');
    expect('b').toBeGreaterThanOrEqualTo('a');
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(-1).toBeGreaterThanOrEqualTo(0);
    }).toThrowException('expected -1 to be greater than or equal to 0');
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts >=', () => {
        expect(BigInt(3)).toBeGreaterThanOrEqualTo(BigInt(2));
        expect(BigInt(2)).toBeGreaterThanOrEqualTo(BigInt(2));
      });

      it('throws when the assertion fails', () => {
        expect(function () {
          expect(BigInt(-1)).toBeGreaterThanOrEqualTo(BigInt(0));
        }).toThrowException(
          'expected BigInt(-1) to be greater than or equal to BigInt(0)'
        );
      });

      it('refuses to compare a BigInt to a number', () => {
        expect(function () {
          expect(BigInt(-1)).toBeGreaterThanOrEqualTo(0);
        }).toThrow(
          'expected BigInt(-1) to be greater than or equal to 0\n' +
            '  The assertion does not have a matching signature for:\n' +
            '    <BigInt> to be greater than or equal to <number>\n' +
            '  did you mean:\n' +
            '    <BigInt> [not] to be greater than or equal to <BigInt>\n' +
            '    <number> [not] to be greater than or equal to <number>\n' +
            '    <string> [not] to be greater than or equal to <string>'
        );
      });
    });
  }
});
