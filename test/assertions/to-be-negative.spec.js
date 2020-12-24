/* global expect, BigInt */
describe('negative assertion', () => {
  it('asserts that a number is negative', () => {
    expect(-1).toBeNegative();
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(0).toBeNegative();
    }).toThrowException('expected 0 to be negative');
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts that a number is negative', () => {
        expect(BigInt(-1)).toBeNegative();
      });

      it('throws when the assertion fails', () => {
        expect(function () {
          expect(BigInt(0)).toBeNegative();
        }).toThrowException('expected BigInt(0) to be negative');
      });
    });
  }
});
