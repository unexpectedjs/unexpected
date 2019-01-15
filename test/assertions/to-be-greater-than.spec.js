/* global expect */
describe('greater than assertion', () => {
  it('assert >', () => {
    expect(3, 'to be greater than', 2);
    expect(1, 'to be above', 0);
    expect('b', 'to be greater than', 'a');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(0, 'to be greater than', 0);
      },
      'to throw exception',
      'expected 0 to be greater than 0'
    );
  });

  it('refuses to compare NaN to a number', () => {
    expect(
      function() {
        expect(NaN, 'not to be greater than', 1);
      },
      'to throw',
      'expected NaN not to be greater than 1\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <NaN> not to be greater than <number>\n' +
        '  did you mean:\n' +
        '    <number> [not] to be (greater than|above) <number>\n' +
        '    <string> [not] to be (greater than|above) <string>'
    );
  });
});
