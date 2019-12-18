/* global expect, BigInt */
describe('less than assertion', () => {
  it('asserts <', () => {
    expect(0, 'to be less than', 4);
    expect(0, 'to be below', 1);
    expect('a', 'to be less than', 'b');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(0, 'to be less than', 0);
      },
      'to throw exception',
      'expected 0 to be less than 0'
    );
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function() {
      it('asserts <', () => {
        expect(BigInt(0), 'to be less than', BigInt(4));
        expect(BigInt(0), 'to be below', BigInt(1));
      });

      it('throws when the assertion fails', () => {
        expect(
          function() {
            expect(BigInt(0), 'to be less than', BigInt(0));
          },
          'to throw exception',
          'expected BigInt(0) to be less than BigInt(0)'
        );
      });

      it('refuses to compare to a number', () => {
        expect(
          function() {
            expect(BigInt(0), 'to be less than', 1);
          },
          'to throw exception',
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
