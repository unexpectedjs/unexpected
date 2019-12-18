/* global expect, BigInt */
describe('less than or equal assertion', () => {
  it('asserts <=', () => {
    expect(0, 'to be less than or equal to', 4);
    expect(0, 'to be less than or equal to', 0);
    expect('a', 'to be less than or equal to', 'a');
    expect('a', 'to be less than or equal to', 'b');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(0, 'to be less than or equal to', -1);
      },
      'to throw exception',
      'expected 0 to be less than or equal to -1'
    );
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function() {
      it('asserts <=', () => {
        expect(BigInt(0), 'to be less than or equal to', BigInt(4));
        expect(BigInt(0), 'to be less than or equal to', BigInt(0));
      });

      it('throws when the assertion fails', () => {
        expect(
          function() {
            expect(BigInt(0), 'to be less than or equal to', BigInt(-1));
          },
          'to throw exception',
          'expected BigInt(0) to be less than or equal to BigInt(-1)'
        );
      });

      it('refuses to compare a BigInt to a number', () => {
        expect(
          function() {
            expect(BigInt(123), 'to be less than or equal to', 1);
          },
          'to throw',
          'expected BigInt(123) to be less than or equal to 1\n' +
            '  The assertion does not have a matching signature for:\n' +
            '    <BigInt> to be less than or equal to <number>\n' +
            '  did you mean:\n' +
            '    <BigInt> [not] to be less than or equal to <BigInt>\n' +
            '    <number> [not] to be less than or equal to <number>\n' +
            '    <string> [not] to be less than or equal to <string>'
        );
      });
    });
  }
});
