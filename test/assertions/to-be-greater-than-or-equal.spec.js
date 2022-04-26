/* global expect, BigInt */
describe('greater than or equal assertion', () => {
  it('asserts >=', () => {
    expect(3, 'to be greater than or equal to', 2);
    expect(2, 'to be greater than or equal to', 2);
    expect('a', 'to be greater than or equal to', 'a');
    expect('b', 'to be greater than or equal to', 'a');
  });

  it('throws when the assertion fails', () => {
    expect(
      function () {
        expect(-1, 'to be greater than or equal to', 0);
      },
      'to throw exception',
      'expected -1 to be greater than or equal to 0'
    );
  });

  if (typeof BigInt === 'function') {
    describe('with BigInt', function () {
      it('asserts >=', () => {
        expect(BigInt(3), 'to be greater than or equal to', BigInt(2));
        expect(BigInt(2), 'to be greater than or equal to', BigInt(2));
      });

      it('throws when the assertion fails', () => {
        expect(
          function () {
            expect(BigInt(-1), 'to be greater than or equal to', BigInt(0));
          },
          'to throw exception',
          'expected -1n to be greater than or equal to 0n'
        );
      });

      it('refuses to compare a BigInt to a number', () => {
        expect(
          function () {
            expect(BigInt(-1), 'to be greater than or equal to', 0);
          },
          'to throw',
          'expected -1n to be greater than or equal to 0\n' +
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
