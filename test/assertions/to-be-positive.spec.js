/* global expect, BigInt */
describe('positive assertion', () => {
  it('asserts that a number is positive', () => {
    expect(3, 'to be positive');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(0, 'to be positive');
      },
      'to throw exception',
      'expected 0 to be positive'
    );
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function() {
      it('asserts that a number is positive', () => {
        expect(BigInt(3), 'to be positive');
      });

      it('throws when the assertion fails', () => {
        expect(
          function() {
            expect(BigInt(0), 'to be positive');
          },
          'to throw exception',
          'expected BigInt(0) to be positive'
        );
      });
    });
  }
});
