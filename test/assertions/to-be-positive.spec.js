/* global expect, BigInt */
describe('positive assertion', () => {
  it('asserts that a number is positive', () => {
    expect(3).toBePositive();
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(0).toBePositive();
    }).toThrowException('expected 0 to be positive');
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts that a number is positive', () => {
        expect(BigInt(3)).toBePositive();
      });

      it('throws when the assertion fails', () => {
        expect(function () {
          expect(BigInt(0)).toBePositive();
        }).toThrowException('expected BigInt(0) to be positive');
      });
    });
  }
});
