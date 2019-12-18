/* global expect, BigInt */
describe('negative assertion', () => {
  it('asserts that a number is negative', () => {
    expect(-1, 'to be negative');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(0, 'to be negative');
      },
      'to throw exception',
      'expected 0 to be negative'
    );
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function() {
      it('asserts that a number is negative', () => {
        expect(BigInt(-1), 'to be negative');
      });

      it('throws when the assertion fails', () => {
        expect(
          function() {
            expect(BigInt(0), 'to be negative');
          },
          'to throw exception',
          'expected BigInt(0) to be negative'
        );
      });
    });
  }
});
