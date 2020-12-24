/* global expect, BigInt */
describe('greater than assertion', () => {
  it('assert >', () => {
    expect(3).toBeGreaterThan(2);
    expect(1).toBeAbove(0);
    expect('b').toBeGreaterThan('a');
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(0).toBeGreaterThan(0);
    }).toThrowException('expected 0 to be greater than 0');
  });

  it('refuses to compare NaN to a number', () => {
    expect(function () {
      expect(NaN).notToBeGreaterThan(1);
    }).toThrow(
      'expected NaN not to be greater than 1\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <NaN> not to be greater than <number>\n' +
        '  did you mean:\n' +
        '    <BigInt> [not] to be (greater than|above) <BigInt>\n' +
        '    <number> [not] to be (greater than|above) <number>\n' +
        '    <string> [not] to be (greater than|above) <string>'
    );
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts >', () => {
        expect(BigInt(3)).toBeGreaterThan(BigInt(2));
        expect(BigInt(1)).toBeAbove(BigInt(0));
      });

      it('throws when the assertion fails', () => {
        expect(function () {
          expect(BigInt(0)).toBeGreaterThan(BigInt(0));
        }).toThrowException('expected BigInt(0) to be greater than BigInt(0)');
      });

      it('refuses to compare a BigInt to a number', () => {
        expect(function () {
          expect(BigInt(123)).toBeGreaterThan(1);
        }).toThrow(
          'expected BigInt(123) to be greater than 1\n' +
            '  The assertion does not have a matching signature for:\n' +
            '    <BigInt> to be greater than <number>\n' +
            '  did you mean:\n' +
            '    <BigInt> [not] to be (greater than|above) <BigInt>\n' +
            '    <number> [not] to be (greater than|above) <number>\n' +
            '    <string> [not] to be (greater than|above) <string>'
        );
      });
    });
  }
});
