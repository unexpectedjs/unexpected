/*global expect*/
describe('to be finite assertion', () => {
  it('asserts a finite number', () => {
    expect(123, 'to be finite');
    expect(0, 'to be finite');
    expect(Infinity, 'not to be finite');
    expect(-Infinity, 'not to be finite');
  });

  it('refuses to work on NaN', () => {
    expect(
      () => {
        expect(NaN, 'not to be finite');
      },
      'to throw',
      'expected NaN not to be finite\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <NaN> not to be finite\n' +
        '  did you mean:\n' +
        '    <number> [not] to be finite'
    );
  });

  it('throws when the assertion fails', () => {
    expect(
      () => {
        expect(Infinity, 'to be finite');
      },
      'to throw exception',
      'expected Infinity to be finite'
    );
  });
});
