/* global expect */
describe('to be finite assertion', () => {
  it('asserts a finite number', () => {
    expect(123).toBeFinite();
    expect(0).toBeFinite();
    expect(Infinity).notToBeFinite();
    expect(-Infinity).notToBeFinite();
  });

  it('refuses to work on NaN', () => {
    expect(function () {
      expect(NaN).notToBeFinite();
    }).toThrow(
      'expected NaN not to be finite\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <NaN> not to be finite\n' +
        '  did you mean:\n' +
        '    <number> [not] to be finite'
    );
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(Infinity).toBeFinite();
    }).toThrowException('expected Infinity to be finite');
  });
});
