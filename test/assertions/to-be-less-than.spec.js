/* global expect, BigInt */
describe('less than assertion', () => {
  it('asserts <', () => {
    expect(0).toBeLessThan(4);
    expect(0).toBeBelow(1);
    expect('a').toBeLessThan('b');
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(0).toBeLessThan(0);
    }).toThrowException('expected 0 to be less than 0');
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts <', () => {
        expect(BigInt(0)).toBeLessThan(BigInt(4));
        expect(BigInt(0)).toBeBelow(BigInt(1));
      });

      it('throws when the assertion fails', () => {
        expect(function () {
          expect(BigInt(0)).toBeLessThan(BigInt(0));
        }).toThrowException('expected BigInt(0) to be less than BigInt(0)');
      });

      it('refuses to compare to a number', () => {
        expect(function () {
          expect(BigInt(0)).toBeLessThan(1);
        }).toThrowException(
          'expected BigInt(0) to be less than 1\n' +
            '  The assertion does not have a matching signature for:\n' +
            '    <BigInt> to be less than <number>\n' +
            '  did you mean:\n' +
            '    <BigInt> [not] to be (less than|below) <BigInt>\n' +
            '    <number> [not] to be (less than|below) <number>\n' +
            '    <string> [not] to be (less than|below) <string>'
        );
      });
    });
  }
});
